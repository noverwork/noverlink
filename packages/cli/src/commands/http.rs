//! HTTP tunnel command

use anyhow::{Context, Result};
use tracing::{error, info};

use crate::forwarder;
use crate::relay::RelayConnection;

const DEFAULT_RELAY_URL: &str = "ws://localhost:8444";

pub async fn run_http(port: u16, domain: Option<String>) -> Result<()> {
    println!("🚀 Starting Noverlink tunnel...");
    println!();

    // Connect to relay
    let relay_url = std::env::var("NOVERLINK_RELAY_URL").unwrap_or_else(|_| DEFAULT_RELAY_URL.to_string());

    let mut relay = RelayConnection::connect(&relay_url, domain, port)
        .await
        .context("Failed to connect to relay server")?;

    let tunnel_url = relay.tunnel_url().to_string();

    // Display tunnel info
    println!("✅ Tunnel established!");
    println!();
    println!("   Public URL:  {}", tunnel_url);
    println!("   Forwarding:  {} → localhost:{}", tunnel_url, port);
    println!();
    println!("Press Ctrl+C to stop the tunnel");
    println!();

    // Handle requests
    let result = handle_requests(&mut relay, port).await;

    // Cleanup
    println!();
    println!("👋 Tunnel closed");

    result
}

async fn handle_requests(relay: &mut RelayConnection, local_port: u16) -> Result<()> {
    let mut request_count = 0u64;

    loop {
        tokio::select! {
            // Handle incoming requests
            Some(request) = relay.receive_request() => {
                request_count += 1;
                info!("Request #{}: {} bytes", request_count, request.payload.len());

                // Spawn background task to handle request
                // send_response() does not need &mut self, so we can call it from background task
                let relay_sender = relay.get_response_sender();
                let request_id = request.id;
                let payload = request.payload;

                tokio::spawn(async move {
                    match forwarder::forward_to_localhost(&payload, local_port).await {
                        Ok(response) => {
                            info!("Response for request #{}: {} bytes", request_id, response.len());

                            if let Err(e) = relay_sender.send_response(request_id, response).await {
                                error!("Failed to send response: {}", e);
                            }
                        }
                        Err(e) => {
                            error!("Failed to forward request: {}", e);

                            // Send 502 error response
                            let error_response = forwarder::create_502_response(&e);
                            if let Err(e) = relay_sender.send_response(request_id, error_response).await {
                                error!("Failed to send error response: {}", e);
                            }
                        }
                    }
                });
            }

            // Handle Ctrl+C
            _ = tokio::signal::ctrl_c() => {
                println!();
                info!("Shutting down...");
                break;
            }
        }
    }

    Ok(())
}
