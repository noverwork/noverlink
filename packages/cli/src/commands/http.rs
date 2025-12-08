//! HTTP tunnel command

use anyhow::{Context, Result};
use std::time::Instant;
use tracing::{debug, error};

use crate::api::ApiClient;
use crate::auth;
use crate::display::{self, Display};
use crate::forwarder;
use crate::relay::RelayConnection;

const VERSION: &str = env!("CARGO_PKG_VERSION");

pub async fn run_http(port: u16, subdomain: Option<String>) -> Result<()> {
    // Load auth token
    let auth_token = auth::load_token()?;

    // Get ticket from backend
    let api = ApiClient::from_config();
    let ticket_response = api.get_ticket(&auth_token, subdomain.as_deref()).await?;

    // Connect to relay with ticket
    let mut relay =
        RelayConnection::connect(&ticket_response.relay_url, &ticket_response.ticket, port)
            .await
            .context("Failed to connect to relay server")?;

    let tunnel_url = relay.tunnel_url().to_string();

    // Create display and show status panel
    let mut display = Display::new(tunnel_url.clone(), port);
    display.print_status_panel(VERSION, None);

    // Handle requests
    let result = handle_requests(&mut relay, port, &mut display).await;

    // Gracefully close connection to relay (sends WebSocket Close frame)
    relay.close().await;

    // Show shutdown info
    display.print_shutdown();

    result
}

async fn handle_requests(
    relay: &mut RelayConnection,
    local_port: u16,
    display: &mut Display,
) -> Result<()> {
    // Channel to receive display updates from spawned tasks
    let (display_tx, mut display_rx) = tokio::sync::mpsc::unbounded_channel::<DisplayEvent>();

    loop {
        tokio::select! {
            // Handle incoming requests
            Some(request) = relay.receive_request() => {
                debug!("Request received: {} bytes", request.payload.len());

                // Parse request info for display
                let request_info = display::parse_request_info(&request.payload);

                // Spawn background task to handle request
                let relay_sender = relay.get_response_sender();
                let request_id = request.id;
                let payload = request.payload;
                let display_tx = display_tx.clone();
                let req_info_clone = request_info.clone();

                tokio::spawn(async move {
                    let start = Instant::now();

                    match forwarder::forward_to_localhost(&payload, local_port).await {
                        Ok(response) => {
                            let duration = start.elapsed();
                            let response_info = display::parse_response_info(&response);

                            // Send display event
                            let _ = display_tx.send(DisplayEvent::Success {
                                request_info: req_info_clone,
                                response_info,
                                duration,
                            });

                            if let Err(e) = relay_sender.send_response(request_id, response).await {
                                error!("Failed to send response: {}", e);
                            }
                        }
                        Err(e) => {
                            let duration = start.elapsed();
                            let error_msg = e.to_string();

                            // Send display event
                            let _ = display_tx.send(DisplayEvent::Error {
                                request_info: req_info_clone,
                                error: error_msg.clone(),
                                duration,
                            });

                            error!("Failed to forward request: {}", e);

                            // Send 502 error response with custom HTML page
                            let error_response = forwarder::create_502_response(&e, local_port);
                            if let Err(e) = relay_sender.send_response(request_id, error_response).await {
                                error!("Failed to send error response: {}", e);
                            }
                        }
                    }
                });
            }

            // Handle display events from background tasks
            Some(event) = display_rx.recv() => {
                match event {
                    DisplayEvent::Success { request_info, response_info, duration } => {
                        display.log_request(&request_info, response_info.as_ref(), duration);
                    }
                    DisplayEvent::Error { request_info, error, duration } => {
                        display.log_error(&request_info, &error, duration);
                    }
                }
            }

            // Handle Ctrl+C
            _ = tokio::signal::ctrl_c() => {
                break;
            }
        }
    }

    Ok(())
}

/// Events for display updates from background tasks
enum DisplayEvent {
    Success {
        request_info: display::HttpRequestInfo,
        response_info: Option<display::HttpResponseInfo>,
        duration: std::time::Duration,
    },
    Error {
        request_info: display::HttpRequestInfo,
        error: String,
        duration: std::time::Duration,
    },
}
