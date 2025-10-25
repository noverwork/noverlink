//! Noverlink CLI
//!
//! Command-line tool for creating tunnels to expose local services.

mod cli;
mod commands;

use anyhow::Result;
use clap::Parser;

use cli::{Cli, Commands};
use commands::{run_http, run_kill, run_status};

fn main() -> Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Http { port, domain } => run_http(port, domain),

        Commands::Status => run_status(),

        Commands::Kill => run_kill(),
    }
}
