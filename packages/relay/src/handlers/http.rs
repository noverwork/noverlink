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

    // Extract subdomain (first part before first dot)
    // e.g., "yzn0.localhost" -> "yzn0"
    let subdomain = host.split('.').next().unwrap_or(&host).to_string();

    // Find tunnel for this subdomain
    let Some(tunnel) = registry.get(&subdomain) else {
        send_no_tunnel_response(&mut stream, &host).await?;
        return Ok(());
    };

    // Check if this is a WebSocket upgrade request
    let headers_slice = buf.get(..headers_end + 4).ok_or_else(|| {
        anyhow::anyhow!("Headers end position out of bounds")
    })?;

    if is_websocket_upgrade(headers_slice) {
        info!("WebSocket upgrade request detected for {}", host);
        let full_request = buf[..headers_end + 4].to_vec();
        return handle_websocket_proxy(stream, tunnel, &registry, full_request, &subdomain).await;
    }

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

/// Handle WebSocket proxy connection
async fn handle_websocket_proxy(
    mut stream: TcpStream,
    tunnel: Arc<crate::registry::Tunnel>,
    registry: &Arc<TunnelRegistry>,
    upgrade_request: Vec<u8>,
    subdomain: &str,
) -> Result<()> {
    // Generate unique connection ID
    let connection_id = registry.next_ws_connection_id();
    info!("Starting WebSocket proxy: {} for {}", connection_id, subdomain);

    // Register pending WebSocket and get channels
    let (mut upgrade_response_rx, mut frame_rx) = registry.register_pending_websocket(connection_id.clone());

    // Send WebSocket upgrade request to CLI
    let upgrade_msg = TunnelMessage::WebSocketUpgrade {
        connection_id: connection_id.clone(),
        request_data: upgrade_request,
    };

    if let Err(e) = tunnel.request_tx.send(upgrade_msg).await {
        error!("Failed to send WebSocket upgrade to CLI: {}", e);
        stream
            .write_all(b"HTTP/1.1 502 Bad Gateway\r\n\r\nCLI not responding\r\n")
            .await?;
        return Ok(());
    }

    // Wait for 101 Switching Protocols response from CLI
    let upgrade_response = match timeout(Duration::from_secs(30), upgrade_response_rx.recv()).await {
        Ok(Some(response)) => response,
        Ok(None) => {
            error!("WebSocket upgrade response channel closed");
            stream
                .write_all(b"HTTP/1.1 502 Bad Gateway\r\n\r\nCLI disconnected\r\n")
                .await?;
            registry.remove_websocket(&connection_id);
            return Ok(());
        }
        Err(_) => {
            error!("WebSocket upgrade timeout");
            stream
                .write_all(b"HTTP/1.1 504 Gateway Timeout\r\n\r\nUpgrade timeout\r\n")
                .await?;
            registry.remove_websocket(&connection_id);
            return Ok(());
        }
    };

    // Send 101 response to browser
    stream.write_all(&upgrade_response).await?;
    stream.flush().await?;
    info!("WebSocket handshake complete: {}", connection_id);

    // Now do bidirectional forwarding
    let (mut read_half, mut write_half) = stream.into_split();
    let tunnel_clone = Arc::clone(&tunnel);
    let connection_id_clone = connection_id.clone();

    // Task 1: Browser → Relay → CLI
    let browser_to_cli = tokio::spawn(async move {
        let mut buf = vec![0u8; 8192];
        loop {
            match read_half.read(&mut buf).await {
                Ok(0) => {
                    info!("Browser closed WebSocket: {}", connection_id_clone);
                    break;
                }
                Ok(n) => {
                    let frame_data = buf[..n].to_vec();

                    let frame_msg = TunnelMessage::WebSocketFrame {
                        connection_id: connection_id_clone.clone(),
                        frame_data,
                    };

                    if tunnel_clone.request_tx.send(frame_msg).await.is_err() {
                        warn!("Failed to send WebSocket frame to CLI");
                        break;
                    }
                }
                Err(e) => {
                    warn!("Error reading from browser WebSocket: {}", e);
                    break;
                }
            }
        }

        // Send close message
        let close_msg = TunnelMessage::WebSocketClose {
            connection_id: connection_id_clone.clone(),
        };
        let _ = tunnel_clone.request_tx.send(close_msg).await;
    });

    // Task 2: CLI → Relay → Browser
    let connection_id_clone2 = connection_id.clone();
    let cli_to_browser = tokio::spawn(async move {
        while let Some(frame_data) = frame_rx.recv().await {
            if write_half.write_all(&frame_data).await.is_err() {
                warn!("Failed to write WebSocket frame to browser");
                break;
            }
        }
        info!("CLI closed WebSocket: {}", connection_id_clone2);
    });

    // Wait for either direction to close
    tokio::select! {
        _ = browser_to_cli => {
            info!("Browser-to-CLI forwarding ended");
        }
        _ = cli_to_browser => {
            info!("CLI-to-browser forwarding ended");
        }
    }

    // Cleanup
    registry.remove_websocket(&connection_id);
    info!("WebSocket proxy closed: {}", connection_id);

    Ok(())
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
    registry.register_pending_request(request_id, response_tx);

    let tunnel_msg = TunnelMessage::HttpRequest {
        request_id,
        request_data,
    };

    if let Err(e) = tunnel.request_tx.send(tunnel_msg).await {
        error!("Failed to send request to tunnel: {}", e);
        stream
            .write_all(b"HTTP/1.1 504 Gateway Timeout\r\n\r\nCLI not responding\r\n")
            .await?;
        return Ok(());
    }

    // Wait for response from CLI (7 minutes, matching ngrok)
    match timeout(Duration::from_secs(420), response_rx.recv()).await {
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

/// Check if HTTP request is a WebSocket upgrade request
///
/// Returns true if all three conditions are met:
/// 1. Header "Upgrade: websocket" is present
/// 2. Header "Connection: Upgrade" is present
/// 3. Header "Sec-WebSocket-Key" is present
fn is_websocket_upgrade(headers_buf: &[u8]) -> bool {
    let Ok(headers_str) = std::str::from_utf8(headers_buf) else {
        return false;
    };

    let mut has_upgrade = false;
    let mut has_connection_upgrade = false;
    let mut has_ws_key = false;

    for line in headers_str.lines() {
        let lower = line.to_lowercase();

        if lower.starts_with("upgrade:") && lower.contains("websocket") {
            has_upgrade = true;
        }

        if lower.starts_with("connection:") && lower.contains("upgrade") {
            has_connection_upgrade = true;
        }

        if lower.starts_with("sec-websocket-key:") {
            has_ws_key = true;
        }
    }

    has_upgrade && has_connection_upgrade && has_ws_key
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

    #[test]
    fn test_is_websocket_upgrade() {
        let ws_request = b"GET /chat HTTP/1.1\r\n\
            Host: example.com\r\n\
            Upgrade: websocket\r\n\
            Connection: Upgrade\r\n\
            Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n\
            Sec-WebSocket-Version: 13\r\n\
            \r\n";

        assert!(is_websocket_upgrade(ws_request));

        // Regular HTTP request
        let http_request = b"GET / HTTP/1.1\r\n\
            Host: example.com\r\n\
            \r\n";

        assert!(!is_websocket_upgrade(http_request));

        // Missing Sec-WebSocket-Key
        let incomplete_ws = b"GET /chat HTTP/1.1\r\n\
            Host: example.com\r\n\
            Upgrade: websocket\r\n\
            Connection: Upgrade\r\n\
            \r\n";

        assert!(!is_websocket_upgrade(incomplete_ws));
    }
}
