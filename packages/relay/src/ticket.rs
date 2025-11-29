//! Connection ticket verification
//!
//! Verifies HMAC-signed connection tickets issued by the backend.
//!
//! Note: Replay protection is intentionally omitted. The 60-second ticket expiry
//! combined with HMAC signature verification is sufficient. Replaying a valid
//! ticket just reconnects the same tunnel - no security impact.

use std::time::{SystemTime, UNIX_EPOCH};

use anyhow::{bail, Result};
use hmac::{Hmac, Mac};
use sha2::Sha256;

use noverlink_shared::TicketPayload;

type HmacSha256 = Hmac<Sha256>;

/// Ticket verifier using HMAC-SHA256
pub struct TicketVerifier {
    /// HMAC secret key
    secret: Vec<u8>,
}

impl TicketVerifier {
    /// Create a new ticket verifier with the given secret
    pub fn new(secret: &str) -> Self {
        Self {
            secret: secret.as_bytes().to_vec(),
        }
    }

    /// Verify a connection ticket and return the decoded payload
    ///
    /// Returns an error if:
    /// - The ticket format is invalid
    /// - The signature doesn't match
    /// - The ticket has expired
    pub fn verify(&self, ticket: &str) -> Result<TicketPayload> {
        // Decode base64url
        let decoded = base64_url_decode(ticket)?;
        let ticket_str = String::from_utf8(decoded)?;

        // Parse JSON payload
        let mut payload: TicketPayload = serde_json::from_str(&ticket_str)?;

        // Extract and remove signature for verification
        let received_sig = payload.sig.take().ok_or_else(|| {
            anyhow::anyhow!("Ticket missing signature")
        })?;

        // Check expiry
        let now = i64::try_from(
            SystemTime::now()
                .duration_since(UNIX_EPOCH)?
                .as_secs(),
        )
        .unwrap_or(i64::MAX);

        if payload.exp < now {
            bail!("Ticket expired");
        }

        // Verify HMAC signature
        let payload_without_sig = serde_json::to_string(&payload)?;
        let mut mac = HmacSha256::new_from_slice(&self.secret)
            .map_err(|_| anyhow::anyhow!("Invalid HMAC key"))?;
        mac.update(payload_without_sig.as_bytes());
        let expected_sig = hex::encode(mac.finalize().into_bytes());

        if received_sig != expected_sig {
            bail!("Invalid ticket signature");
        }

        Ok(payload)
    }
}

/// Decode base64url-encoded string
fn base64_url_decode(input: &str) -> Result<Vec<u8>> {
    use base64::Engine;
    Ok(base64::engine::general_purpose::URL_SAFE_NO_PAD.decode(input)?)
}

#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests {
    use super::*;

    const TEST_SECRET: &str = "test-secret-key-for-hmac-signing";

    fn create_test_ticket(payload: &TicketPayload, secret: &str) -> String {
        use base64::Engine;

        let payload_json = serde_json::to_string(payload).unwrap();
        let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
        mac.update(payload_json.as_bytes());
        let sig = hex::encode(mac.finalize().into_bytes());

        let mut signed_payload = payload.clone();
        signed_payload.sig = Some(sig);

        let json = serde_json::to_string(&signed_payload).unwrap();
        base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(json.as_bytes())
    }

    #[test]
    #[allow(clippy::as_conversions, clippy::cast_possible_wrap)]
    fn test_valid_ticket() {
        let verifier = TicketVerifier::new(TEST_SECRET);

        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        let payload = TicketPayload {
            user_id: "user-123".to_string(),
            plan: "free".to_string(),
            max_tunnels: 1,
            subdomain: None,
            ticket_id: "ticket-001".to_string(),
            exp: now + 60, // Expires in 60 seconds
            sig: None,
        };

        let ticket = create_test_ticket(&payload, TEST_SECRET);
        let result = verifier.verify(&ticket);

        assert!(result.is_ok());
        let verified = result.unwrap();
        assert_eq!(verified.user_id, "user-123");
        assert_eq!(verified.plan, "free");
    }

    #[test]
    #[allow(clippy::as_conversions, clippy::cast_possible_wrap)]
    fn test_expired_ticket() {
        let verifier = TicketVerifier::new(TEST_SECRET);

        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        let payload = TicketPayload {
            user_id: "user-123".to_string(),
            plan: "free".to_string(),
            max_tunnels: 1,
            subdomain: None,
            ticket_id: "ticket-002".to_string(),
            exp: now - 10, // Already expired
            sig: None,
        };

        let ticket = create_test_ticket(&payload, TEST_SECRET);
        let result = verifier.verify(&ticket);

        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("expired"));
    }

    #[test]
    #[allow(clippy::as_conversions, clippy::cast_possible_wrap)]
    fn test_invalid_signature() {
        let verifier = TicketVerifier::new(TEST_SECRET);

        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        let payload = TicketPayload {
            user_id: "user-123".to_string(),
            plan: "free".to_string(),
            max_tunnels: 1,
            subdomain: None,
            ticket_id: "ticket-003".to_string(),
            exp: now + 60,
            sig: None,
        };

        // Sign with wrong secret
        let ticket = create_test_ticket(&payload, "wrong-secret");
        let result = verifier.verify(&ticket);

        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("signature"));
    }
}
