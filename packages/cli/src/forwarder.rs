//! HTTP request forwarding to localhost

use anyhow::{Context, Result};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use tokio::time::{timeout, Duration};
use tracing::{debug, warn};

/// Forward HTTP request to localhost and get response
pub async fn forward_to_localhost(request: &[u8], local_port: u16) -> Result<Vec<u8>> {
    debug!("Forwarding {} bytes to localhost:{}", request.len(), local_port);

    // Connect to localhost with timeout
    let mut stream = timeout(
        Duration::from_secs(5),
        TcpStream::connect(format!("127.0.0.1:{}", local_port)),
    )
    .await
    .context("Timeout connecting to localhost")??;

    // Send request
    stream
        .write_all(request)
        .await
        .context("Failed to write request to localhost")?;

    // Read response with timeout
    let response = timeout(Duration::from_secs(30), read_http_response(&mut stream))
        .await
        .context("Timeout reading response from localhost")??;

    debug!("Received {} bytes from localhost", response.len());

    Ok(response)
}

/// Read HTTP response from stream
async fn read_http_response(stream: &mut TcpStream) -> Result<Vec<u8>> {
    let mut buffer = Vec::with_capacity(8192);
    let mut chunk = [0u8; 4096];

    loop {
        match stream.read(&mut chunk).await {
            Ok(0) => {
                // EOF - connection closed
                break;
            }
            Ok(n) => {
                // SAFETY: chunk.get(..n) is safe because n is returned from read() and is <= chunk.len()
                if let Some(slice) = chunk.get(..n) {
                    buffer.extend_from_slice(slice);
                }

                // Check if we have complete response
                if is_complete_http_response(&buffer) {
                    break;
                }

                // Prevent unbounded growth
                if buffer.len() > 10 * 1024 * 1024 {
                    // 10MB limit
                    warn!("Response exceeds 10MB limit");
                    break;
                }
            }
            Err(e) => {
                return Err(e).context("Failed to read from localhost");
            }
        }
    }

    Ok(buffer)
}

/// Check if HTTP response is complete
fn is_complete_http_response(buffer: &[u8]) -> bool {
    // Find end of headers
    let Some(headers_end) = find_headers_end(buffer) else {
        return false;
    };

    // Parse content-length from headers
    let Some(header_slice) = buffer.get(..headers_end) else {
        return false;
    };
    let Ok(headers_str) = std::str::from_utf8(header_slice) else {
        return false;
    };

    // Look for Content-Length header
    for line in headers_str.lines() {
        if let Some(value) = line.strip_prefix("Content-Length:") {
            if let Ok(content_length) = value.trim().parse::<usize>() {
                let expected_total = headers_end + 4 + content_length;
                return buffer.len() >= expected_total;
            }
        }
    }

    // If no Content-Length, check for chunked encoding
    if headers_str.contains("Transfer-Encoding: chunked") {
        // For chunked encoding, look for final chunk (0\r\n\r\n)
        return buffer.windows(5).any(|w| w == b"0\r\n\r\n");
    }

    // If no Content-Length and not chunked, connection close indicates end
    // But we can't detect that here, so assume complete if we have headers
    buffer.len() > headers_end + 4
}

/// Find the end of HTTP headers
fn find_headers_end(buffer: &[u8]) -> Option<usize> {
    buffer.windows(4).position(|w| w == b"\r\n\r\n")
}

/// Create a 502 Bad Gateway error response
pub fn create_502_response(error: &anyhow::Error) -> Vec<u8> {
    let body = format!("Failed to connect to localhost: {}", error);
    let response = format!(
        "HTTP/1.1 502 Bad Gateway\r\n\
         Content-Type: text/plain\r\n\
         Content-Length: {}\r\n\
         Connection: close\r\n\
         \r\n\
         {}",
        body.len(),
        body
    );

    response.into_bytes()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_headers_end() {
        let req = b"HTTP/1.1 200 OK\r\nContent-Length: 5\r\n\r\nHello";
        assert_eq!(find_headers_end(req), Some(34));

        let incomplete = b"HTTP/1.1 200 OK\r\nContent-Length: 5\r\n";
        assert_eq!(find_headers_end(incomplete), None);
    }

    #[test]
    fn test_is_complete_http_response() {
        // Complete response with Content-Length
        let complete = b"HTTP/1.1 200 OK\r\nContent-Length: 5\r\n\r\nHello";
        assert!(is_complete_http_response(complete));

        // Incomplete response
        let incomplete = b"HTTP/1.1 200 OK\r\nContent-Length: 10\r\n\r\nHello";
        assert!(!is_complete_http_response(incomplete));

        // Chunked encoding (final chunk)
        let chunked = b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5\r\nHello\r\n0\r\n\r\n";
        assert!(is_complete_http_response(chunked));
    }
}
