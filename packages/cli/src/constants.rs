//! Compile-time constants

/// Version injected at build time (`NOVERLINK_VERSION` env, defaults to "dev")
pub const VERSION: &str = env!("NOVERLINK_VERSION");
