//! Noverlink CLI
//!
//! Command-line tool for creating tunnels to expose local services.

mod api;
mod auth;
mod cli;
mod commands;
mod display;
mod forwarder;
mod relay;

use anyhow::Result;
use clap::Parser;

use cli::{Cli, Commands};
use commands::{run_http, run_kill, run_login, run_logout, run_status, run_whoami};

#[tokio::main]
async fn main() -> Result<()> {
    // Install ring as the default CryptoProvider for rustls
    // If this fails, it means a provider is already installed (which is fine)
    let _ = rustls::crypto::ring::default_provider().install_default();

    // Initialize logging (default to warn to avoid interfering with TUI display)
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("warn")),
        )
        .init();

    let cli = Cli::parse();

    match cli.command {
        Commands::Login => run_login().await,

        Commands::Logout => run_logout(),

        Commands::Whoami => {
            run_whoami();
            Ok(())
        }

        Commands::Http { port, subdomain } => run_http(port, subdomain).await,

        Commands::Status => run_status(),

        Commands::Kill => run_kill(),
    }
}
