use clap::{Parser, Subcommand};

/// Version injected at build time (from `NOVERLINK_VERSION` env or `Cargo.toml`)
const VERSION: &str = env!("NOVERLINK_VERSION");

#[derive(Parser)]
#[command(name = "noverlink")]
#[command(version = VERSION, about = "Fast local-to-global tunneling", long_about = None)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Commands,
}

#[derive(Subcommand)]
pub enum Commands {
    /// Login to Noverlink (device code flow)
    Login,

    /// Logout from Noverlink
    Logout,

    /// Show current login status
    Whoami,

    /// Start an HTTP tunnel
    Http {
        /// Local port to forward
        port: u16,

        /// Custom subdomain (e.g., "myapp" for myapp.noverlink.io)
        #[arg(short, long)]
        subdomain: Option<String>,
    },

    /// Show tunnel status
    Status,

    /// Kill all active tunnels
    Kill,
}
