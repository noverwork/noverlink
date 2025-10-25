//! WebSocket protocol for relay-CLI communication
//!
//! Defines the message format exchanged between the relay server and CLI clients.

use serde::{Deserialize, Serialize};

/// Protocol messages sent over WebSocket between relay and CLI
#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "type")]
pub enum WebSocketMessage {
    /// CLI registers a tunnel for a specific domain
    #[serde(rename = "register")]
    Register {
        domain: String,
        local_port: u16,
    },

    /// Relay forwards HTTP request to CLI
    #[serde(rename = "request")]
    Request {
        request_id: u64,
        payload: String, // Base64-encoded HTTP request
    },

    /// CLI returns HTTP response to relay
    #[serde(rename = "response")]
    Response {
        request_id: u64,
        payload: String, // Base64-encoded HTTP response
    },

    /// Relay acknowledges successful tunnel registration
    #[serde(rename = "ack")]
    Ack {
        domain: String,
        url: String,
    },
}
