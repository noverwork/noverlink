//! HTTP request forwarding to localhost

use anyhow::{Context, Result};
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use tokio::time::{timeout, Duration};
use tracing::{debug, warn};

/// Forward HTTP request to localhost and get response
pub async fn forward_to_localhost(request: &[u8], local_port: u16) -> Result<Vec<u8>> {
    debug!(
        "Forwarding {} bytes to localhost:{}",
        request.len(),
        local_port
    );

    // Rewrite Host header for localhost
    let rewritten_request = rewrite_host_header(request, local_port);

    // Connect to localhost with timeout
    let mut stream = timeout(
        Duration::from_secs(5),
        TcpStream::connect(format!("127.0.0.1:{}", local_port)),
    )
    .await
    .context("Timeout connecting to localhost")??;

    // Send rewritten request
    stream
        .write_all(&rewritten_request)
        .await
        .context("Failed to write request to localhost")?;

    // Read response with timeout (7 minutes, matching ngrok)
    let response = timeout(Duration::from_secs(420), read_http_response(&mut stream))
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

    // Look for Content-Length header (case-insensitive)
    for line in headers_str.lines() {
        if line.to_lowercase().starts_with("content-length:") {
            if let Some(value) = line.split(':').nth(1) {
                if let Ok(content_length) = value.trim().parse::<usize>() {
                    let expected_total = headers_end + 4 + content_length;
                    return buffer.len() >= expected_total;
                }
            }
        }
    }

    // If no Content-Length, check for chunked encoding (case-insensitive)
    if headers_str.to_lowercase().contains("transfer-encoding:")
        && headers_str.to_lowercase().contains("chunked")
    {
        // RFC 7230: chunked body ends with "0\r\n" followed by optional trailers, then final "\r\n"
        // Pattern: "\r\n0\r\n\r\n" (no trailers) or "\r\n0\r\n<headers>\r\n\r\n" (with trailers)
        let body_start = headers_end + 4;
        if let Some(body) = buffer.get(body_start..) {
            // Look for the last chunk marker "\r\n0\r\n"
            if let Some(last_chunk_pos) = body.windows(5).rposition(|w| w == b"\r\n0\r\n") {
                // Start from the "0" in "\r\n0\r\n" and check remaining data
                let from_zero = last_chunk_pos + 2; // skip "\r\n"
                if let Some(remaining) = body.get(from_zero..) {
                    // Verify it starts with "0\r\n"
                    if remaining.len() >= 3 && remaining.starts_with(b"0\r\n") {
                        // SAFETY: We verified remaining.len() >= 3, so get(3..) is safe
                        if let Some(after_zero_crlf) = remaining.get(3..) {
                            // No trailers: immediately followed by "\r\n"
                            // With trailers: followed by headers then "\r\n\r\n"
                            return after_zero_crlf.starts_with(b"\r\n")
                                || after_zero_crlf.windows(4).any(|w| w == b"\r\n\r\n");
                        }
                    }
                }
            }
        }
        return false;
    }

    // If no Content-Length and not chunked, must read until connection closes (EOF)
    // Cannot determine completeness from buffer content alone
    // Return false to force reading until EOF
    false
}

/// Find the end of HTTP headers
fn find_headers_end(buffer: &[u8]) -> Option<usize> {
    buffer.windows(4).position(|w| w == b"\r\n\r\n")
}

/// Rewrite Host header in HTTP request for localhost forwarding
///
/// This is necessary because:
/// - Browser sends `Host: abc123.example.com` (tunnel domain)
/// - localhost services expect `Host: localhost:port`
/// - Without rewriting, some apps may reject the request or behave incorrectly
fn rewrite_host_header(request: &[u8], local_port: u16) -> Vec<u8> {
    // Find the end of headers
    let Some(headers_end) = find_headers_end(request) else {
        // No complete headers, return original
        return request.to_vec();
    };

    let Ok(headers_str) = std::str::from_utf8(&request[..headers_end + 4]) else {
        // Not valid UTF-8, return original
        return request.to_vec();
    };

    let localhost_host = format!("localhost:{}", local_port);

    let mut result = String::with_capacity(request.len());
    let mut lines = headers_str.lines();

    // First line is the request line (e.g., "GET / HTTP/1.1")
    if let Some(request_line) = lines.next() {
        result.push_str(request_line);
        result.push_str("\r\n");
    }

    // Process headers
    for line in lines {
        if line.is_empty() {
            continue;
        }

        let lower = line.to_lowercase();

        if lower.starts_with("host:") {
            // Rewrite Host header
            result.push_str("Host: ");
            result.push_str(&localhost_host);
            result.push_str("\r\n");
        } else {
            // Keep other headers as-is
            result.push_str(line);
            result.push_str("\r\n");
        }
    }

    // End of headers
    result.push_str("\r\n");

    // Append body if present
    let mut output = result.into_bytes();
    if request.len() > headers_end + 4 {
        output.extend_from_slice(&request[headers_end + 4..]);
    }

    output
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

        // Chunked encoding - simple case
        let chunked =
            b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5\r\nHello\r\n0\r\n\r\n";
        assert!(is_complete_http_response(chunked));

        // Chunked encoding - lowercase header
        let chunked_lower =
            b"HTTP/1.1 200 OK\r\ntransfer-encoding: chunked\r\n\r\n5\r\nHello\r\n0\r\n\r\n";
        assert!(is_complete_http_response(chunked_lower));

        // Chunked encoding - with trailers
        let chunked_trailers = b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5\r\nHello\r\n0\r\nX-Checksum: abc\r\n\r\n";
        assert!(is_complete_http_response(chunked_trailers));

        // Chunked encoding - incomplete (missing final CRLF)
        let chunked_incomplete =
            b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5\r\nHello\r\n0\r\n";
        assert!(!is_complete_http_response(chunked_incomplete));

        // Content-Length - case insensitive
        let content_length_lower = b"HTTP/1.1 200 OK\r\ncontent-length: 5\r\n\r\nHello";
        assert!(is_complete_http_response(content_length_lower));
    }

    #[test]
    fn test_create_502_response() {
        let error = anyhow::anyhow!("Connection refused");
        let response = create_502_response(&error);

        let response_str =
            String::from_utf8(response).unwrap_or_else(|_| String::from("Invalid UTF-8"));

        assert!(response_str.starts_with("HTTP/1.1 502 Bad Gateway"));
        assert!(response_str.contains("Content-Type: text/plain"));
        assert!(response_str.contains("Connection: close"));
        assert!(response_str.contains("Connection refused"));
    }

    #[test]
    fn test_no_headers_end() {
        let partial = b"HTTP/1.1 200 OK\r\nContent-Length: 5";
        assert!(!is_complete_http_response(partial));
    }

    #[test]
    fn test_empty_body_with_content_length_zero() {
        let empty_body = b"HTTP/1.1 204 No Content\r\nContent-Length: 0\r\n\r\n";
        assert!(is_complete_http_response(empty_body));
    }

    #[test]
    fn test_multiple_chunks() {
        let multi_chunk = b"HTTP/1.1 200 OK\r\nTransfer-Encoding: chunked\r\n\r\n5\r\nHello\r\n5\r\nWorld\r\n0\r\n\r\n";
        assert!(is_complete_http_response(multi_chunk));
    }

    #[test]
    fn test_rewrite_host_header() {
        let request = b"GET / HTTP/1.1\r\nHost: abc123.example.com\r\nConnection: keep-alive\r\n\r\n";
        let rewritten = rewrite_host_header(request, 3000);
        let rewritten_str = String::from_utf8(rewritten).unwrap();

        assert!(rewritten_str.contains("Host: localhost:3000"));
        assert!(!rewritten_str.contains("abc123.example.com"));
        assert!(rewritten_str.contains("Connection: keep-alive"));
    }

    #[test]
    fn test_rewrite_host_header_with_body() {
        let request = b"POST /api HTTP/1.1\r\nHost: tunnel.app\r\nContent-Length: 5\r\n\r\nHello";
        let rewritten = rewrite_host_header(request, 8080);
        let rewritten_str = String::from_utf8(rewritten).unwrap();

        assert!(rewritten_str.contains("Host: localhost:8080"));
        assert!(rewritten_str.contains("Content-Length: 5"));
        assert!(rewritten_str.ends_with("\r\n\r\nHello"));
    }

    #[test]
    fn test_rewrite_host_header_case_insensitive() {
        let request = b"GET / HTTP/1.1\r\nHOST: TUNNEL.APP\r\n\r\n";
        let rewritten = rewrite_host_header(request, 3000);
        let rewritten_str = String::from_utf8(rewritten).unwrap();

        assert!(rewritten_str.contains("Host: localhost:3000"));
        assert!(!rewritten_str.contains("TUNNEL.APP"));
    }
}
