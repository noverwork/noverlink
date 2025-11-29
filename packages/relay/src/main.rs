//! Noverlink Relay Server
//!
//! WebSocket-based tunnel relay for exposing local services to the internet.
//!
//! Simple, single-relay architecture for MVP.

mod handlers;
mod metrics;
mod registry;
mod ticket;

use std::env;
use std::sync::Arc;

use anyhow::Result;
use tokio::net::TcpListener;
use tokio::signal;
use tracing::{error, info};

use handlers::{handle_cli_connection, start_http_server};
use metrics::create_metrics;
use registry::TunnelRegistry;
use ticket::TicketVerifier;

#[tokio::main]
async fn main() -> Result<()> {
    // Load .env file if present (ignore errors if file doesn't exist)
    let _ = dotenvy::dotenv();

    // Setup logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    info!("Starting Noverlink Relay");

    // Read config from env (all required, no defaults)
    let ws_port = env::var("WS_PORT")
        .map_err(|_| anyhow::anyhow!("WS_PORT environment variable is required"))?
        .parse::<u16>()
        .map_err(|_| anyhow::anyhow!("WS_PORT must be a valid port number (1-65535)"))?;

    let http_port = env::var("HTTP_PORT")
        .map_err(|_| anyhow::anyhow!("HTTP_PORT environment variable is required"))?
        .parse::<u16>()
        .map_err(|_| anyhow::anyhow!("HTTP_PORT must be a valid port number (1-65535)"))?;

    let base_domain = env::var("BASE_DOMAIN")
        .map_err(|_| anyhow::anyhow!("BASE_DOMAIN environment variable is required"))?;

    let ticket_secret = env::var("TICKET_SECRET")
        .map_err(|_| anyhow::anyhow!("TICKET_SECRET environment variable is required"))?;

    if ticket_secret.len() < 32 {
        return Err(anyhow::anyhow!("TICKET_SECRET must be at least 32 characters"));
    }

    info!("Base domain: {}", base_domain);

    // Shared tunnel registry
    let registry = Arc::new(TunnelRegistry::new(base_domain));

    // Ticket verifier for authenticating CLI connections
    let ticket_verifier = Arc::new(TicketVerifier::new(&ticket_secret));

    // Metrics (no-op for now, can be replaced with real implementation)
    let _metrics = create_metrics();

    // Start WebSocket server for CLI connections
    let ws_addr = format!("0.0.0.0:{}", ws_port);

    // Enable SO_REUSEADDR for WebSocket listener
    let ws_socket = socket2::Socket::new(
        socket2::Domain::IPV4,
        socket2::Type::STREAM,
        Some(socket2::Protocol::TCP),
    )?;
    ws_socket.set_reuse_address(true)?;
    ws_socket.bind(&ws_addr.parse::<std::net::SocketAddr>()?.into())?;
    ws_socket.listen(1024)?;
    ws_socket.set_nonblocking(true)?;

    let ws_listener = TcpListener::from_std(ws_socket.into())?;
    info!("WebSocket listener started on {}", ws_addr);

    let registry_ws = Arc::clone(&registry);
    let verifier_ws = Arc::clone(&ticket_verifier);
    let ws_handle = tokio::spawn(async move {
        loop {
            match ws_listener.accept().await {
                Ok((stream, addr)) => {
                    info!("New CLI connection from {}", addr);
                    let registry = Arc::clone(&registry_ws);
                    let verifier = Arc::clone(&verifier_ws);

                    tokio::spawn(async move {
                        if let Err(e) = handle_cli_connection(stream, registry, verifier).await {
                            error!("CLI connection error from {}: {}", addr, e);
                        }
                    });
                }
                Err(e) => {
                    error!("Failed to accept WebSocket connection: {}", e);
                }
            }
        }
    });

    // Start HTTP server for public traffic
    let registry_http = Arc::clone(&registry);
    let http_handle = tokio::spawn(async move {
        if let Err(e) = start_http_server(http_port, registry_http).await {
            error!("HTTP server error: {}", e);
        }
    });

    // Wait for shutdown signal
    match signal::ctrl_c().await {
        Ok(()) => {
            info!("Shutdown signal received");
        }
        Err(err) => {
            error!("Failed to listen for shutdown signal: {}", err);
        }
    }

    ws_handle.abort();
    http_handle.abort();
    info!("Relay stopped");

    Ok(())
}
