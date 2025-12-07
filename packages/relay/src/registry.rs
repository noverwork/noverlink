//! Tunnel registry for managing active CLI connections

use std::sync::Arc;

use dashmap::DashMap;
use tokio::sync::mpsc;
use tracing::{info, warn};

/// Message sent to tunnel for proxying
#[derive(Debug, Clone)]
pub enum TunnelMessage {
    /// HTTP request-response message
    HttpRequest {
        /// Request ID for tracking
        request_id: u64,
        /// Raw HTTP request bytes
        request_data: Vec<u8>,
    },

    /// WebSocket upgrade request
    WebSocketUpgrade {
        /// Connection ID for this WebSocket
        connection_id: String,
        /// Raw HTTP upgrade request
        request_data: Vec<u8>,
    },

    /// WebSocket frame to forward to CLI
    WebSocketFrame {
        /// Connection ID
        connection_id: String,
        /// Frame data
        frame_data: Vec<u8>,
    },

    /// Close WebSocket connection
    WebSocketClose {
        /// Connection ID
        connection_id: String,
    },
}

/// Represents a tunnel from CLI to relay
pub struct Tunnel {
    /// Domain name for this tunnel (e.g., "myapp.noverlink.io")
    #[allow(dead_code)] // Used for logging and debugging
    pub domain: String,
    /// Base domain for this tunnel (e.g., "noverlink.app" or "noverlink-free.app")
    #[allow(dead_code)] // Stored for future use (e.g., constructing URLs)
    pub base_domain: String,
    /// User ID who owns this tunnel
    #[allow(dead_code)] // Stored for future use (e.g., rate limiting by user)
    pub user_id: String,
    /// Backend session ID for this tunnel
    pub session_id: String,
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
    /// Default base domain (used for logging only, actual domain comes from ticket)
    default_base_domain: String,
    /// WebSocket connection ID counter
    next_ws_connection_id: std::sync::atomic::AtomicU64,
    /// Map: `connection_id` -> (`response_channel`, `frame_channel`)
    /// `response_channel`: for sending the 101 upgrade response back
    /// `frame_channel`: for sending WebSocket frames from client to CLI
    #[allow(clippy::type_complexity)]
    pending_websockets: DashMap<String, (mpsc::Sender<Vec<u8>>, mpsc::Sender<Vec<u8>>)>,
}

impl TunnelRegistry {
    pub fn new(default_base_domain: String) -> Self {
        Self {
            tunnels: DashMap::new(),
            next_request_id: std::sync::atomic::AtomicU64::new(1),
            pending_requests: DashMap::new(),
            default_base_domain,
            next_ws_connection_id: std::sync::atomic::AtomicU64::new(1),
            pending_websockets: DashMap::new(),
        }
    }

    /// Get full URL for a subdomain with the specified base domain
    #[allow(clippy::unused_self)]
    pub fn get_full_url(&self, subdomain: &str, base_domain: &str) -> String {
        format!("https://{}.{}", subdomain, base_domain)
    }

    /// Get default base domain (for logging purposes)
    #[allow(dead_code)]
    pub fn default_base_domain(&self) -> &str {
        &self.default_base_domain
    }

    /// Check if domain is available
    pub fn is_domain_available(&self, domain: &str) -> bool {
        !self.tunnels.contains_key(domain)
    }

    /// Register a new tunnel
    pub fn register(
        &self,
        domain: String,
        base_domain: String,
        user_id: String,
        session_id: String,
        request_tx: mpsc::Sender<TunnelMessage>,
        local_port: u16,
    ) -> Arc<Tunnel> {
        let tunnel = Arc::new(Tunnel {
            domain: domain.clone(),
            base_domain: base_domain.clone(),
            user_id: user_id.clone(),
            session_id: session_id.clone(),
            request_tx,
            local_port,
        });

        self.tunnels.insert(domain.clone(), Arc::clone(&tunnel));
        info!(
            "Registered tunnel: {}.{} -> localhost:{} (user: {}, session: {})",
            domain, base_domain, local_port, user_id, session_id
        );

        tunnel
    }

    /// Get tunnel by domain
    pub fn get(&self, domain: &str) -> Option<Arc<Tunnel>> {
        self.tunnels
            .get(domain)
            .map(|entry| Arc::clone(entry.value()))
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

    /// Generate next WebSocket connection ID
    pub fn next_ws_connection_id(&self) -> String {
        let id = self
            .next_ws_connection_id
            .fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        format!("ws-{}", id)
    }

    /// Register a pending WebSocket connection
    ///
    /// Returns channels for:
    /// - `response_rx`: receives the 101 upgrade response from CLI
    /// - `frame_rx`: receives WebSocket frames from CLI (to send to browser)
    pub fn register_pending_websocket(
        &self,
        connection_id: String,
    ) -> (mpsc::Receiver<Vec<u8>>, mpsc::Receiver<Vec<u8>>) {
        let (response_tx, response_rx) = mpsc::channel(1);
        let (frame_tx, frame_rx) = mpsc::channel(100);

        self.pending_websockets
            .insert(connection_id, (response_tx, frame_tx));

        (response_rx, frame_rx)
    }

    /// Send 101 upgrade response for a WebSocket connection
    pub async fn send_websocket_upgrade_response(
        &self,
        connection_id: &str,
        response_data: Vec<u8>,
    ) -> bool {
        if let Some(entry) = self.pending_websockets.get(connection_id) {
            if entry.value().0.send(response_data).await.is_ok() {
                return true;
            }
        }
        false
    }

    /// Send WebSocket frame from CLI to browser
    pub async fn send_websocket_frame(&self, connection_id: &str, frame_data: Vec<u8>) -> bool {
        if let Some(entry) = self.pending_websockets.get(connection_id) {
            if entry.value().1.send(frame_data).await.is_ok() {
                return true;
            }
        }
        false
    }

    /// Remove WebSocket connection
    pub fn remove_websocket(&self, connection_id: &str) {
        self.pending_websockets.remove(connection_id);
        info!("WebSocket connection removed: {}", connection_id);
    }
}

#[cfg(test)]
#[allow(clippy::unwrap_used, clippy::expect_used)]
mod tests {
    use super::*;

    #[test]
    fn test_registry_new() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());
        assert!(registry.is_domain_available("test"));
    }

    #[test]
    fn test_get_full_url() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());
        let url = registry.get_full_url("myapp", "noverlink.app");
        assert_eq!(url, "https://myapp.noverlink.app");
    }

    #[test]
    fn test_get_full_url_sandbox() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());
        let url = registry.get_full_url("myapp", "noverlink-free.app");
        assert_eq!(url, "https://myapp.noverlink-free.app");
    }

    #[test]
    fn test_register_and_get_tunnel() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());
        let (tx, _rx) = mpsc::channel(10);

        assert!(registry.is_domain_available("test-domain"));

        let tunnel = registry.register(
            "test-domain".to_string(),
            "noverlink.app".to_string(),
            "user-123".to_string(),
            "session-456".to_string(),
            tx,
            3000,
        );

        assert!(!registry.is_domain_available("test-domain"));
        assert_eq!(tunnel.session_id, "session-456");
        assert_eq!(tunnel.base_domain, "noverlink.app");

        let retrieved = registry.get("test-domain");
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().session_id, "session-456");
    }

    #[test]
    fn test_get_nonexistent_tunnel() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());
        let result = registry.get("nonexistent");
        assert!(result.is_none());
    }

    #[test]
    fn test_remove_tunnel() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());
        let (tx, _rx) = mpsc::channel(10);

        registry.register(
            "to-remove".to_string(),
            "noverlink.app".to_string(),
            "user".to_string(),
            "session".to_string(),
            tx,
            3000,
        );

        assert!(!registry.is_domain_available("to-remove"));

        registry.remove("to-remove");

        assert!(registry.is_domain_available("to-remove"));
        assert!(registry.get("to-remove").is_none());
    }

    #[test]
    fn test_request_id_generation() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());

        let id1 = registry.next_request_id();
        let id2 = registry.next_request_id();
        let id3 = registry.next_request_id();

        assert_eq!(id1, 1);
        assert_eq!(id2, 2);
        assert_eq!(id3, 3);
    }

    #[test]
    fn test_ws_connection_id_generation() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());

        let id1 = registry.next_ws_connection_id();
        let id2 = registry.next_ws_connection_id();

        assert_eq!(id1, "ws-1");
        assert_eq!(id2, "ws-2");
    }

    #[tokio::test]
    async fn test_pending_request_flow() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());
        let (tx, mut rx) = mpsc::channel(1);

        let request_id = registry.next_request_id();
        registry.register_pending_request(request_id, tx);

        let response_data = b"HTTP/1.1 200 OK\r\n\r\n".to_vec();
        let sent = registry
            .send_response(request_id, response_data.clone())
            .await;

        assert!(sent);

        let received = rx.recv().await;
        assert!(received.is_some());
        assert_eq!(received.unwrap(), response_data);
    }

    #[tokio::test]
    async fn test_send_response_unknown_request() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());

        let sent = registry.send_response(999, vec![1, 2, 3]).await;

        assert!(!sent);
    }

    #[tokio::test]
    async fn test_pending_websocket_flow() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());

        let conn_id = registry.next_ws_connection_id();
        let (mut response_rx, mut frame_rx) = registry.register_pending_websocket(conn_id.clone());

        // Send upgrade response
        let upgrade_response = b"HTTP/1.1 101 Switching Protocols\r\n\r\n".to_vec();
        let sent = registry
            .send_websocket_upgrade_response(&conn_id, upgrade_response.clone())
            .await;
        assert!(sent);

        let received = response_rx.recv().await;
        assert_eq!(received.unwrap(), upgrade_response);

        // Send frame
        let frame_data = b"test frame data".to_vec();
        let sent = registry
            .send_websocket_frame(&conn_id, frame_data.clone())
            .await;
        assert!(sent);

        let received = frame_rx.recv().await;
        assert_eq!(received.unwrap(), frame_data);
    }

    #[test]
    fn test_remove_websocket() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());

        let conn_id = registry.next_ws_connection_id();
        let (_response_rx, _frame_rx) = registry.register_pending_websocket(conn_id.clone());

        registry.remove_websocket(&conn_id);

        // Verify removed - sending should fail
        // We can't easily test this without async, but we can verify the map is empty
    }

    #[tokio::test]
    async fn test_send_to_removed_websocket() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());

        let conn_id = registry.next_ws_connection_id();
        let (_response_rx, _frame_rx) = registry.register_pending_websocket(conn_id.clone());

        registry.remove_websocket(&conn_id);

        let sent = registry
            .send_websocket_upgrade_response(&conn_id, vec![])
            .await;
        assert!(!sent);
    }

    #[test]
    fn test_multiple_tunnels() {
        let registry = TunnelRegistry::new("noverlink.io".to_string());

        for i in 0..5 {
            let (tx, _rx) = mpsc::channel(10);
            let base = if i % 2 == 0 {
                "noverlink.app"
            } else {
                "noverlink-free.app"
            };
            registry.register(
                format!("tunnel-{}", i),
                base.to_string(),
                format!("user-{}", i),
                format!("session-{}", i),
                tx,
                3000 + u16::try_from(i).unwrap(),
            );
        }

        for i in 0..5 {
            let domain = format!("tunnel-{}", i);
            assert!(!registry.is_domain_available(&domain));
            let tunnel = registry.get(&domain).unwrap();
            assert_eq!(tunnel.session_id, format!("session-{}", i));
        }
    }

    #[test]
    fn test_tunnel_message_variants() {
        let http_msg = TunnelMessage::HttpRequest {
            request_id: 1,
            request_data: vec![1, 2, 3],
        };

        let ws_upgrade = TunnelMessage::WebSocketUpgrade {
            connection_id: "ws-1".to_string(),
            request_data: vec![4, 5, 6],
        };

        let ws_frame = TunnelMessage::WebSocketFrame {
            connection_id: "ws-1".to_string(),
            frame_data: vec![7, 8, 9],
        };

        let ws_close = TunnelMessage::WebSocketClose {
            connection_id: "ws-1".to_string(),
        };

        // Just verify they can be created and formatted
        assert!(format!("{:?}", http_msg).contains("HttpRequest"));
        assert!(format!("{:?}", ws_upgrade).contains("WebSocketUpgrade"));
        assert!(format!("{:?}", ws_frame).contains("WebSocketFrame"));
        assert!(format!("{:?}", ws_close).contains("WebSocketClose"));
    }
}
