//! Terminal display for ngrok-style output
//!
//! Provides a clean, formatted terminal UI showing:
//! - Session status and tunnel information
//! - HTTP request/response log with method, path, status, and duration

use std::io::{self, Write};
use std::time::{Duration, Instant};

/// ANSI color codes
mod colors {
    pub const RESET: &str = "\x1b[0m";
    pub const BOLD: &str = "\x1b[1m";
    pub const DIM: &str = "\x1b[2m";

    pub const GREEN: &str = "\x1b[32m";
    pub const YELLOW: &str = "\x1b[33m";
    pub const CYAN: &str = "\x1b[36m";
    pub const RED: &str = "\x1b[31m";
    pub const WHITE: &str = "\x1b[37m";
    pub const MAGENTA: &str = "\x1b[35m";
}

/// HTTP request information parsed from raw request
#[derive(Debug, Clone)]
pub struct HttpRequestInfo {
    pub method: String,
    pub path: String,
}

/// HTTP response information parsed from raw response
#[derive(Debug, Clone)]
pub struct HttpResponseInfo {
    pub status_code: u16,
}

/// Display manager for the terminal UI
pub struct Display {
    tunnel_url: String,
    local_port: u16,
    start_time: Instant,
    request_count: u64,
}

impl Display {
    /// Create a new display instance
    pub fn new(tunnel_url: String, local_port: u16) -> Self {
        Self {
            tunnel_url,
            local_port,
            start_time: Instant::now(),
            request_count: 0,
        }
    }

    /// Print the initial session status panel
    pub fn print_status_panel(&self, version: &str, account: Option<&str>) {
        let stdout = io::stdout();
        let mut handle = stdout.lock();

        // Clear line and print header
        let _ = writeln!(handle);
        let _ = writeln!(
            handle,
            "{}{}noverlink{} {}(Ctrl+C to quit){}",
            colors::BOLD,
            colors::CYAN,
            colors::RESET,
            colors::DIM,
            colors::RESET
        );
        let _ = writeln!(handle);

        // Session info
        print_field(&mut handle, "Session Status", "online", Some(colors::GREEN));
        if let Some(acct) = account {
            print_field(&mut handle, "Account", acct, None);
        }
        print_field(&mut handle, "Version", version, None);
        let _ = writeln!(handle);

        // Forwarding info
        let forwarding = format!(
            "{} -> http://localhost:{}",
            self.tunnel_url, self.local_port
        );
        print_field(&mut handle, "Forwarding", &forwarding, Some(colors::WHITE));
        let _ = writeln!(handle);

        // Request log header
        let _ = writeln!(
            handle,
            "{}{}Connections{}",
            colors::BOLD,
            colors::WHITE,
            colors::RESET
        );
        let _ = writeln!(handle);

        let _ = handle.flush();
    }

    /// Log a completed HTTP request
    pub fn log_request(
        &mut self,
        request_info: &HttpRequestInfo,
        response_info: Option<&HttpResponseInfo>,
        duration: Duration,
    ) {
        self.request_count += 1;
        let stdout = io::stdout();
        let mut handle = stdout.lock();

        // Status code with color
        let (status_str, status_color) = response_info.map_or_else(
            || ("ERR".to_string(), colors::RED),
            |resp| {
                let color = match resp.status_code {
                    200..=299 => colors::GREEN,
                    300..=399 => colors::CYAN,
                    400..=499 => colors::YELLOW,
                    500..=599 => colors::RED,
                    _ => colors::WHITE,
                };
                (format!("{}", resp.status_code), color)
            },
        );

        // Method color
        let method_color = match request_info.method.as_str() {
            "GET" => colors::GREEN,
            "POST" => colors::YELLOW,
            "PUT" => colors::CYAN,
            "DELETE" => colors::RED,
            "PATCH" => colors::MAGENTA,
            _ => colors::WHITE,
        };

        // Format duration
        let duration_str = format_duration(duration);

        // Truncate path if too long (safe for UTF-8)
        let path_display = truncate_string(&request_info.path, 50);

        let _ = writeln!(
            handle,
            "{}{:<7}{} {}{:<4}{} {}{:<52}{} {}{}{}",
            method_color,
            request_info.method,
            colors::RESET,
            status_color,
            status_str,
            colors::RESET,
            colors::DIM,
            path_display,
            colors::RESET,
            colors::DIM,
            duration_str,
            colors::RESET,
        );
        let _ = handle.flush();
    }

    /// Log an error for a request
    pub fn log_error(&mut self, request_info: &HttpRequestInfo, error: &str, duration: Duration) {
        self.request_count += 1;
        let stdout = io::stdout();
        let mut handle = stdout.lock();

        let duration_str = format_duration(duration);

        // Truncate path and error if too long (safe for UTF-8)
        let path_display = truncate_string(&request_info.path, 40);
        let error_display = truncate_string(error, 30);

        let _ = writeln!(
            handle,
            "{}{:<7}{} {}ERR{} {}{:<42}{} {}[{}]{}  {}",
            colors::WHITE,
            request_info.method,
            colors::RESET,
            colors::RED,
            colors::RESET,
            colors::DIM,
            path_display,
            colors::RESET,
            colors::RED,
            error_display,
            colors::RESET,
            duration_str,
        );
        let _ = handle.flush();
    }

    /// Print shutdown message
    pub fn print_shutdown(&self) {
        let stdout = io::stdout();
        let mut handle = stdout.lock();

        let uptime = format_duration(self.start_time.elapsed());
        let _ = writeln!(handle);
        let _ = writeln!(
            handle,
            "{}Disconnected{} ({}uptime: {}{})",
            colors::YELLOW,
            colors::RESET,
            colors::DIM,
            uptime,
            colors::RESET
        );
        let _ = writeln!(
            handle,
            "{}Total requests: {}{}",
            colors::DIM,
            self.request_count,
            colors::RESET
        );
        let _ = handle.flush();
    }
}

/// Print a status field row
fn print_field(handle: &mut io::StdoutLock, label: &str, value: &str, color: Option<&str>) {
    let color_code = color.unwrap_or(colors::WHITE);
    let _ = writeln!(
        handle,
        "{}{:<18}{} {}{}{}",
        colors::DIM,
        label,
        colors::RESET,
        color_code,
        value,
        colors::RESET
    );
}

/// Format duration in human-readable form
fn format_duration(duration: Duration) -> String {
    let millis = duration.as_millis();
    if millis < 1000 {
        format!("{}ms", millis)
    } else {
        format!("{:.2}s", duration.as_secs_f64())
    }
}

/// Truncate string safely at UTF-8 character boundaries
fn truncate_string(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        return s.to_string();
    }

    // Find a safe truncation point (at char boundary)
    let truncate_at = max_len.saturating_sub(3);
    let mut end = truncate_at;

    // Find the last valid char boundary
    while end > 0 && !s.is_char_boundary(end) {
        end -= 1;
    }

    // Get the truncated portion safely
    s.get(..end).map_or_else(
        || s.to_string(),
        |truncated| format!("{}...", truncated),
    )
}

/// Parse HTTP method and path from raw request bytes
pub fn parse_request_info(request: &[u8]) -> HttpRequestInfo {
    // Default values if parsing fails
    let default = HttpRequestInfo {
        method: "???".to_string(),
        path: "/".to_string(),
    };

    // Find the end of the first line
    let first_line_end = request.iter().position(|&b| b == b'\r' || b == b'\n');
    let first_line_bytes = match first_line_end {
        Some(pos) => request.get(..pos).unwrap_or(request),
        None => {
            // Try entire buffer if no newline found
            if request.len() > 500 {
                return default;
            }
            request
        }
    };

    // Parse as UTF-8
    let Ok(first_line) = std::str::from_utf8(first_line_bytes) else {
        return default;
    };

    // Split by spaces: "GET /path HTTP/1.1"
    let parts: Vec<&str> = first_line.split_whitespace().collect();
    match (parts.first(), parts.get(1)) {
        (Some(method), Some(path)) => HttpRequestInfo {
            method: (*method).to_string(),
            path: (*path).to_string(),
        },
        _ => default,
    }
}

/// Parse HTTP status code from raw response bytes
pub fn parse_response_info(response: &[u8]) -> Option<HttpResponseInfo> {
    // Find the end of the first line
    let first_line_end = response.iter().position(|&b| b == b'\r' || b == b'\n')?;
    let first_line_bytes = response.get(..first_line_end)?;
    let first_line = std::str::from_utf8(first_line_bytes).ok()?;

    // Split by spaces: "HTTP/1.1 200 OK"
    let parts: Vec<&str> = first_line.split_whitespace().collect();
    let status_str = parts.get(1)?;
    let status_code = status_str.parse::<u16>().ok()?;
    Some(HttpResponseInfo { status_code })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_request_info() {
        let request = b"GET /api/users HTTP/1.1\r\nHost: example.com\r\n\r\n";
        let info = parse_request_info(request);
        assert_eq!(info.method, "GET");
        assert_eq!(info.path, "/api/users");
    }

    #[test]
    fn test_parse_request_info_post() {
        let request = b"POST /api/data HTTP/1.1\r\nHost: example.com\r\n\r\n{\"key\": \"value\"}";
        let info = parse_request_info(request);
        assert_eq!(info.method, "POST");
        assert_eq!(info.path, "/api/data");
    }

    #[test]
    fn test_parse_response_info() {
        let response = b"HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n";
        let info = parse_response_info(response);
        assert!(info.is_some());
        assert_eq!(info.map(|i| i.status_code), Some(200));
    }

    #[test]
    fn test_parse_response_info_404() {
        let response = b"HTTP/1.1 404 Not Found\r\nContent-Type: text/plain\r\n\r\n";
        let info = parse_response_info(response);
        assert!(info.is_some());
        assert_eq!(info.map(|i| i.status_code), Some(404));
    }

    #[test]
    fn test_format_duration_millis() {
        let duration = Duration::from_millis(250);
        assert_eq!(format_duration(duration), "250ms");
    }

    #[test]
    fn test_format_duration_seconds() {
        let duration = Duration::from_millis(1500);
        assert_eq!(format_duration(duration), "1.50s");
    }

    #[test]
    fn test_truncate_string() {
        assert_eq!(truncate_string("short", 10), "short");
        assert_eq!(truncate_string("this is a long string", 10), "this is...");
    }
}
