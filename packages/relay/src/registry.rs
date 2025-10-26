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
    /// Base domain for constructing full URLs
    base_domain: String,
}

impl TunnelRegistry {
    pub fn new(base_domain: String) -> Self {
        Self {
            tunnels: DashMap::new(),
            next_request_id: std::sync::atomic::AtomicU64::new(1),
            pending_requests: DashMap::new(),
            base_domain,
        }
    }

    /// Get full URL for a subdomain
    pub fn get_full_url(&self, subdomain: &str) -> String {
        format!("http://{}.{}", subdomain, self.base_domain)
    }

    /// Generate a random human-readable subdomain
    ///
    /// Generates names like "happy-cat", "blue-moon", "lazy-dog"
    /// using the petname library for memorable, unique subdomains.
    /// This is a static method as it doesn't depend on registry state.
    pub fn generate_random_subdomain() -> String {
        // Generate 2-word petname with dash separator (e.g., "happy-cat")
        // Using 2 words for balance between uniqueness and brevity
        petname::petname(2, "-").unwrap_or_else(|| {
            // Fallback to timestamp-based subdomain if petname fails
            use std::time::{SystemTime, UNIX_EPOCH};
            // SAFETY: System time should always be after UNIX_EPOCH on any modern system
            #[allow(clippy::expect_used)]
            let timestamp = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("System time is before UNIX_EPOCH")
                .as_millis();
            format!("tunnel-{}", timestamp % 100_000)
        })
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
