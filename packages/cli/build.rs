//! Build script for noverlink-cli
//!
//! Injects version information at compile time.

fn main() {
    // Fallback version from Cargo.toml
    let cargo_version = std::env::var("CARGO_PKG_VERSION").unwrap_or_else(|_| "0.1.0".to_string());

    // Use NOVERLINK_VERSION env var if set, otherwise fall back to Cargo.toml version
    let version = std::env::var("NOVERLINK_VERSION")
        .map(|v| {
            // Truncate to 7 chars if it looks like a full SHA (40 hex chars)
            // SHA is always ASCII hex, so byte slicing is safe
            if v.len() == 40 && v.chars().all(|c| c.is_ascii_hexdigit()) {
                v.chars().take(7).collect::<String>()
            } else {
                v
            }
        })
        .unwrap_or(cargo_version);

    println!("cargo:rustc-env=NOVERLINK_VERSION={}", version);

    // Re-run if env var changes
    println!("cargo:rerun-if-env-changed=NOVERLINK_VERSION");
}
