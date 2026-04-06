use anyhow::{Context, Result};
use std::sync::Arc;
use tokio::net::TcpStream;
use tokio::sync::mpsc;

pub struct TunnelRequest {
    pub client_stream: TcpStream,
    pub headers_buffer: Vec<u8>,
}

pub struct DeviceConnection {
    pub sender: mpsc::Sender<TunnelRequest>,
}

#[derive(Clone)]
pub struct DeviceManager {
    connections: Arc<dashmap::DashMap<String, DeviceConnection>>,
}

impl DeviceManager {
    pub fn new() -> Self {
        Self {
            connections: Arc::new(dashmap::DashMap::new()),
        }
    }

    pub fn register(&self, device_id: String) -> mpsc::Receiver<TunnelRequest> {
        let (tx, rx) = mpsc::channel(10);
        self.connections
            .insert(device_id, DeviceConnection { sender: tx });
        rx
    }

    pub fn unregister(&self, device_id: &str) {
        self.connections.remove(device_id);
    }

    pub fn get_sender(&self, device_id: &str) -> Option<mpsc::Sender<TunnelRequest>> {
        self.connections
            .get(device_id)
            .map(|ref multi| multi.sender.clone())
    }
}

impl Default for DeviceManager {
    fn default() -> Self {
        Self::new()
    }
}
