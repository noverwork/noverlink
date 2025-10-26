//! Tunnel registry for managing active CLI connections

use std::sync::Arc;

use dashmap::DashMap;
use tokio::sync::mpsc;
use tracing::{info, warn};

/// Message sent to tunnel for proxying HTTP requests
pub struct TunnelMessage {
    /// Request ID for tracking
    pub request_id: u64,
    /// Raw HTTP request bytes
    pub request_data: Vec<u8>,
    /// Channel to send response back
    #[allow(dead_code)] // Will be used when response flow is implemented
    pub response_tx: mpsc::Sender<Vec<u8>>,
}

/// Represents a tunnel from CLI to relay
pub struct Tunnel {
    /// Domain name for this tunnel (e.g., "myapp.noverlink.io")
    #[allow(dead_code)] // Used for logging and debugging
    pub domain: String,
    /// Channel to send requests to CLI
    pub request_tx: mpsc::Sender<TunnelMessage>,
    /// Local port on CLI side
    #[allow(dead_code)] // Will be used for connection tracking
    pub local_port: u16,
}

/// Thread-safe registry of active tunnels
pub struct TunnelRegistry {
    /// Map: domain -> Tunnel
    tunnels: DashMap<String, Arc<Tunnel>>,
    /// Request ID counter
    next_request_id: std::sync::atomic::AtomicU64,
    /// Map: `request_id` -> response channel
    pending_requests: DashMap<u64, mpsc::Sender<Vec<u8>>>,
}

impl TunnelRegistry {
    pub fn new() -> Self {
        Self {
            tunnels: DashMap::new(),
            next_request_id: std::sync::atomic::AtomicU64::new(1),
            pending_requests: DashMap::new(),
        }
    }

    /// Generate a random subdomain (6 alphanumeric characters)
    pub fn generate_random_subdomain(&self) -> String {
        use std::sync::atomic::{AtomicU64, Ordering};
        static COUNTER: AtomicU64 = AtomicU64::new(0);

        // Use timestamp + counter for uniqueness
        let timestamp = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let counter = COUNTER.fetch_add(1, Ordering::Relaxed);

        // Generate pseudo-random subdomain
        // Format: base36(timestamp) + base36(counter)
        let ts_part = base36_encode(timestamp % 46656); // 36^3
        let counter_part = base36_encode(counter % 1296); // 36^2

        format!("{}{}", ts_part, counter_part)
    }

    /// Check if domain is available
    pub fn is_domain_available(&self, domain: &str) -> bool {
        !self.tunnels.contains_key(domain)
    }

    /// Register a new tunnel
    pub fn register(
        &self,
        domain: String,
        request_tx: mpsc::Sender<TunnelMessage>,
        local_port: u16,
    ) -> Arc<Tunnel> {
        let tunnel = Arc::new(Tunnel {
            domain: domain.clone(),
            request_tx,
            local_port,
        });

        self.tunnels.insert(domain.clone(), Arc::clone(&tunnel));
        info!("Registered tunnel: {} -> localhost:{}", domain, local_port);

        tunnel
    }

    /// Get tunnel by domain
    pub fn get(&self, domain: &str) -> Option<Arc<Tunnel>> {
        self.tunnels.get(domain).map(|entry| Arc::clone(entry.value()))
    }

    /// Remove tunnel by domain
    pub fn remove(&self, domain: &str) {
        if self.tunnels.remove(domain).is_some() {
            warn!("Tunnel removed: {}", domain);
        }
    }

    /// Generate next request ID
    pub fn next_request_id(&self) -> u64 {
        self.next_request_id
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed)
    }

    /// Register a pending request waiting for response
    pub fn register_pending_request(&self, request_id: u64, response_tx: mpsc::Sender<Vec<u8>>) {
        self.pending_requests.insert(request_id, response_tx);
    }

    /// Send response to a pending request
    pub async fn send_response(&self, request_id: u64, response_data: Vec<u8>) -> bool {
        if let Some((_, response_tx)) = self.pending_requests.remove(&request_id) {
            if response_tx.send(response_data).await.is_ok() {
                return true;
            }
        }
        false
    }
}

impl Default for TunnelRegistry {
    fn default() -> Self {
        Self::new()
    }
}

/// Encode a number as base36 (lowercase)
fn base36_encode(mut num: u64) -> String {
    const CHARS: &[u8] = b"0123456789abcdefghijklmnopqrstuvwxyz";

    if num == 0 {
        return "0".to_string();
    }

    let mut result = Vec::new();
    while num > 0 {
        result.push(CHARS[(num % 36) as usize]);
        num /= 36;
    }

    result.reverse();
    String::from_utf8(result).unwrap()
}
