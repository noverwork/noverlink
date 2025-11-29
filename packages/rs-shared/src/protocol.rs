//! WebSocket protocol messages shared between CLI and Relay
//!
//! Defines the message format exchanged over WebSocket between the relay server
//! and CLI clients for tunnel communication.

use serde::{Deserialize, Serialize};

/// Connection ticket payload structure
///
/// This is the decoded payload from a connection ticket issued by the backend.
/// The ticket is base64url-encoded JSON with an HMAC-SHA256 signature.
///
/// Format: `BASE64URL(payload).HMAC_SIGNATURE`
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TicketPayload {
    /// User ID (UUID)
    pub user_id: String,
    /// User's subscription plan
    pub plan: String,
    /// Maximum number of concurrent tunnels allowed
    pub max_tunnels: u8,
    /// Reserved subdomain (None = random assignment)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subdomain: Option<String>,
    /// Unique ticket ID for replay prevention
    pub ticket_id: String,
    /// Expiration timestamp (Unix seconds)
    pub exp: i64,
    /// HMAC-SHA256 signature (hex-encoded)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub sig: Option<String>,
}

/// WebSocket message types for relay-CLI communication
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum WebSocketMessage {
    /// CLI → Relay: Register a new tunnel
    ///
    /// The CLI sends this message when establishing a new tunnel.
    /// The ticket is a signed JWT from the backend that authorizes the connection.
    Register {
        /// Connection ticket from backend (HMAC-signed, contains `user_id`, plan, etc.)
        ticket: String,
        /// Local port on CLI side to forward traffic to
        local_port: u16,
    },

    /// Relay → CLI: Acknowledge tunnel registration
    ///
    /// Sent by the relay after successfully registering a tunnel.
    Ack {
        /// Assigned subdomain (e.g., "myapp" or "abc123")
        domain: String,
        /// Full public URL for the tunnel (e.g., `<http://abc123.localhost:8080>`)
        url: String,
    },

    /// Relay → CLI: Forward HTTP request
    ///
    /// The relay forwards an incoming HTTP request to the CLI.
    /// The payload is base64-encoded raw HTTP bytes.
    Request {
        /// Unique identifier for this request, used to match with response
        request_id: u64,
        /// Base64-encoded raw HTTP request bytes
        payload: String,
    },

    /// CLI → Relay: Return HTTP response
    ///
    /// The CLI sends back the HTTP response from localhost.
    /// The payload is base64-encoded raw HTTP bytes.
    Response {
        /// Request ID matching the original Request message
        request_id: u64,
        /// Base64-encoded raw HTTP response bytes
        payload: String,
    },

    /// Error message
    ///
    /// Can be sent by either party to indicate an error condition.
    Error {
        /// Human-readable error description
        message: String,
    },

    /// Heartbeat ping
    ///
    /// Sent to keep the connection alive and detect disconnections.
    Ping,

    /// Heartbeat pong
    ///
    /// Response to a Ping message.
    Pong,

    /// Relay → CLI: New WebSocket connection incoming
    ///
    /// Notifies CLI that a client wants to establish a WebSocket connection.
    /// Includes the initial HTTP upgrade request that CLI should forward to localhost.
    WebSocketUpgrade {
        /// Unique connection ID for this WebSocket session
        connection_id: String,
        /// Base64-encoded initial HTTP upgrade request
        initial_request: String,
    },

    /// CLI → Relay: WebSocket ready for proxying
    ///
    /// CLI confirms it has established connection to localhost WebSocket
    /// and received 101 Switching Protocols response. Includes the response
    /// for Relay to forward to the client.
    WebSocketReady {
        /// Connection ID matching the `WebSocketUpgrade` message
        connection_id: String,
        /// Base64-encoded 101 response from localhost
        upgrade_response: String,
    },

    /// Bidirectional: WebSocket frame data
    ///
    /// Used to forward WebSocket frames between Relay and CLI.
    /// Direction is implicit based on sender (Relay→CLI = downstream, CLI→Relay = upstream).
    WebSocketFrame {
        /// Connection ID
        connection_id: String,
        /// Base64-encoded frame data (raw WebSocket frame bytes)
        data: String,
    },

    /// Either party: Close WebSocket connection
    ///
    /// Sent when either side closes the WebSocket connection.
    WebSocketClose {
        /// Connection ID
        connection_id: String,
    },
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_register_serialization() {
        let msg = WebSocketMessage::Register {
            ticket: "eyJ1c2VyX2lkIjoiYWJjMTIzIn0.c2lnbmF0dXJl".to_string(),
            local_port: 3000,
        };

        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("\"type\":\"register\""));
        assert!(json.contains("\"ticket\":\"eyJ1c2VyX2lkIjoiYWJjMTIzIn0.c2lnbmF0dXJl\""));
        assert!(json.contains("\"local_port\":3000"));
    }

    #[test]
    fn test_register_deserialization() {
        let json = r#"{"type":"register","ticket":"test_ticket","local_port":8080}"#;
        let msg: WebSocketMessage = serde_json::from_str(json).unwrap();

        match msg {
            WebSocketMessage::Register { ticket, local_port } => {
                assert_eq!(ticket, "test_ticket");
                assert_eq!(local_port, 8080);
            }
            _ => panic!("Wrong message type"),
        }
    }

    #[test]
    fn test_ack_serialization() {
        let msg = WebSocketMessage::Ack {
            domain: "abc123.noverlink.io".to_string(),
            url: "https://abc123.noverlink.io".to_string(),
        };

        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("\"type\":\"ack\""));
    }

    #[test]
    fn test_request_response_roundtrip() {
        let request = WebSocketMessage::Request {
            request_id: 12345,
            payload: "SEVMTE8gV09STEQ=".to_string(),
        };

        let json = serde_json::to_string(&request).unwrap();
        let decoded: WebSocketMessage = serde_json::from_str(&json).unwrap();

        match decoded {
            WebSocketMessage::Request { request_id, payload } => {
                assert_eq!(request_id, 12345);
                assert_eq!(payload, "SEVMTE8gV09STEQ=");
            }
            _ => panic!("Wrong message type"),
        }
    }

    #[test]
    fn test_error_message() {
        let msg = WebSocketMessage::Error {
            message: "Connection failed".to_string(),
        };

        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("\"type\":\"error\""));
        assert!(json.contains("Connection failed"));
    }

    #[test]
    fn test_ping_pong() {
        let ping = WebSocketMessage::Ping;
        let pong = WebSocketMessage::Pong;

        let ping_json = serde_json::to_string(&ping).unwrap();
        let pong_json = serde_json::to_string(&pong).unwrap();

        assert!(ping_json.contains("\"type\":\"ping\""));
        assert!(pong_json.contains("\"type\":\"pong\""));
    }

    #[test]
    fn test_websocket_upgrade() {
        let msg = WebSocketMessage::WebSocketUpgrade {
            connection_id: "ws-abc123".to_string(),
            initial_request: "R0VUIC8gSFRUUC8xLjENCg==".to_string(), // base64: GET / HTTP/1.1
        };

        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("\"type\":\"websocketupgrade\""));
        assert!(json.contains("\"connection_id\":\"ws-abc123\""));
        assert!(json.contains("\"initial_request\""));
    }

    #[test]
    fn test_websocket_ready() {
        let msg = WebSocketMessage::WebSocketReady {
            connection_id: "ws-abc123".to_string(),
            upgrade_response: "SFRUUC8xLjEgMTAxIA==".to_string(), // base64: HTTP/1.1 101
        };

        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("\"type\":\"websocketready\""));
        assert!(json.contains("\"connection_id\":\"ws-abc123\""));
        assert!(json.contains("\"upgrade_response\""));
    }

    #[test]
    fn test_websocket_frame() {
        let msg = WebSocketMessage::WebSocketFrame {
            connection_id: "ws-abc123".to_string(),
            data: "SGVsbG8gV29ybGQ=".to_string(), // base64: Hello World
        };

        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("\"type\":\"websocketframe\""));
        assert!(json.contains("\"connection_id\":\"ws-abc123\""));
        assert!(json.contains("\"data\""));
    }

    #[test]
    fn test_websocket_close() {
        let msg = WebSocketMessage::WebSocketClose {
            connection_id: "ws-abc123".to_string(),
        };

        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("\"type\":\"websocketclose\""));
        assert!(json.contains("\"connection_id\":\"ws-abc123\""));
    }
}
