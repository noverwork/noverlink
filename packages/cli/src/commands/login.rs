//! Login command - Device code flow authentication

use std::io::Write;
use std::time::Duration;

use anyhow::{bail, Result};
use tokio::time::sleep;

use crate::api::{ApiClient, DevicePollResponse};
use crate::auth;

/// Run the login command using device code flow
pub async fn run_login() -> Result<()> {
    println!("🔐 Logging in to Noverlink...");
    println!();

    let api = ApiClient::from_config();

    // Start device code flow
    let device_response = api.start_device_flow().await?;

    // Display instructions
    println!("To authenticate, visit:");
    println!();
    println!("   {}", device_response.verification_uri);
    println!();
    println!("And enter this code:");
    println!();
    println!("   {}", device_response.user_code);
    println!();
    println!("Waiting for authentication...");

    // Poll for completion
    let poll_interval = Duration::from_secs(device_response.interval.into());
    #[allow(clippy::integer_division)]
    let max_attempts = device_response.expires_in / device_response.interval;

    for attempt in 0..max_attempts {
        sleep(poll_interval).await;

        match api.poll_device_flow(&device_response.device_code).await? {
            DevicePollResponse::Success { auth_token } => {
                // Save token
                auth::save_token(&auth_token)?;

                // Fetch and save user profile
                match api.get_me(&auth_token).await {
                    Ok(me) => {
                        auth::save_profile(&me.email, me.name.as_deref(), &me.plan)?;
                        println!();
                        println!("✅ Successfully logged in as {}!", me.email);
                    }
                    Err(_) => {
                        println!();
                        println!("✅ Successfully logged in!");
                    }
                }
                println!();
                println!("You can now use 'noverlink http <port>' to create tunnels.");

                return Ok(());
            }
            DevicePollResponse::Pending { error } => {
                match error.as_str() {
                    "authorization_pending" => {
                        // Still waiting, continue polling
                        if attempt % 3 == 0 {
                            print!(".");
                            std::io::stdout().flush().ok();
                        }
                    }
                    "slow_down" => {
                        // Back off
                        sleep(poll_interval).await;
                    }
                    "access_denied" => {
                        println!();
                        bail!("Login was denied. Please try again.");
                    }
                    "expired_token" => {
                        println!();
                        bail!("Login session expired. Please try again.");
                    }
                    _ => {
                        println!();
                        bail!("Login failed: {}", error);
                    }
                }
            }
        }
    }

    println!();
    bail!("Login timed out. Please try again.");
}

/// Run the logout command
pub fn run_logout() -> Result<()> {
    if !auth::is_logged_in() {
        println!("You are not logged in.");
        return Ok(());
    }

    auth::clear_token()?;

    println!("✅ Successfully logged out.");
    Ok(())
}

/// Show current login status
pub async fn run_whoami() {
    if !auth::is_logged_in() {
        println!("❌ You are not logged in.");
        println!("   Run 'noverlink login' to authenticate.");
        return;
    }

    let mut email = auth::get_email();
    let mut plan = auth::get_plan();

    // If cache is missing, fetch from API
    if email.is_none() || plan.is_none() {
        if let Ok(token) = auth::load_token() {
            let api = ApiClient::from_config();
            if let Ok(me) = api.get_me(&token).await {
                // Update cache
                let _ = auth::save_profile(&me.email, me.name.as_deref(), &me.plan);
                email = Some(me.email);
                plan = Some(me.plan);
            }
        }
    }

    println!("✅ You are logged in.");
    println!(
        "   Email: {}",
        email.unwrap_or_else(|| "unknown".to_string())
    );
    println!(
        "   Plan:  {}",
        plan.unwrap_or_else(|| "unknown".to_string())
    );
    println!("   API:   {}", auth::api_url());
}
