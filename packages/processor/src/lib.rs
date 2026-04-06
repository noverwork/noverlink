use anyhow::{Context, Result};
use relay_protocol::{encode_control, encode_tunnel, try_parse_frame, Frame, Message};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::io::{AsyncReadExt, AsyncWriteExt, BufReader};
use tokio::net::TcpStream;
use tokio::sync::mpsc;

mod config;

pub use config::Config;

pub struct TunnelRequest {
    pub tunnel_id: u64,
    pub headers_buffer: Vec<u8>,
}

struct DeviceConnection {
    sender: mpsc::Sender<TunnelRequest>,
}

#[derive(Clone)]
pub struct DeviceManager {
    connections: Arc<dashmap::DashMap<String, DeviceConnection>>,
    pending_tunnels: Arc<dashmap::DashMap<u64, TcpStream>>,
}

impl DeviceManager {
    pub fn new() -> Self {
        Self {
            connections: Arc::new(dashmap::DashMap::new()),
            pending_tunnels: Arc::new(dashmap::DashMap::new()),
        }
    }

    pub fn register(&self, device_id: String) -> mpsc::Receiver<TunnelRequest> {
        let (tx, rx) = mpsc::channel(10);
        self.connections.insert(device_id, DeviceConnection { sender: tx });
        rx
    }

    pub fn unregister(&self, device_id: &str) {
        self.connections.remove(device_id);
    }

    pub fn get_sender(&self, device_id: &str) -> Option<mpsc::Sender<TunnelRequest>> {
        self.connections.get(device_id).map(|ref multi| multi.sender.clone())
    }

    pub fn store_client(&self, tunnel_id: u64, stream: TcpStream) {
        self.pending_tunnels.insert(tunnel_id, stream);
    }

    pub fn take_client(&self, tunnel_id: u64) -> Option<TcpStream> {
        self.pending_tunnels.remove(&tunnel_id).map(|(_, v)| v)
    }
}

impl Default for DeviceManager {
    fn default() -> Self {
        Self::new()
    }
}

pub fn init_tracing() -> Result<()> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        .with_env_filter(
            tracing_subscriber::EnvFilter::from_default_env()
                .add_directive("relay=info".parse().unwrap())
        )
        .try_init()
        .map_err(|e| anyhow::anyhow!("failed to initialize tracing: {}", e))
}

pub async fn run() -> Result<()> {
    let config = Config::from_env()
        .context("failed to load configuration")?;
    let device_manager = DeviceManager::new();

    let agent_addr: SocketAddr = SocketAddr::from(([0, 0, 0, 0], config.agent_port));
    let http_addr: SocketAddr = SocketAddr::from(([0, 0, 0, 0], config.http_port));

    let agent_listener = tokio::net::TcpListener::bind(agent_addr)
        .await
        .with_context(|| format!("failed to bind agent listener on {agent_addr}"))?;

    let http_listener = tokio::net::TcpListener::bind(http_addr)
        .await
        .with_context(|| format!("failed to bind HTTP listener on {http_addr}"))?;

    tracing::info!(agent_addr = %agent_addr, http_addr = %http_addr, "relay server ready");

    let shutdown = wait_for_shutdown();
    tokio::pin!(shutdown);

    loop {
        tokio::select! {
            shutdown_result = &mut shutdown => {
                shutdown_result?;
                break;
            }
            agent_incoming = agent_listener.accept() => {
                let (stream, peer_addr) = agent_incoming.context("failed to accept agent connection")?;
                let manager = device_manager.clone();
                tokio::spawn(async move {
                    if let Err(e) = handle_agent_connection(stream, peer_addr, manager).await {
                        tracing::error!("agent connection error: {}", e);
                    }
                });
            }
            http_incoming = http_listener.accept() => {
                let (stream, peer_addr) = http_incoming.context("failed to accept HTTP connection")?;
                let manager = device_manager.clone();
                tokio::spawn(async move {
                    if let Err(e) = handle_http_tunnel(stream, peer_addr, manager).await {
                        tracing::error!("HTTP tunnel error: {}", e);
                    }
                });
            }
        }
    }

    Ok(())
}

async fn handle_agent_connection(
    stream: TcpStream,
    peer_addr: SocketAddr,
    manager: DeviceManager,
) -> Result<()> {
    let (read_half, mut write_half) = stream.into_split();
    let mut reader = BufReader::new(read_half);

    let mut registered_device_id: Option<String> = None;
    let mut rx: Option<mpsc::Receiver<TunnelRequest>> = None;

    let mut buffer = Vec::with_capacity(65536);

    loop {
        let mut chunk = [0u8; 4096];
        let n = reader.read(&mut chunk).await?;
        if n == 0 {
            if let Some(device_id) = registered_device_id {
                manager.unregister(&device_id);
                tracing::info!(device_id = %device_id, "device disconnected");
            }
            return Ok(());
        }

        buffer.extend_from_slice(&chunk[..n]);

        while let Some((frame, consumed)) = try_parse_frame(&buffer) {
            buffer.drain(..consumed);

            match frame {
                Frame::Control(Message::Register { device_id }) => {
                    tracing::info!(device_id = %device_id, %peer_addr, "device registered");
                    rx = Some(manager.register(device_id.clone()));
                    registered_device_id = Some(device_id);
                }
                Frame::Control(Message::Ping {}) => {
                    let pong = Message::pong();
                    let data = encode_control(&pong);
                    write_half.write_all(&data).await?;
                }
                Frame::Control(_) => {}
                Frame::Invalid => {}
                Frame::Tunnel(tunnel_frame) => {
                    if let Some(client_stream) = manager.take_client(tunnel_frame.tunnel_id) {
                        let mut client = client_stream;
                        client.write_all(&tunnel_frame.data).await?;
                        client.flush().await?;
                        tracing::debug!(tunnel_id = tunnel_frame.tunnel_id, "response written to client");
                    } else {
                        tracing::warn!(tunnel_id = tunnel_frame.tunnel_id, "no pending client for tunnel response");
                    }
                }
            }
        }

        if let Some(ref mut rx) = rx {
            if let Ok(request) = rx.try_recv() {
                let tunnel_id = request.tunnel_id;
                let headers = request.headers_buffer;

                let ctrl = Message::TunnelRequest { tunnel_id };
                write_half.write_all(&encode_control(&ctrl)).await?;

                write_half.write_all(&encode_tunnel(tunnel_id, &headers)).await?;
                write_half.flush().await?;

                tracing::info!(tunnel_id, "tunnel request sent to agent");
            }
        }
    }
}

async fn handle_http_tunnel(
    mut stream: TcpStream,
    peer_addr: SocketAddr,
    manager: DeviceManager,
) -> Result<()> {
    let mut buffer = Vec::with_capacity(4096);

    loop {
        let mut buf = [0u8; 1024];
        let n = stream.read(&mut buf).await?;
        if n == 0 {
            return Ok(());
        }
        buffer.extend_from_slice(&buf[..n]);

        if buffer.windows(4).any(|w| w == b"\r\n\r\n") {
            break;
        }
    }

    let request_str = String::from_utf8_lossy(&buffer);
    let lines: Vec<&str> = request_str.lines().collect();

    let mut device_id: Option<String> = None;
    for line in &lines[1..] {
        if line.is_empty() {
            break;
        }
        if let Some((key, value)) = line.split_once(':') {
            if key.trim().to_lowercase() == "x-device-id" {
                device_id = Some(value.trim().to_string());
            }
        }
    }

    let device_id = match device_id {
        Some(id) => id,
        None => {
            let response = b"HTTP/1.1 400 Bad Request\r\nContent-Length: 27\r\n\r\nMissing x-device-id header";
            stream.write_all(response).await?;
            return Ok(());
        }
    };

    let sender = match manager.get_sender(&device_id) {
        Some(s) => s,
        None => {
            let response = b"HTTP/1.1 404 Not Found\r\nContent-Length: 16\r\n\r\nDevice not found";
            stream.write_all(response).await?;
            return Ok(());
        }
    };

    let tunnel_id = relay_protocol::next_tunnel_id();
    manager.store_client(tunnel_id, stream);

    if sender.send(TunnelRequest {
        tunnel_id,
        headers_buffer: buffer,
    }).await.is_err() {
        tracing::error!(tunnel_id, "failed to send tunnel request");
        return Ok(());
    }

    tracing::info!(tunnel_id, %device_id, %peer_addr, "tunnel request queued");

    Ok(())
}

async fn wait_for_shutdown() -> Result<()> {
    #[cfg(unix)]
    {
        use tokio::signal::unix::{signal, SignalKind};

        let mut terminate = signal(SignalKind::terminate())
            .map_err(|error| anyhow::anyhow!("failed to register SIGTERM handler: {error}"))?;

        tokio::select! {
            signal = tokio::signal::ctrl_c() => {
                signal.map_err(|error| anyhow::anyhow!("failed to listen for shutdown signal: {error}"))?;
                tracing::info!("shutdown signal received via ctrl-c");
            }
            _ = terminate.recv() => {
                tracing::info!("shutdown signal received via SIGTERM");
            }
        }
    }

    #[cfg(not(unix))]
    {
        tokio::signal::ctrl_c()
            .await
            .map_err(|error| anyhow::anyhow!("failed to listen for shutdown signal: {error}"))?;
        tracing::info!("shutdown signal received via ctrl-c");
    }

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn config_requires_env_vars() {
        unsafe {
            std::env::remove_var("RELAY_AGENT_PORT");
            std::env::remove_var("RELAY_HTTP_PORT");
        }
        
        let result = Config::from_env();
        assert!(result.is_err());
    }
}
