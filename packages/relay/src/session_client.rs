//! Backend session client for managing tunnel sessions and logging requests
//!
//! Handles:
//! - Creating sessions when CLI connects
//! - Closing sessions when CLI disconnects
//! - Batching and sending HTTP request logs

use std::time::{Duration, Instant};

use reqwest::Client;
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use tokio::time::interval;
use tracing::{debug, error, info, warn};

// ─── API Types ─────────────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
struct CreateSessionRequest {
    user_id: String,
    subdomain: String,
    local_port: u16,
    client_ip: Option<String>,
    client_version: Option<String>,
}

#[derive(Debug, Deserialize)]
struct CreateSessionResponse {
    session_id: String,
}

#[derive(Debug, Serialize)]
struct CloseSessionRequest {
    bytes_in: u64,
    bytes_out: u64,
}

#[derive(Debug, Clone, Serialize)]
pub struct HttpRequestLog {
    pub method: String,
    pub path: String,
    pub query_string: Option<String>,
    /// Base64-encoded request headers JSON
    pub request_headers: String,
    /// Base64-encoded request body (truncated to 64KB)
    pub request_body: Option<String>,
    pub response_status: u16,
    /// Base64-encoded response headers JSON
    pub response_headers: Option<String>,
    /// Base64-encoded response body (truncated to 64KB)
    pub response_body: Option<String>,
    pub duration_ms: u32,
    /// Unix timestamp (seconds)
    pub timestamp: i64,
    pub original_request_size: Option<u32>,
    pub original_response_size: Option<u32>,
}

#[derive(Debug, Serialize)]
struct HttpRequestBatch {
    requests: Vec<HttpRequestLog>,
}

// ─── Session Client ────────────────────────────────────────────────────────

/// Client for communicating with backend about sessions
#[derive(Clone)]
pub struct SessionClient {
    client: Client,
    backend_url: String,
    relay_secret: String,
    relay_id: String,
}

impl SessionClient {
    pub fn new(backend_url: &str, relay_secret: &str, relay_id: &str) -> Self {
        Self {
            client: Client::new(),
            backend_url: backend_url.to_string(),
            relay_secret: relay_secret.to_string(),
            relay_id: relay_id.to_string(),
        }
    }

    /// Create a new session in the backend
    pub async fn create_session(
        &self,
        user_id: &str,
        subdomain: &str,
        local_port: u16,
        client_ip: Option<&str>,
    ) -> Result<String, String> {
        let url = format!("{}/relay/sessions", self.backend_url);

        let request = CreateSessionRequest {
            user_id: user_id.to_string(),
            subdomain: subdomain.to_string(),
            local_port,
            client_ip: client_ip.map(str::to_string),
            client_version: Some(env!("CARGO_PKG_VERSION").to_string()),
        };

        match self
            .client
            .post(&url)
            .header("X-Relay-Secret", &self.relay_secret)
            .header("X-Relay-Id", &self.relay_id)
            .json(&request)
            .timeout(Duration::from_secs(10))
            .send()
            .await
        {
            Ok(response) => {
                if response.status().is_success() {
                    match response.json::<CreateSessionResponse>().await {
                        Ok(res) => {
                            info!("Session created: {}", res.session_id);
                            Ok(res.session_id)
                        }
                        Err(e) => Err(format!("Failed to parse session response: {}", e)),
                    }
                } else {
                    let status = response.status();
                    let text = response.text().await.unwrap_or_default();
                    Err(format!("Failed to create session: {} - {}", status, text))
                }
            }
            Err(e) => Err(format!("Failed to connect to backend: {}", e)),
        }
    }

    /// Close a session in the backend
    pub async fn close_session(&self, session_id: &str, bytes_in: u64, bytes_out: u64) {
        let url = format!("{}/relay/sessions/{}/close", self.backend_url, session_id);

        let request = CloseSessionRequest { bytes_in, bytes_out };

        match self
            .client
            .patch(&url)
            .header("X-Relay-Secret", &self.relay_secret)
            .header("X-Relay-Id", &self.relay_id)
            .json(&request)
            .timeout(Duration::from_secs(10))
            .send()
            .await
        {
            Ok(response) => {
                if response.status().is_success() {
                    info!("Session closed: {}", session_id);
                } else {
                    error!(
                        "Failed to close session: {} - {}",
                        response.status(),
                        response.text().await.unwrap_or_default()
                    );
                }
            }
            Err(e) => {
                error!("Failed to connect to backend for session close: {}", e);
            }
        }
    }

    /// Send a batch of HTTP request logs
    pub async fn send_requests(&self, session_id: &str, requests: Vec<HttpRequestLog>) -> bool {
        if requests.is_empty() {
            return true;
        }

        let url = format!(
            "{}/relay/sessions/{}/requests",
            self.backend_url, session_id
        );

        let batch = HttpRequestBatch { requests };
        let count = batch.requests.len();

        match self
            .client
            .post(&url)
            .header("X-Relay-Secret", &self.relay_secret)
            .header("X-Relay-Id", &self.relay_id)
            .json(&batch)
            .timeout(Duration::from_secs(10))
            .send()
            .await
        {
            Ok(response) => {
                if response.status().is_success() {
                    debug!("Sent {} requests for session {}", count, session_id);
                    true
                } else {
                    error!(
                        "Failed to send requests: {} - {}",
                        response.status(),
                        response.text().await.unwrap_or_default()
                    );
                    false
                }
            }
            Err(e) => {
                error!("Failed to connect to backend for requests: {}", e);
                false
            }
        }
    }
}

// ─── Request Logger ────────────────────────────────────────────────────────

/// Message for the request logger background task
pub enum LoggerMessage {
    Log {
        session_id: String,
        request: HttpRequestLog,
    },
    FlushSession {
        session_id: String,
    },
}

/// Request logger that batches logs per session and sends them periodically
pub struct RequestLogger {
    tx: mpsc::Sender<LoggerMessage>,
}

impl RequestLogger {
    /// Create a new request logger with background task
    pub fn new(client: SessionClient) -> Self {
        let (tx, rx) = mpsc::channel::<LoggerMessage>(10_000);

        tokio::spawn(async move {
            logger_task(rx, client).await;
        });

        Self { tx }
    }

    /// Log a request (non-blocking)
    pub fn log(&self, session_id: String, request: HttpRequestLog) {
        if let Err(e) = self.tx.try_send(LoggerMessage::Log {
            session_id,
            request,
        }) {
            warn!("Request logger buffer full: {}", e);
        }
    }

    /// Flush all pending logs for a session (call before closing session)
    pub fn flush_session(&self, session_id: String) {
        let _ = self.tx.try_send(LoggerMessage::FlushSession { session_id });
    }

    /// Create a request timer
    #[must_use]
    pub fn start_request(&self) -> RequestTimer {
        let _ = self; // Silence unused_self warning - method could become non-static in future
        RequestTimer {
            start: Instant::now(),
        }
    }
}

/// Timer for measuring request duration
pub struct RequestTimer {
    start: Instant,
}

impl RequestTimer {
    pub fn elapsed_ms(&self) -> u64 {
        u64::try_from(self.start.elapsed().as_millis()).unwrap_or(u64::MAX)
    }
}

/// Background task that batches and sends request logs
async fn logger_task(mut rx: mpsc::Receiver<LoggerMessage>, client: SessionClient) {
    use std::collections::HashMap;

    let mut buffers: HashMap<String, Vec<HttpRequestLog>> = HashMap::new();
    let mut flush_interval = interval(Duration::from_secs(5));

    info!("Request logger started");

    loop {
        tokio::select! {
            Some(msg) = rx.recv() => {
                match msg {
                    LoggerMessage::Log { session_id, request } => {
                        let buffer = buffers.entry(session_id.clone()).or_default();
                        buffer.push(request);

                        // Flush if buffer is getting full
                        if buffer.len() >= 50 {
                            let requests = std::mem::take(buffer);
                            client.send_requests(&session_id, requests).await;
                        }
                    }
                    LoggerMessage::FlushSession { session_id } => {
                        if let Some(requests) = buffers.remove(&session_id) {
                            if !requests.is_empty() {
                                client.send_requests(&session_id, requests).await;
                            }
                        }
                    }
                }
            }

            _ = flush_interval.tick() => {
                // Flush all buffers periodically
                for (session_id, buffer) in &mut buffers {
                    if !buffer.is_empty() {
                        let requests = std::mem::take(buffer);
                        client.send_requests(session_id, requests).await;
                    }
                }
            }
        }
    }
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/// Encode data to base64
pub fn base64_encode(data: &[u8]) -> String {
    use base64::Engine;
    base64::engine::general_purpose::STANDARD.encode(data)
}

/// Truncate body to 64KB max
pub fn truncate_body(body: &[u8], max_size: usize) -> (Vec<u8>, Option<u64>) {
    if body.len() > max_size {
        let truncated = body.get(..max_size).map_or_else(Vec::new, <[u8]>::to_vec);
        let original_size = u64::try_from(body.len()).unwrap_or(u64::MAX);
        (truncated, Some(original_size))
    } else {
        (body.to_vec(), None)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_request_timer() {
        let timer = RequestTimer {
            start: Instant::now(),
        };
        std::thread::sleep(Duration::from_millis(10));
        assert!(timer.elapsed_ms() >= 10);
    }

    #[test]
    fn test_truncate_body() {
        let data = vec![0u8; 100];
        let (truncated, original_size) = truncate_body(&data, 50);
        assert_eq!(truncated.len(), 50);
        assert_eq!(original_size, Some(100));

        let (not_truncated, no_original) = truncate_body(&data, 200);
        assert_eq!(not_truncated.len(), 100);
        assert_eq!(no_original, None);
    }
}
