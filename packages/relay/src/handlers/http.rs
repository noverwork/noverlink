//! HTTP handler for public traffic proxying

use std::sync::Arc;
use std::time::Duration;

use anyhow::Result;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::{TcpListener, TcpStream};
use tokio::time::timeout;
use tracing::{error, info, warn};

use crate::registry::{TunnelMessage, TunnelRegistry};

/// Start HTTP listener for public traffic
pub async fn start_http_server(port: u16, registry: Arc<TunnelRegistry>) -> Result<()> {
    let addr = format!("0.0.0.0:{}", port);
    let listener = TcpListener::bind(&addr).await?;

    info!("HTTP listener started on {}", addr);

    loop {
        match listener.accept().await {
            Ok((stream, client_addr)) => {
                let registry = Arc::clone(&registry);
                tokio::spawn(async move {
                    if let Err(e) = handle_http_request(stream, registry).await {
                        error!("HTTP handler error from {}: {}", client_addr, e);
                    }
                });
            }
            Err(e) => {
                error!("Failed to accept HTTP connection: {}", e);
            }
        }
    }
}

async fn handle_http_request(mut stream: TcpStream, registry: Arc<TunnelRegistry>) -> Result<()> {
    let peer = stream.peer_addr()?;

    // Read full HTTP request
    let (buf, headers_end) = read_http_headers(&mut stream).await?;

    // Parse and extract host (include \r\n\r\n for httparse)
    let headers_slice = buf.get(..headers_end + 4).ok_or_else(|| {
        anyhow::anyhow!("Headers end position out of bounds")
    })?;
    let host = parse_and_extract_host(headers_slice, &mut stream).await?;

    info!("HTTP request for host: {} from {}", host, peer);

    // Find tunnel for this domain
    let Some(tunnel) = registry.get(&host) else {
        send_no_tunnel_response(&mut stream, &host).await?;
        return Ok(());
    };

    // Read full request including body
    let full_request = read_full_request(&mut stream, buf, headers_end).await?;

    // Forward request to CLI and get response
    forward_to_tunnel(&mut stream, tunnel, &registry, full_request, &host).await?;

    Ok(())
}

/// Read HTTP headers from stream
async fn read_http_headers(stream: &mut TcpStream) -> Result<(Vec<u8>, usize)> {
    let mut buf = Vec::with_capacity(4096);
    let mut total_read = 0;

    // Read until we have complete headers
    loop {
        if total_read >= 8192 {
            stream
                .write_all(b"HTTP/1.1 431 Request Header Fields Too Large\r\n\r\n")
                .await?;
            anyhow::bail!("Headers too large");
        }

        buf.resize(total_read + 1024, 0);

        let read_buf = buf.get_mut(total_read..).ok_or_else(|| {
            anyhow::anyhow!("Buffer indexing error")
        })?;

        let n = match timeout(Duration::from_secs(10), stream.read(read_buf)).await {
            Ok(Ok(n)) if n > 0 => n,
            Ok(Ok(_)) => {
                warn!("Client closed connection before sending headers");
                anyhow::bail!("Connection closed");
            }
            Ok(Err(e)) => return Err(e.into()),
            Err(_) => {
                stream
                    .write_all(b"HTTP/1.1 408 Request Timeout\r\n\r\n")
                    .await?;
                anyhow::bail!("Read timeout");
            }
        };

        total_read += n;

        let header_slice = buf.get(..total_read).ok_or_else(|| {
            anyhow::anyhow!("Buffer slicing error")
        })?;

        if let Some(pos) = find_headers_end(header_slice) {
            return Ok((buf, pos));
        }
    }
}

/// Parse HTTP request and extract host header
async fn parse_and_extract_host(headers_buf: &[u8], stream: &mut TcpStream) -> Result<String> {
    let mut headers = [httparse::EMPTY_HEADER; 64];
    let mut req = httparse::Request::new(&mut headers);

    match req.parse(headers_buf)? {
        httparse::Status::Complete(_) => {
            let host = req
                .headers
                .iter()
                .find(|h| h.name.eq_ignore_ascii_case("host"))
                .and_then(|h| std::str::from_utf8(h.value).ok())
                .map(|h| h.split(':').next().unwrap_or(h).to_string());

            let Some(host) = host else {
                stream
                    .write_all(b"HTTP/1.1 400 Bad Request\r\n\r\nNo Host header\r\n")
                    .await?;
                anyhow::bail!("No Host header");
            };

            Ok(host)
        }
        httparse::Status::Partial => {
            stream
                .write_all(b"HTTP/1.1 400 Bad Request\r\n\r\nIncomplete headers\r\n")
                .await?;
            anyhow::bail!("Incomplete headers");
        }
    }
}

/// Send 502 response when no tunnel is found
async fn send_no_tunnel_response(stream: &mut TcpStream, host: &str) -> Result<()> {
    let response = format!(
        "HTTP/1.1 502 Bad Gateway\r\n\
         Content-Type: text/plain\r\n\
         Content-Length: 52\r\n\
         \r\n\
         No tunnel registered for domain: {}",
        host
    );
    stream.write_all(response.as_bytes()).await?;
    Ok(())
}

/// Read full HTTP request including body
async fn read_full_request(
    stream: &mut TcpStream,
    mut buf: Vec<u8>,
    headers_end: usize,
) -> Result<Vec<u8>> {
    let mut headers = [httparse::EMPTY_HEADER; 64];
    let mut req = httparse::Request::new(&mut headers);

    let headers_slice = buf.get(..headers_end + 4).ok_or_else(|| {
        anyhow::anyhow!("Headers end position out of bounds")
    })?;
    req.parse(headers_slice)?;

    let content_length = req
        .headers
        .iter()
        .find(|h| h.name.eq_ignore_ascii_case("content-length"))
        .and_then(|h| std::str::from_utf8(h.value).ok())
        .and_then(|v| v.parse::<usize>().ok())
        .unwrap_or(0);

    let total_length = headers_end + 4 + content_length;
    let mut total_read = buf.len();

    while total_read < total_length {
        buf.resize(total_length, 0);

        let read_buf = buf.get_mut(total_read..).ok_or_else(|| {
            anyhow::anyhow!("Buffer indexing error during body read")
        })?;

        let n = stream.read(read_buf).await?;
        if n == 0 {
            break;
        }
        total_read += n;
    }

    buf.truncate(total_read);
    Ok(buf)
}

/// Forward request to tunnel and handle response
async fn forward_to_tunnel(
    stream: &mut TcpStream,
    tunnel: Arc<crate::registry::Tunnel>,
    registry: &Arc<TunnelRegistry>,
    request_data: Vec<u8>,
    host: &str,
) -> Result<()> {
    let (response_tx, mut response_rx) = tokio::sync::mpsc::channel(1);

    let request_id = registry.next_request_id();

    // Register pending request in registry
    registry.register_pending_request(request_id, response_tx.clone());

    let tunnel_msg = TunnelMessage {
        request_id,
        request_data,
        response_tx,
    };

    if let Err(e) = tunnel.request_tx.send(tunnel_msg).await {
        error!("Failed to send request to tunnel: {}", e);
        stream
            .write_all(b"HTTP/1.1 504 Gateway Timeout\r\n\r\nCLI not responding\r\n")
            .await?;
        return Ok(());
    }

    match timeout(Duration::from_secs(30), response_rx.recv()).await {
        Ok(Some(response_data)) => {
            stream.write_all(&response_data).await?;
            stream.flush().await?;
            info!("HTTP request for {} completed", host);
        }
        Ok(None) => {
            stream
                .write_all(b"HTTP/1.1 502 Bad Gateway\r\n\r\nCLI disconnected\r\n")
                .await?;
        }
        Err(_) => {
            stream
                .write_all(b"HTTP/1.1 504 Gateway Timeout\r\n\r\nRequest timeout\r\n")
                .await?;
        }
    }

    Ok(())
}

/// Find the end of HTTP headers (\r\n\r\n)
fn find_headers_end(buf: &[u8]) -> Option<usize> {
    buf.windows(4).position(|w| w == b"\r\n\r\n")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_headers_end() {
        let req = b"GET / HTTP/1.1\r\nHost: example.com\r\n\r\nBody";
        assert_eq!(find_headers_end(req), Some(33));

        let incomplete = b"GET / HTTP/1.1\r\nHost: example.com\r\n";
        assert_eq!(find_headers_end(incomplete), None);
    }
}
