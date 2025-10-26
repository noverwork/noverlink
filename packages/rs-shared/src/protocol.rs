//! WebSocket protocol messages shared between CLI and Relay
//!
//! Defines the message format exchanged over WebSocket between the relay server
//! and CLI clients for tunnel communication.

use serde::{Deserialize, Serialize};

/// WebSocket message types for relay-CLI communication
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum WebSocketMessage {
    /// CLI → Relay: Register a new tunnel
    ///
    /// The CLI sends this message when establishing a new tunnel.
    /// If domain is None, the relay will assign a random subdomain.
    Register {
        #[serde(skip_serializing_if = "Option::is_none")]
        domain: Option<String>,
        local_port: u16,
    },

    /// Relay → CLI: Acknowledge tunnel registration
    ///
    /// Sent by the relay after successfully registering a tunnel.
    Ack {
        domain: String,
        url: String,
    },

    /// Relay → CLI: Forward HTTP request
    ///
    /// The relay forwards an incoming HTTP request to the CLI.
    /// The payload is base64-encoded raw HTTP bytes.
    Request {
        request_id: u64,
        payload: String, // base64 encoded HTTP request
    },

    /// CLI → Relay: Return HTTP response
    ///
    /// The CLI sends back the HTTP response from localhost.
    /// The payload is base64-encoded raw HTTP bytes.
    Response {
        request_id: u64,
        payload: String, // base64 encoded HTTP response
    },

    /// Error message
    ///
    /// Can be sent by either party to indicate an error condition.
    Error {
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
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_register_serialization() {
        let msg = WebSocketMessage::Register {
            domain: Some("myapp".to_string()),
            local_port: 3000,
        };

        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("\"type\":\"register\""));
        assert!(json.contains("\"domain\":\"myapp\""));
        assert!(json.contains("\"local_port\":3000"));
    }

    #[test]
    fn test_register_without_domain() {
        let msg = WebSocketMessage::Register {
            domain: None,
            local_port: 3000,
        };

        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("\"type\":\"register\""));
        assert!(!json.contains("\"domain\"")); // Should be skipped
        assert!(json.contains("\"local_port\":3000"));
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
}
