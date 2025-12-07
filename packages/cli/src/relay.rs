//! Relay WebSocket connection management

#![allow(clippy::indexing_slicing)] // Slicing is bounds-checked in this module

use std::sync::Arc;

use anyhow::{bail, Context, Result};
use base64::Engine;
use dashmap::DashMap;
use futures_util::{SinkExt, StreamExt};
use rustls::RootCertStore;
use tokio::io::{AsyncReadExt, AsyncWriteExt};
use tokio::net::TcpStream;
use tokio::sync::mpsc;
use tokio_tungstenite::tungstenite::Message;
use tracing::{debug, error, info, warn};

use noverlink_shared::WebSocketMessage;

/// Active WebSocket connections
type WebSocketConnections = Arc<DashMap<String, mpsc::Sender<Vec<u8>>>>;

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

/// WebSocket upgrade request from relay
/// TODO: Use this when implementing full WebSocket support
#[derive(Debug)]
#[allow(dead_code)]
pub struct WebSocketUpgradeRequest {
    pub connection_id: String,
    pub initial_request: Vec<u8>,
}

/// WebSocket connection to relay server
/// Splits into separate read/write halves to avoid deadlock
pub struct RelayConnection {
    request_rx: mpsc::Receiver<IncomingRequest>,
    response_tx: mpsc::Sender<OutgoingResponse>,
    tunnel_url: String,
}

impl RelayConnection {
    /// Connect to relay server and register tunnel with authentication ticket
    ///
    /// # Arguments
    /// * `url` - WebSocket URL of the relay server
    /// * `ticket` - Connection ticket from backend (HMAC-signed)
    /// * `local_port` - Local port to forward traffic to
    #[allow(clippy::too_many_lines)]
    pub async fn connect(url: &str, ticket: &str, local_port: u16) -> Result<Self> {
        info!("Connecting to relay: {}", url);

        // Build TLS connector with Cloudflare Origin CA support
        let connector = build_tls_connector()?;

        let (ws_stream, _) =
            tokio_tungstenite::connect_async_tls_with_config(url, None, false, Some(connector))
                .await
                .context("Failed to connect to relay")?;

        info!("WebSocket connection established");

        // Split stream into sink and stream
        let (mut ws_sink, mut ws_stream) = ws_stream.split();

        // Register tunnel with authentication ticket
        let register_msg = WebSocketMessage::Register {
            ticket: ticket.to_string(),
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

        // Channel for sending WebSocket messages to relay
        let (ws_msg_tx, mut ws_msg_rx) = mpsc::channel::<WebSocketMessage>(100);

        // WebSocket connections registry
        let ws_connections: WebSocketConnections = Arc::new(DashMap::new());
        let ws_connections_clone = Arc::clone(&ws_connections);

        // Clone for spawned tasks
        let local_port_for_ws = local_port;

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
                        let payload_bytes =
                            match base64::engine::general_purpose::STANDARD.decode(&payload) {
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
                    WebSocketMessage::WebSocketUpgrade {
                        connection_id,
                        initial_request,
                    } => {
                        info!("WebSocket upgrade request: {}", connection_id);

                        let ws_connections = Arc::clone(&ws_connections_clone);
                        let ws_msg_tx = ws_msg_tx.clone();
                        let local_port = local_port_for_ws;

                        tokio::spawn(async move {
                            if let Err(e) = handle_websocket_connection(
                                connection_id,
                                initial_request,
                                local_port,
                                ws_msg_tx,
                                ws_connections,
                            )
                            .await
                            {
                                error!("WebSocket connection error: {}", e);
                            }
                        });
                    }
                    WebSocketMessage::WebSocketFrame {
                        connection_id,
                        data,
                    } => {
                        // Forward frame to local WebSocket
                        if let Some(tx) = ws_connections_clone.get(&connection_id) {
                            let frame_bytes =
                                match base64::engine::general_purpose::STANDARD.decode(&data) {
                                    Ok(b) => b,
                                    Err(e) => {
                                        error!("Failed to decode WebSocket frame: {}", e);
                                        continue;
                                    }
                                };

                            if tx.send(frame_bytes).await.is_err() {
                                debug!("WebSocket connection closed: {}", connection_id);
                                ws_connections_clone.remove(&connection_id);
                            }
                        } else {
                            warn!("WebSocket frame for unknown connection: {}", connection_id);
                        }
                    }
                    WebSocketMessage::WebSocketClose { connection_id } => {
                        info!("WebSocket close for {}", connection_id);
                        ws_connections_clone.remove(&connection_id);
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

        // Spawn task to handle WebSocket writing (responses and WebSocket messages to relay)
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
                    Some(ws_msg) = ws_msg_rx.recv() => {
                        // Send WebSocket message to relay
                        let json = match serde_json::to_string(&ws_msg) {
                            Ok(j) => j,
                            Err(e) => {
                                error!("Failed to serialize WebSocket message: {}", e);
                                continue;
                            }
                        };

                        if let Err(e) = ws_sink.send(Message::Text(json)).await {
                            error!("Failed to send WebSocket message: {}", e);
                            break;
                        }
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

/// Handle a WebSocket connection to localhost
#[allow(clippy::too_many_lines)]
async fn handle_websocket_connection(
    connection_id: String,
    initial_request: String,
    local_port: u16,
    ws_msg_tx: mpsc::Sender<WebSocketMessage>,
    ws_connections: WebSocketConnections,
) -> Result<()> {
    info!("Starting WebSocket connection: {}", connection_id);

    // 1. Decode base64 initial request
    let request_bytes = match base64::engine::general_purpose::STANDARD.decode(&initial_request) {
        Ok(b) => b,
        Err(e) => {
            error!("Failed to decode initial request: {}", e);
            return Err(e.into());
        }
    };

    // 2. Connect to localhost as raw TCP (we'll upgrade it ourselves)
    let local_addr = format!("127.0.0.1:{}", local_port);
    let mut local_stream = TcpStream::connect(&local_addr)
        .await
        .context("Failed to connect to localhost")?;

    debug!("Connected to localhost: {}", local_addr);

    // 3. Send the initial HTTP upgrade request
    local_stream
        .write_all(&request_bytes)
        .await
        .context("Failed to send upgrade request to localhost")?;

    // 4. Read 101 Switching Protocols response
    let mut response_buf = Vec::with_capacity(4096);
    let mut temp_buf = vec![0u8; 1024];

    // Read until we have complete headers (\\r\\n\\r\\n)
    loop {
        let n = local_stream
            .read(&mut temp_buf)
            .await
            .context("Failed to read upgrade response")?;

        if n == 0 {
            bail!("Connection closed before upgrade response");
        }

        response_buf.extend_from_slice(&temp_buf[..n]);

        // Check for end of headers
        if response_buf.windows(4).any(|w| w == b"\r\n\r\n") {
            break;
        }

        if response_buf.len() > 8192 {
            bail!("Upgrade response too large");
        }
    }

    // Verify it's a 101 response
    if !response_buf.starts_with(b"HTTP/1.1 101") {
        let response_preview = String::from_utf8_lossy(&response_buf[..50.min(response_buf.len())]);
        error!("Expected 101 response, got: {:?}", response_preview);

        // Send error response back to relay so it can forward to the browser
        let error_response = base64::engine::general_purpose::STANDARD.encode(&response_buf);
        let error_msg = WebSocketMessage::WebSocketError {
            connection_id: connection_id.clone(),
            error_response,
        };

        ws_msg_tx
            .send(error_msg)
            .await
            .context("Failed to send WebSocketError message")?;

        bail!("WebSocket upgrade failed: {}", response_preview);
    }

    info!("WebSocket upgrade successful: {}", connection_id);

    // 5. Send WebSocketReady back to relay
    let upgrade_response = base64::engine::general_purpose::STANDARD.encode(&response_buf);
    let ready_msg = WebSocketMessage::WebSocketReady {
        connection_id: connection_id.clone(),
        upgrade_response,
    };

    ws_msg_tx
        .send(ready_msg)
        .await
        .context("Failed to send WebSocketReady message")?;

    debug!("Sent WebSocketReady for {}", connection_id);

    // 6. Start bidirectional frame forwarding
    let (mut local_read, mut local_write) = local_stream.into_split();

    // Create channel for receiving frames from relay
    let (frame_tx, mut frame_rx) = mpsc::channel::<Vec<u8>>(100);
    ws_connections.insert(connection_id.clone(), frame_tx);

    let connection_id_clone = connection_id.clone();
    let ws_connections_clone = Arc::clone(&ws_connections);
    let ws_msg_tx_clone = ws_msg_tx.clone();

    // Task 1: localhost → relay (read from local, send to relay)
    let local_to_relay = tokio::spawn(async move {
        let mut buf = vec![0u8; 8192];
        loop {
            match local_read.read(&mut buf).await {
                Ok(0) => {
                    info!("Localhost closed WebSocket: {}", connection_id_clone);
                    break;
                }
                Ok(n) => {
                    let frame_data = buf[..n].to_vec();
                    let encoded = base64::engine::general_purpose::STANDARD.encode(&frame_data);

                    let frame_msg = WebSocketMessage::WebSocketFrame {
                        connection_id: connection_id_clone.clone(),
                        data: encoded,
                    };

                    if ws_msg_tx_clone.send(frame_msg).await.is_err() {
                        warn!("Failed to send frame to relay");
                        break;
                    }
                }
                Err(e) => {
                    warn!("Error reading from localhost: {}", e);
                    break;
                }
            }
        }

        // Send close message
        let close_msg = WebSocketMessage::WebSocketClose {
            connection_id: connection_id_clone.clone(),
        };
        let _ = ws_msg_tx_clone.send(close_msg).await;

        ws_connections_clone.remove(&connection_id_clone);
    });

    // Task 2: relay → localhost (receive from channel, write to local)
    let connection_id_clone2 = connection_id.clone();
    let relay_to_local = tokio::spawn(async move {
        while let Some(frame_data) = frame_rx.recv().await {
            if local_write.write_all(&frame_data).await.is_err() {
                warn!("Failed to write frame to localhost");
                break;
            }
        }
        info!("Relay closed WebSocket: {}", connection_id_clone2);
    });

    // Wait for either direction to close
    tokio::select! {
        _ = local_to_relay => {
            debug!("Local-to-relay forwarding ended");
        }
        _ = relay_to_local => {
            debug!("Relay-to-local forwarding ended");
        }
    }

    // Cleanup
    ws_connections.remove(&connection_id);
    info!("WebSocket connection closed: {}", connection_id);

    Ok(())
}

/// Build TLS connector that trusts both standard CAs and Cloudflare Origin CA
fn build_tls_connector() -> Result<tokio_tungstenite::Connector> {
    use rustls_pki_types::pem::PemObject;
    use rustls_pki_types::CertificateDer;

    // Start with Mozilla's root certificates
    let mut root_store = RootCertStore::empty();
    root_store.extend(webpki_roots::TLS_SERVER_ROOTS.iter().cloned());

    // Add Cloudflare Origin CA root certificate (embedded at compile time)
    // https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/#cloudflare-origin-ca-root-certificate
    let cloudflare_ca_pem = include_bytes!("../certs/cloudflare_origin_ca.pem");
    for cert in CertificateDer::pem_slice_iter(cloudflare_ca_pem) {
        let cert = cert.context("Failed to parse Cloudflare Origin CA PEM")?;
        root_store
            .add(cert)
            .context("Failed to add Cloudflare Origin CA")?;
    }

    let config = rustls::ClientConfig::builder()
        .with_root_certificates(root_store)
        .with_no_client_auth();

    Ok(tokio_tungstenite::Connector::Rustls(Arc::new(config)))
}
