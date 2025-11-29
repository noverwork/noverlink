//! Backend API client
//!
//! Handles communication with the Noverlink backend server.

use anyhow::{bail, Context, Result};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use tracing::info;

use crate::auth::api_url;

/// Response from POST /auth/device
#[derive(Debug, Deserialize)]
pub struct DeviceCodeResponse {
    pub device_code: String,
    pub user_code: String,
    pub verification_uri: String,
    pub expires_in: u32,
    pub interval: u32,
}

/// Response from POST /auth/device/poll
#[derive(Debug, Deserialize)]
#[serde(untagged)]
pub enum DevicePollResponse {
    Success { auth_token: String },
    Pending { error: String },
}

/// Response from POST /tunnels/ticket
#[derive(Debug, Deserialize)]
pub struct TicketResponse {
    pub ticket: String,
    pub relay_url: String,
    #[allow(dead_code)]
    pub expires_in: u32,
}

/// Request for POST /tunnels/ticket
#[derive(Debug, Serialize)]
struct CreateTicketRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    subdomain: Option<String>,
}

/// API client for Noverlink backend
pub struct ApiClient {
    client: Client,
    base_url: String,
}

impl ApiClient {
    /// Create a new API client
    pub fn new(base_url: &str) -> Self {
        Self {
            client: Client::new(),
            base_url: base_url.trim_end_matches('/').to_string(),
        }
    }

    /// Create API client with configured URL
    #[must_use]
    pub fn from_config() -> Self {
        Self::new(api_url())
    }

    /// Start device code flow for authentication
    pub async fn start_device_flow(&self) -> Result<DeviceCodeResponse> {
        let url = format!("{}/auth/device", self.base_url);

        let response = self
            .client
            .post(&url)
            .send()
            .await
            .context("Failed to connect to backend")?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            bail!("Device flow failed: {} - {}", status, body);
        }

        response
            .json::<DeviceCodeResponse>()
            .await
            .context("Failed to parse device code response")
    }

    /// Poll for device flow completion
    pub async fn poll_device_flow(&self, device_code: &str) -> Result<DevicePollResponse> {
        let url = format!("{}/auth/device/poll", self.base_url);

        let response = self
            .client
            .post(&url)
            .json(&serde_json::json!({ "device_code": device_code }))
            .send()
            .await
            .context("Failed to poll device flow")?;

        if response.status().is_client_error() {
            // 4xx errors indicate pending or denied
            let body: serde_json::Value = response.json().await.unwrap_or_default();
            let error = body
                .get("error")
                .and_then(|e| e.as_str())
                .unwrap_or("unknown")
                .to_string();
            return Ok(DevicePollResponse::Pending { error });
        }

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            bail!("Poll failed: {} - {}", status, body);
        }

        response
            .json::<DevicePollResponse>()
            .await
            .context("Failed to parse poll response")
    }

    /// Get connection ticket for relay
    pub async fn get_ticket(&self, auth_token: &str) -> Result<TicketResponse> {
        let url = format!("{}/tunnels/ticket", self.base_url);

        info!("Requesting connection ticket from backend");

        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", auth_token))
            .json(&CreateTicketRequest { subdomain: None })
            .send()
            .await
            .context("Failed to connect to backend")?;

        if response.status().as_u16() == 401 {
            bail!("Authentication expired. Please run 'noverlink login' again.");
        }

        if !response.status().is_success() {
            let status = response.status();
            let body = response.text().await.unwrap_or_default();
            bail!("Failed to get ticket: {} - {}", status, body);
        }

        response
            .json::<TicketResponse>()
            .await
            .context("Failed to parse ticket response")
    }
}

#[cfg(test)]
#[allow(clippy::expect_used, clippy::unwrap_used)]
mod tests {
    use super::*;

    #[test]
    fn test_api_client_creation() {
        let client = ApiClient::new("https://api.noverlink.io");
        assert_eq!(client.base_url, "https://api.noverlink.io");

        // Should strip trailing slash
        let client2 = ApiClient::new("https://api.noverlink.io/");
        assert_eq!(client2.base_url, "https://api.noverlink.io");
    }

    #[test]
    fn test_ticket_request_serialization() {
        let request = CreateTicketRequest { subdomain: None };
        let json = serde_json::to_string(&request).expect("serialization should succeed");
        assert_eq!(json, "{}");

        let request2 = CreateTicketRequest {
            subdomain: Some("myapp".to_string()),
        };
        let json2 = serde_json::to_string(&request2).expect("serialization should succeed");
        assert!(json2.contains("myapp"));
    }
}
