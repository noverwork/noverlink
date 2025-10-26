//! Relay WebSocket connection management

use anyhow::{bail, Context, Result};
use base64::Engine;
use futures_util::{SinkExt, StreamExt};
use tokio::sync::mpsc;
use tokio_tungstenite::{
    connect_async, tungstenite::Message,
};
use tracing::{debug, error, info};

use noverlink_shared::WebSocketMessage;

/// Incoming request from relay
#[derive(Debug)]
pub struct IncomingRequest {
    pub id: u64,
    pub payload: Vec<u8>, // Raw HTTP request bytes
}

/// Outgoing response to relay
pub struct OutgoingResponse {
    pub id: u64,
    pub payload: Vec<u8>,
}

/// WebSocket connection to relay server
/// Splits into separate read/write halves to avoid deadlock
pub struct RelayConnection {
    request_rx: mpsc::Receiver<IncomingRequest>,
    response_tx: mpsc::Sender<OutgoingResponse>,
    tunnel_url: String,
}

impl RelayConnection {
    /// Connect to relay server and register tunnel
    #[allow(clippy::too_many_lines)]
    pub async fn connect(url: &str, domain: Option<String>, local_port: u16) -> Result<Self> {
        info!("Connecting to relay: {}", url);

        let (ws_stream, _) = connect_async(url)
            .await
            .context("Failed to connect to relay")?;

        info!("WebSocket connection established");

        // Split stream into sink and stream
        let (mut ws_sink, mut ws_stream) = ws_stream.split();

        // Register tunnel
        let register_msg = WebSocketMessage::Register {
            domain,
            local_port,
        };
        let json = serde_json::to_string(&register_msg)?;
        ws_sink
            .send(Message::Text(json))
            .await
            .context("Failed to send register message")?;

        // Wait for acknowledgment
        let tunnel_url = loop {
            let msg = ws_stream
                .next()
                .await
                .ok_or_else(|| anyhow::anyhow!("Connection closed during registration"))??;

            if let Message::Text(text) = msg {
                let ws_msg: WebSocketMessage = serde_json::from_str(&text)?;

                match ws_msg {
                    WebSocketMessage::Ack { url, .. } => {
                        info!("Tunnel registered: {}", url);
                        break url;
                    }
                    WebSocketMessage::Error { message } => {
                        bail!("Registration failed: {}", message);
                    }
                    _ => {}
                }
            }
        };

        // Create channels for request/response communication
        let (request_tx, request_rx) = mpsc::channel::<IncomingRequest>(100);
        let (response_tx, mut response_rx) = mpsc::channel::<OutgoingResponse>(100);

        // Spawn task to handle WebSocket reading (requests from relay)
        tokio::spawn(async move {
            loop {
                let msg = match ws_stream.next().await {
                    Some(Ok(Message::Text(text))) => text,
                    Some(Ok(Message::Close(_))) => {
                        info!("WebSocket closed by relay");
                        break;
                    }
                    Some(Err(e)) => {
                        error!("WebSocket error: {}", e);
                        break;
                    }
                    None => {
                        info!("WebSocket stream ended");
                        break;
                    }
                    _ => continue,
                };

                let ws_msg: WebSocketMessage = match serde_json::from_str(&msg) {
                    Ok(m) => m,
                    Err(e) => {
                        error!("Failed to parse message: {}", e);
                        continue;
                    }
                };

                match ws_msg {
                    WebSocketMessage::Request {
                        request_id,
                        payload,
                    } => {
                        // Decode base64 payload
                        let payload_bytes = match base64::engine::general_purpose::STANDARD
                            .decode(&payload)
                        {
                            Ok(b) => b,
                            Err(e) => {
                                error!("Failed to decode request payload: {}", e);
                                continue;
                            }
                        };

                        let request = IncomingRequest {
                            id: request_id,
                            payload: payload_bytes,
                        };

                        if request_tx.send(request).await.is_err() {
                            error!("Failed to send request to handler (channel closed)");
                            break;
                        }
                    }
                    WebSocketMessage::Error { message } => {
                        error!("Relay error: {}", message);
                    }
                    _ => {
                        // Ignore Ping and other messages
                    }
                }
            }
        });

        // Spawn task to handle WebSocket writing (responses to relay)
        tokio::spawn(async move {
            loop {
                tokio::select! {
                    Some(response) = response_rx.recv() => {
                        // Encode response as base64
                        let payload = base64::engine::general_purpose::STANDARD.encode(&response.payload);

                        let response_msg = WebSocketMessage::Response {
                            request_id: response.id,
                            payload,
                        };

                        let json = match serde_json::to_string(&response_msg) {
                            Ok(j) => j,
                            Err(e) => {
                                error!("Failed to serialize response: {}", e);
                                continue;
                            }
                        };

                        if let Err(e) = ws_sink.send(Message::Text(json)).await {
                            error!("Failed to send response: {}", e);
                            break;
                        }

                        debug!("Response sent for request {}", response.id);
                    }
                    else => break,
                }
            }
        });

        Ok(Self {
            request_rx,
            response_tx,
            tunnel_url,
        })
    }

    /// Get tunnel URL
    pub fn tunnel_url(&self) -> &str {
        &self.tunnel_url
    }

    /// Receive next request from relay
    pub async fn receive_request(&mut self) -> Option<IncomingRequest> {
        self.request_rx.recv().await
    }

    /// Get a cloneable response sender for background tasks
    pub fn get_response_sender(&self) -> ResponseSender {
        ResponseSender {
            tx: self.response_tx.clone(),
        }
    }

    /// Send response back to relay (direct method, prefer using `ResponseSender` for background tasks)
    #[allow(dead_code)]
    pub async fn send_response(&self, request_id: u64, response: Vec<u8>) -> Result<()> {
        let outgoing = OutgoingResponse {
            id: request_id,
            payload: response,
        };

        self.response_tx
            .send(outgoing)
            .await
            .context("Failed to send response (channel closed)")?;

        Ok(())
    }
}

/// Cloneable response sender for use in background tasks
pub struct ResponseSender {
    tx: mpsc::Sender<OutgoingResponse>,
}

impl ResponseSender {
    pub async fn send_response(&self, request_id: u64, response: Vec<u8>) -> Result<()> {
        let outgoing = OutgoingResponse {
            id: request_id,
            payload: response,
        };

        self.tx
            .send(outgoing)
            .await
            .context("Failed to send response (channel closed)")?;

        Ok(())
    }
}
