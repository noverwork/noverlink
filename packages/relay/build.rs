//! Build script for relay
//!
//! Injects version information at compile time.
//! Uses `RELAY_VERSION` env var if set, otherwise defaults to "dev".

fn main() {
    let version = std::env::var("RELAY_VERSION").map_or_else(
        |_| "dev".to_string(),
        |v| {
            // Truncate to 7 chars if it looks like a full SHA (40 hex chars)
            if v.len() == 40 && v.chars().all(|c| c.is_ascii_hexdigit()) {
                v.chars().take(7).collect()
            } else {
                v
            }
        },
    );

    println!("cargo:rustc-env=RELAY_VERSION={version}");
    println!("cargo:rerun-if-env-changed=RELAY_VERSION");
}
