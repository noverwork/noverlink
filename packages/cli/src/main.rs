//! Noverlink CLI
//!
//! Command-line tool for creating tunnels to expose local services.

mod cli;
mod commands;
mod forwarder;
mod relay;

use anyhow::Result;
use clap::Parser;

use cli::{Cli, Commands};
use commands::{run_http, run_kill, run_status};

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    let cli = Cli::parse();

    match cli.command {
        Commands::Http { port, domain } => run_http(port, domain).await,

        Commands::Status => run_status(),

        Commands::Kill => run_kill(),
    }
}
