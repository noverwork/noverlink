//! WebSocket handler for CLI connections

use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;

use anyhow::Result;
use base64::Engine;
use futures_util::{SinkExt, StreamExt};
use tokio::net::TcpStream;
use tokio::sync::mpsc;
use tokio_tungstenite::accept_async;
use tracing::{error, info, warn};

use noverlink_shared::WebSocketMessage;

use crate::registry::{TunnelMessage, TunnelRegistry};
use crate::session_client::{RequestLogger, SessionClient};
use crate::ticket::TicketVerifier;

/// Handle incoming CLI WebSocket connection
#[allow(clippy::too_many_lines)]
pub async fn handle_cli_connection(
    stream: TcpStream,
    registry: Arc<TunnelRegistry>,
    ticket_verifier: Arc<TicketVerifier>,
    session_client: Arc<SessionClient>,
    request_logger: Arc<RequestLogger>,
    client_ip: Option<&str>,
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

    let WebSocketMessage::Register { ticket, local_port } = reg_data else {
        warn!("Expected Register message, got something else");
        return Ok(());
    };

    // Verify ticket
    let ticket_payload = match ticket_verifier.verify(&ticket) {
        Ok(payload) => payload,
        Err(e) => {
            warn!("Ticket verification failed: {}", e);
            let error_msg = WebSocketMessage::Error {
                message: format!("Authentication failed: {}", e),
            };
            let json = serde_json::to_string(&error_msg)?;
            ws_sink
                .send(tokio_tungstenite::tungstenite::Message::Text(json))
                .await?;
            return Ok(());
        }
    };

    info!(
        "Authenticated user: {} (plan: {}, max_tunnels: {})",
        ticket_payload.user_id, ticket_payload.plan, ticket_payload.max_tunnels
    );

    // Get subdomain from ticket (backend always provides one now)
    let final_domain = match ticket_payload.subdomain {
        Some(ref d) => {
            // Check if domain is available on this relay
            if !registry.is_domain_available(d) {
                let error_msg = WebSocketMessage::Error {
                    message: format!("Domain '{}' is already in use on this relay", d),
                };
                let json = serde_json::to_string(&error_msg)?;
                ws_sink
                    .send(tokio_tungstenite::tungstenite::Message::Text(json))
                    .await?;
                return Ok(());
            }
            d.clone()
        }
        None => {
            // Backend should always provide subdomain now
            let error_msg = WebSocketMessage::Error {
                message: "Invalid ticket: missing subdomain".to_string(),
            };
            let json = serde_json::to_string(&error_msg)?;
            ws_sink
                .send(tokio_tungstenite::tungstenite::Message::Text(json))
                .await?;
            return Ok(());
        }
    };

    info!(
        "Tunnel registration: {} -> localhost:{} (user: {})",
        final_domain, local_port, ticket_payload.user_id
    );

    // Create session in backend
    let session_id = match session_client
        .create_session(
            &ticket_payload.user_id,
            &final_domain,
            local_port,
            client_ip,
        )
        .await
    {
        Ok(id) => id,
        Err(e) => {
            error!("Failed to create session in backend: {}", e);
            let error_msg = WebSocketMessage::Error {
                message: "Failed to create tunnel session".to_string(),
            };
            let json = serde_json::to_string(&error_msg)?;
            ws_sink
                .send(tokio_tungstenite::tungstenite::Message::Text(json))
                .await?;
            return Ok(());
        }
    };

    // Create channel for sending requests to CLI
    let (request_tx, mut request_rx) = mpsc::channel::<TunnelMessage>(100);

    // Track bytes for session close
    let bytes_in = Arc::new(AtomicU64::new(0));
    let bytes_out = Arc::new(AtomicU64::new(0));

    // Register tunnel with user_id and session_id from ticket
    let _tunnel = registry.register(
        final_domain.clone(),
        ticket_payload.user_id.clone(),
        session_id.clone(),
        request_tx,
        local_port,
    );

    // Send acknowledgment with full URL
    let ack = WebSocketMessage::Ack {
        domain: final_domain.clone(),
        url: registry.get_full_url(&final_domain),
    };
    let ack_json = serde_json::to_string(&ack)?;
    ws_sink
        .send(tokio_tungstenite::tungstenite::Message::Text(ack_json))
        .await?;

    info!("Tunnel established: {} (session: {})", final_domain, session_id);

    // Main message loop
    loop {
        tokio::select! {
            // Receive message from HTTP handler → send to CLI
            Some(tunnel_msg) = request_rx.recv() => {
                match tunnel_msg {
                    TunnelMessage::HttpRequest { request_id, request_data } => {
                        bytes_in.fetch_add(u64::try_from(request_data.len()).unwrap_or(u64::MAX), Ordering::Relaxed);

                        let request_msg = WebSocketMessage::Request {
                            request_id,
                            payload: base64_encode(&request_data),
                        };

                        let json = serde_json::to_string(&request_msg)?;
                        if let Err(e) = ws_sink.send(tokio_tungstenite::tungstenite::Message::Text(json)).await {
                            error!("Failed to send HTTP request to CLI: {}", e);
                            break;
                        }
                    }

                    TunnelMessage::WebSocketUpgrade { connection_id, request_data } => {
                        bytes_in.fetch_add(u64::try_from(request_data.len()).unwrap_or(u64::MAX), Ordering::Relaxed);

                        let upgrade_msg = WebSocketMessage::WebSocketUpgrade {
                            connection_id,
                            initial_request: base64_encode(&request_data),
                        };

                        let json = serde_json::to_string(&upgrade_msg)?;
                        if let Err(e) = ws_sink.send(tokio_tungstenite::tungstenite::Message::Text(json)).await {
                            error!("Failed to send WebSocket upgrade to CLI: {}", e);
                            break;
                        }
                        info!("Sent WebSocket upgrade request to CLI");
                    }

                    TunnelMessage::WebSocketFrame { connection_id, frame_data } => {
                        bytes_in.fetch_add(u64::try_from(frame_data.len()).unwrap_or(u64::MAX), Ordering::Relaxed);

                        let frame_msg = WebSocketMessage::WebSocketFrame {
                            connection_id,
                            data: base64_encode(&frame_data),
                        };

                        let json = serde_json::to_string(&frame_msg)?;
                        if let Err(e) = ws_sink.send(tokio_tungstenite::tungstenite::Message::Text(json)).await {
                            error!("Failed to send WebSocket frame to CLI: {}", e);
                            break;
                        }
                    }

                    TunnelMessage::WebSocketClose { connection_id } => {
                        let close_msg = WebSocketMessage::WebSocketClose { connection_id };

                        let json = serde_json::to_string(&close_msg)?;
                        if let Err(e) = ws_sink.send(tokio_tungstenite::tungstenite::Message::Text(json)).await {
                            error!("Failed to send WebSocket close to CLI: {}", e);
                        }
                    }
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
                                            bytes_out.fetch_add(u64::try_from(response_data.len()).unwrap_or(u64::MAX), Ordering::Relaxed);

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

                                WebSocketMessage::WebSocketReady { connection_id, upgrade_response } => {
                                    match base64_decode(&upgrade_response) {
                                        Ok(response_data) => {
                                            bytes_out.fetch_add(u64::try_from(response_data.len()).unwrap_or(u64::MAX), Ordering::Relaxed);

                                            if registry.send_websocket_upgrade_response(&connection_id, response_data).await {
                                                info!("WebSocket upgrade response sent for {}", connection_id);
                                            } else {
                                                warn!("Failed to send WebSocket upgrade response for {}", connection_id);
                                            }
                                        }
                                        Err(e) => {
                                            error!("Failed to decode WebSocket upgrade response: {}", e);
                                        }
                                    }
                                }

                                WebSocketMessage::WebSocketFrame { connection_id, data } => {
                                    match base64_decode(&data) {
                                        Ok(frame_data) => {
                                            bytes_out.fetch_add(u64::try_from(frame_data.len()).unwrap_or(u64::MAX), Ordering::Relaxed);

                                            if !registry.send_websocket_frame(&connection_id, frame_data).await {
                                                warn!("Failed to send WebSocket frame for {}", connection_id);
                                            }
                                        }
                                        Err(e) => {
                                            error!("Failed to decode WebSocket frame: {}", e);
                                        }
                                    }
                                }

                                WebSocketMessage::WebSocketClose { connection_id } => {
                                    info!("WebSocket close received for {}", connection_id);
                                    registry.remove_websocket(&connection_id);
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

    // Cleanup - flush pending logs and close session
    request_logger.flush_session(session_id.clone());

    let total_bytes_in = bytes_in.load(Ordering::Relaxed);
    let total_bytes_out = bytes_out.load(Ordering::Relaxed);

    session_client
        .close_session(&session_id, total_bytes_in, total_bytes_out)
        .await;

    registry.remove(&final_domain);
    info!(
        "Tunnel closed: {} (session: {}, bytes_in: {}, bytes_out: {})",
        final_domain, session_id, total_bytes_in, total_bytes_out
    );

    Ok(())
}

fn base64_encode(bytes: &[u8]) -> String {
    base64::engine::general_purpose::STANDARD.encode(bytes)
}

fn base64_decode(encoded: &str) -> Result<Vec<u8>> {
    Ok(base64::engine::general_purpose::STANDARD.decode(encoded)?)
}
