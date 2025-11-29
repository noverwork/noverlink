//! Noverlink Relay Server
//!
//! WebSocket-based tunnel relay for exposing local services to the internet.
//!
//! Simple, single-relay architecture for MVP.

mod handlers;
mod metrics;
mod registry;
mod ticket;

use std::sync::Arc;

use anyhow::Result;
use noverlink_shared::RelayConfig;
use tokio::net::TcpListener;
use tokio::signal;
use tracing::{error, info};

use handlers::{handle_cli_connection, start_http_server};
use metrics::create_metrics;
use registry::TunnelRegistry;
use ticket::TicketVerifier;

#[tokio::main]
async fn main() -> Result<()> {
    // Load configuration from .env
    let config = RelayConfig::load().map_err(|e| anyhow::anyhow!("{}", e))?;

    // Setup logging
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new(&config.log_level)),
        )
        .init();

    info!("Starting Noverlink Relay");
    info!("Base domain: {}", config.base_domain);

    // Shared tunnel registry
    let registry = Arc::new(TunnelRegistry::new(config.base_domain.clone()));

    // Ticket verifier for authenticating CLI connections
    let ticket_verifier = Arc::new(TicketVerifier::new(&config.ticket_secret));

    // Metrics (no-op for now, can be replaced with real implementation)
    let _metrics = create_metrics();

    // Start WebSocket server for CLI connections
    let ws_addr = format!("0.0.0.0:{}", config.ws_port);

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
    let http_port = config.http_port;
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
