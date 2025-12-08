//! HTTP tunnel command

use anyhow::{Context, Result};
use tracing::{error, info};

use crate::api::ApiClient;
use crate::auth;
use crate::forwarder;
use crate::relay::RelayConnection;

pub async fn run_http(port: u16, subdomain: Option<String>) -> Result<()> {
    println!("🚀 Starting Noverlink tunnel...");
    println!();

    // Load auth token
    let auth_token = auth::load_token()?;

    // Get ticket from backend
    println!("📡 Authenticating with backend...");
    let api = ApiClient::from_config();
    let ticket_response = api.get_ticket(&auth_token, subdomain.as_deref()).await?;

    println!("🔗 Connecting to relay...");

    // Connect to relay with ticket
    let mut relay =
        RelayConnection::connect(&ticket_response.relay_url, &ticket_response.ticket, port)
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

    // Gracefully close connection to relay (sends WebSocket Close frame)
    relay.close().await;

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
