//! Application configuration module
//!
//! Provides type-safe configuration loading from environment variables.
//! Similar to NestJS ConfigService pattern.

use std::env;
use std::path::Path;

#[cfg(feature = "relay")]
use std::sync::OnceLock;

use thiserror::Error;

/// Configuration loading errors
#[derive(Debug, Error)]
pub enum ConfigError {
    /// Required environment variable is missing
    #[error("Missing required environment variable: {0}")]
    MissingEnv(String),

    /// Environment variable has an invalid value
    #[error("Invalid value for {0}: {1}")]
    InvalidValue(String, String),
}

/// Load .env file from the current directory or specified path
pub fn load_dotenv() {
    let _ = dotenvy::dotenv();
}

/// Load .env file from a specific path
pub fn load_dotenv_from(path: impl AsRef<Path>) {
    let _ = dotenvy::from_path(path.as_ref());
}

/// Get a required environment variable
pub fn get_env(key: &str) -> Result<String, ConfigError> {
    env::var(key).map_err(|_| ConfigError::MissingEnv(key.to_string()))
}

/// Get an optional environment variable with a default value
pub fn get_env_or(key: &str, default: &str) -> String {
    env::var(key).unwrap_or_else(|_| default.to_string())
}

/// Get an optional environment variable
pub fn get_env_opt(key: &str) -> Option<String> {
    env::var(key).ok()
}

/// Parse a required environment variable as a specific type
pub fn get_env_parse<T: std::str::FromStr>(key: &str) -> Result<T, ConfigError> {
    let value = get_env(key)?;
    value
        .parse()
        .map_err(|_| ConfigError::InvalidValue(key.to_string(), value))
}

/// Parse an optional environment variable with a default
pub fn get_env_parse_or<T: std::str::FromStr>(key: &str, default: T) -> T {
    env::var(key)
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(default)
}

// ============================================================================
// CLI Configuration
// ============================================================================

/// CLI configuration module
#[cfg(feature = "cli")]
pub mod cli {
    /// API URL - baked in at compile time via NOVERLINK_API_URL env var
    pub const API_URL: &str = match option_env!("NOVERLINK_API_URL") {
        Some(url) => url,
        None => "http://localhost:3000/api",
    };
}

// ============================================================================
// Relay Configuration
// ============================================================================

/// Relay configuration module
#[cfg(feature = "relay")]
pub mod relay {
    use super::*;

    static CONFIG: OnceLock<RelayConfig> = OnceLock::new();

    /// Relay-specific configuration
    #[derive(Debug, Clone)]
    pub struct RelayConfig {
        /// WebSocket port for CLI connections
        pub ws_port: u16,

        /// HTTP port for public traffic
        pub http_port: u16,

        /// Base domain for tunnel URLs
        pub base_domain: String,

        /// Secret for ticket verification (must match backend)
        pub ticket_secret: String,

        /// Log level
        pub log_level: String,
    }

    impl RelayConfig {
        /// Load configuration from environment
        pub fn load() -> Result<Self, ConfigError> {
            load_dotenv();

            let ticket_secret = get_env("TICKET_SECRET")?;
            if ticket_secret.len() < 32 {
                return Err(ConfigError::InvalidValue(
                    "TICKET_SECRET".to_string(),
                    "must be at least 32 characters".to_string(),
                ));
            }

            Ok(Self {
                ws_port: get_env_parse("WS_PORT")?,
                http_port: get_env_parse("HTTP_PORT")?,
                base_domain: get_env("BASE_DOMAIN")?,
                ticket_secret,
                log_level: get_env_or("RUST_LOG", "info"),
            })
        }

        /// Get or initialize the global configuration
        pub fn global() -> &'static Self {
            CONFIG.get_or_init(|| Self::load().expect("Failed to load Relay config"))
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_env_or() {
        let value = get_env_or("NONEXISTENT_VAR_12345", "default");
        assert_eq!(value, "default");
    }

    #[test]
    fn test_get_env_opt() {
        let value = get_env_opt("NONEXISTENT_VAR_12345");
        assert!(value.is_none());
    }
}
