use anyhow::{Context, Result};
use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub agent_port: u16,
    pub http_port: u16,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        let agent_port_str = env::var("RELAY_AGENT_PORT")
            .context("RELAY_AGENT_PORT environment variable is required")?;
        let agent_port = agent_port_str
            .parse::<u16>()
            .context("RELAY_AGENT_PORT must be a valid port number (0-65535)")?;

        let http_port_str = env::var("RELAY_HTTP_PORT")
            .context("RELAY_HTTP_PORT environment variable is required")?;
        let http_port = http_port_str
            .parse::<u16>()
            .context("RELAY_HTTP_PORT must be a valid port number (0-65535)")?;

        Ok(Self {
            agent_port,
            http_port,
        })
    }
}
