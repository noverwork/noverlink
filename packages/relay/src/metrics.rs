//! Traffic metrics tracking
//!
//! This module provides a trait-based interface for recording traffic metrics.
//! The actual implementation (e.g., `TimescaleDB` integration) can be plugged in later.
//!
//! ## Future Implementation
//!
//! When implementing metrics storage:
//! 1. Create a concrete type implementing `MetricsRecorder`
//! 2. Add database dependencies (sqlx, tokio-postgres, etc.)
//! 3. Implement `record_bytes()` to write to `TimescaleDB`
//! 4. Replace `NoOpMetrics` with your implementation in `main.rs`

#![allow(dead_code)] // Stub for future implementation

use std::sync::Arc;

/// Trait for recording traffic metrics
///
/// Implementations should be thread-safe and non-blocking.
pub trait MetricsRecorder: Send + Sync {
    /// Record bytes transferred for a subdomain
    ///
    /// # Arguments
    /// * `subdomain` - The tunnel subdomain (e.g., "happy-cat")
    /// * `bytes` - Number of bytes transferred (sent + received)
    ///
    /// # Implementation Notes
    ///
    /// - Should be non-blocking (async or fire-and-forget)
    /// - Called frequently during active connections
    /// - Must be thread-safe (called from multiple tokio tasks)
    fn record_bytes(&self, subdomain: &str, bytes: u64);

    /// Record a new connection
    ///
    /// # Arguments
    /// * `subdomain` - The tunnel subdomain
    /// * `connection_type` - Type of connection ("http" or "websocket")
    fn record_connection(&self, subdomain: &str, connection_type: &str);
}

/// No-op implementation for metrics (placeholder)
///
/// This implementation does nothing. Replace with a real implementation
/// that writes to `TimescaleDB` or another metrics backend.
#[derive(Clone)]
pub struct NoOpMetrics;

impl MetricsRecorder for NoOpMetrics {
    fn record_bytes(&self, _subdomain: &str, _bytes: u64) {
        // TODO: Implement real metrics storage
        // Example: write to TimescaleDB, Prometheus, etc.
    }

    fn record_connection(&self, _subdomain: &str, _connection_type: &str) {
        // TODO: Implement real connection tracking
    }
}

/// Metrics handle that can be cheaply cloned and passed around
pub type Metrics = Arc<dyn MetricsRecorder>;

/// Create a new no-op metrics instance
///
/// Replace this with a real implementation when ready:
///
/// ```ignore
/// pub fn create_metrics(db_url: &str) -> Metrics {
///     Arc::new(TimescaleMetrics::new(db_url).await.unwrap())
/// }
/// ```
pub fn create_metrics() -> Metrics {
    Arc::new(NoOpMetrics)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_noop_metrics() {
        let metrics = create_metrics();
        metrics.record_bytes("test", 1024);
        metrics.record_connection("test", "http");
        // Should not panic
    }

    #[test]
    fn test_metrics_clone() {
        let metrics = create_metrics();
        let metrics2 = Arc::<dyn MetricsRecorder>::clone(&metrics);
        metrics2.record_bytes("test", 2048);
        // Arc clone should work
    }
}
