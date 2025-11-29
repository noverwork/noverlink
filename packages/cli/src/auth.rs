//! Authentication and credential management
//!
//! Handles storing and loading CLI authentication tokens.

use std::fs::{self, File, OpenOptions};
use std::io::{Read, Write};
use std::path::PathBuf;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};

const CONFIG_DIR: &str = ".noverlink";
const CONFIG_FILE: &str = "config.toml";

/// CLI configuration including authentication
#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    /// Authentication token for backend API
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auth_token: Option<String>,

    /// Backend API URL
    #[serde(default = "default_api_url")]
    pub api_url: String,

    /// Relay WebSocket URL (optional, usually provided by backend)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub relay_url: Option<String>,
}

fn default_api_url() -> String {
    "http://localhost:3000".to_string()
}

impl Default for Config {
    fn default() -> Self {
        Self {
            auth_token: None,
            api_url: default_api_url(),
            relay_url: None,
        }
    }
}

impl Config {
    /// Get the config directory path
    pub fn config_dir() -> Result<PathBuf> {
        let home = dirs::home_dir().context("Could not determine home directory")?;
        Ok(home.join(CONFIG_DIR))
    }

    /// Get the config file path
    pub fn config_path() -> Result<PathBuf> {
        Ok(Self::config_dir()?.join(CONFIG_FILE))
    }

    /// Load config from file, or return default if not found
    pub fn load() -> Result<Self> {
        let path = Self::config_path()?;

        if !path.exists() {
            return Ok(Self::default());
        }

        // Check file permissions on Unix
        #[cfg(unix)]
        {
            use std::os::unix::fs::MetadataExt;
            let metadata = fs::metadata(&path)?;
            let mode = metadata.mode() & 0o777;

            // Warn if file is world-readable
            if mode & 0o077 != 0 {
                eprintln!(
                    "⚠️  Warning: Config file has insecure permissions ({:o}). Run: chmod 600 {}",
                    mode,
                    path.display()
                );
            }
        }

        let mut file = File::open(&path).context("Failed to open config file")?;
        let mut contents = String::new();
        file.read_to_string(&mut contents)?;

        let config: Self = toml::from_str(&contents).context("Failed to parse config file")?;
        Ok(config)
    }

    /// Save config to file
    pub fn save(&self) -> Result<()> {
        let dir = Self::config_dir()?;
        let path = Self::config_path()?;

        // Create directory if needed
        if !dir.exists() {
            fs::create_dir_all(&dir).context("Failed to create config directory")?;
        }

        let contents = toml::to_string_pretty(self)?;

        // Create file with restrictive permissions on Unix
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            let mut file = OpenOptions::new()
                .write(true)
                .create(true)
                .truncate(true)
                .mode(0o600)
                .open(&path)
                .context("Failed to create config file")?;

            file.write_all(contents.as_bytes())?;
        }

        #[cfg(not(unix))]
        {
            let mut file = File::create(&path).context("Failed to create config file")?;
            file.write_all(contents.as_bytes())?;
        }

        Ok(())
    }
}

/// Load authentication token from config
pub fn load_token() -> Result<String> {
    let config = Config::load()?;

    config.auth_token.ok_or_else(|| {
        anyhow::anyhow!("Not logged in. Run 'noverlink login' first.")
    })
}

/// Save authentication token to config
pub fn save_token(token: &str) -> Result<()> {
    let mut config = Config::load().unwrap_or_default();
    config.auth_token = Some(token.to_string());
    config.save()
}

/// Clear authentication token
pub fn clear_token() -> Result<()> {
    let mut config = Config::load().unwrap_or_default();
    config.auth_token = None;
    config.save()
}

/// Check if user is logged in
pub fn is_logged_in() -> bool {
    Config::load()
        .map(|c| c.auth_token.is_some())
        .unwrap_or(false)
}

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = Config::default();
        assert!(config.auth_token.is_none());
        assert_eq!(config.api_url, "http://localhost:3000");
    }

    #[test]
    fn test_config_serialization() {
        let config = Config {
            auth_token: Some("nv_test123".to_string()),
            api_url: "https://api.noverlink.io".to_string(),
            relay_url: None,
        };

        let toml_str = toml::to_string(&config).unwrap();
        assert!(toml_str.contains("auth_token"));
        assert!(toml_str.contains("api_url"));

        let parsed: Config = toml::from_str(&toml_str).unwrap();
        assert_eq!(parsed.auth_token, config.auth_token);
    }
}
