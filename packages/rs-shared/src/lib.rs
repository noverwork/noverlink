//! Shared types and utilities for Noverlink
//!
//! This crate contains common code used by both the relay server and CLI client.

pub mod config;
pub mod protocol;

pub use config::{get_env, get_env_or, get_env_opt, get_env_parse, get_env_parse_or, load_dotenv};
pub use protocol::{TicketPayload, WebSocketMessage};

#[cfg(feature = "cli")]
pub use config::cli::API_URL;

#[cfg(feature = "relay")]
pub use config::relay::RelayConfig;
