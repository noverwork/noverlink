use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "noverlink")]
#[command(version, about = "Fast local-to-global tunneling", long_about = None)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Start an HTTP tunnel
    Http {
        /// Local port to forward
        port: u16,

        /// Domain (e.g. myapp.noverlink.io)
        #[arg(long)]
        domain: Option<String>,
    },

    /// Show tunnel status
    Status,

    /// Kill all active tunnels
    Kill,
}
