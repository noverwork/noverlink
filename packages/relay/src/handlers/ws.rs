//! WebSocket handler for CLI connections

use std::sync::Arc;

use anyhow::Result;
use base64::Engine;
use futures_util::{SinkExt, StreamExt};
use tokio::net::TcpStream;
use tokio::sync::mpsc;
use tokio_tungstenite::accept_async;
use tracing::{error, info, warn};

use crate::protocol::WebSocketMessage;
use crate::registry::{TunnelMessage, TunnelRegistry};

/// Handle incoming CLI WebSocket connection
pub async fn handle_cli_connection(
    stream: TcpStream,
    registry: Arc<TunnelRegistry>,
) -> Result<()> {
    let ws_stream = accept_async(stream).await?;
    info!("WebSocket handshake completed");

    let (mut ws_sink, mut ws_stream) = ws_stream.split();

    // Wait for registration message
    let reg_msg = match ws_stream.next().await {
        Some(Ok(msg)) => msg,
        Some(Err(e)) => {
            warn!("WebSocket error during registration: {}", e);
            return Ok(());
        }
        None => {
            warn!("WebSocket closed before registration");
            return Ok(());
        }
    };

    let reg_data: WebSocketMessage = serde_json::from_str(&reg_msg.to_string())?;

    let WebSocketMessage::Register { domain, local_port } = reg_data else {
        warn!("Expected Register message, got something else");
        return Ok(());
    };

    info!("Tunnel registration: {} -> localhost:{}", domain, local_port);

    // Create channel for sending requests to CLI
    let (request_tx, mut request_rx) = mpsc::channel::<TunnelMessage>(100);

    // Register tunnel
    let _tunnel = registry.register(domain.clone(), request_tx, local_port);

    // Send acknowledgment
    let ack = WebSocketMessage::Ack {
        domain: domain.clone(),
        url: format!("http://{}", domain),
    };
    let ack_json = serde_json::to_string(&ack)?;
    ws_sink
        .send(tokio_tungstenite::tungstenite::Message::Text(ack_json))
        .await?;

    info!("Tunnel established: {}", domain);

    // Main message loop
    loop {
        tokio::select! {
            // Receive request from HTTP handler → send to CLI
            Some(tunnel_msg) = request_rx.recv() => {
                let request_msg = WebSocketMessage::Request {
                    request_id: tunnel_msg.request_id,
                    payload: base64_encode(&tunnel_msg.request_data),
                };

                let json = serde_json::to_string(&request_msg)?;
                if let Err(e) = ws_sink.send(tokio_tungstenite::tungstenite::Message::Text(json)).await {
                    error!("Failed to send request to CLI: {}", e);
                    break;
                }
            }

            // Receive message from CLI
            msg = ws_stream.next() => {
                match msg {
                    Some(Ok(msg)) => {
                        let text = msg.to_string();
                        if let Ok(ws_msg) = serde_json::from_str::<WebSocketMessage>(&text) {
                            match ws_msg {
                                WebSocketMessage::Response { request_id, payload } => {
                                    match base64_decode(&payload) {
                                        Ok(response_data) => {
                                            if registry.send_response(request_id, response_data).await {
                                                info!("Response sent for request {}", request_id);
                                            } else {
                                                warn!("Failed to send response for request {}: no pending request found", request_id);
                                            }
                                        }
                                        Err(e) => {
                                            error!("Failed to decode response payload: {}", e);
                                        }
                                    }
                                }
                                _ => {
                                    warn!("Unexpected message from CLI: {:?}", ws_msg);
                                }
                            }
                        }
                    }
                    Some(Err(e)) => {
                        error!("WebSocket error: {}", e);
                        break;
                    }
                    None => {
                        info!("WebSocket connection closed");
                        break;
                    }
                }
            }
        }
    }

    // Cleanup
    registry.remove(&domain);
    info!("Tunnel closed: {}", domain);

    Ok(())
}

fn base64_encode(bytes: &[u8]) -> String {
    base64::engine::general_purpose::STANDARD.encode(bytes)
}

fn base64_decode(encoded: &str) -> Result<Vec<u8>> {
    Ok(base64::engine::general_purpose::STANDARD.decode(encoded)?)
}
