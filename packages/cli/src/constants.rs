//! Compile-time constants

/// Version injected at build time (from `NOVERLINK_VERSION` env or `Cargo.toml`)
pub const VERSION: &str = env!("NOVERLINK_VERSION");
