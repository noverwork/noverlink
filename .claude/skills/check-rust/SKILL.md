---
name: check-rust
description: Check Rust code for project convention violations. Use when writing or reviewing Rust code in relay or CLI packages. Validates error handling, async patterns, logging, and project-specific conventions.
---

# Rust Convention Checker

Validates Rust code against project standards for relay and CLI packages.

---

## 1. Error Handling

```rust
// CORRECT - Use anyhow for application errors
use anyhow::{Context, Result};

async fn connect() -> Result<()> {
    let stream = TcpStream::connect(addr)
        .await
        .context("Failed to connect to relay")?;
    Ok(())
}

// CORRECT - Use thiserror for library errors
#[derive(Debug, thiserror::Error)]
pub enum TicketError {
    #[error("Invalid signature")]
    InvalidSignature,
    #[error("Ticket expired")]
    Expired,
}

// WRONG - Using unwrap in production code
let value = some_option.unwrap();  // Will panic!
let result = fallible_op().unwrap();

// CORRECT - Handle errors properly
let value = some_option.ok_or_else(|| anyhow::anyhow!("Value not found"))?;
let result = fallible_op().context("Operation failed")?;
```

**Rules:**
- Use `anyhow::Result` for application code
- Use `thiserror` for custom error types
- Never use `.unwrap()` or `.expect()` in production paths
- Use `.context()` to add meaningful error messages

---

## 2. Async Patterns

```rust
// CORRECT - Use tokio::spawn for concurrent tasks
let handle = tokio::spawn(async move {
    process_request(request).await
});

// CORRECT - Use tokio::select! for multiple futures
tokio::select! {
    msg = ws_stream.next() => { /* handle message */ }
    _ = heartbeat_interval.tick() => { /* send heartbeat */ }
    _ = tokio::signal::ctrl_c() => { break; }
}

// WRONG - Blocking in async context
std::thread::sleep(Duration::from_secs(1));  // Blocks the runtime!

// CORRECT - Use tokio's async sleep
tokio::time::sleep(Duration::from_secs(1)).await;
```

---

## 3. Logging with Tracing

```rust
// CORRECT - Use tracing macros with structured fields
use tracing::{info, warn, error, debug};

info!(user_id = %user.id, plan = %plan, "User authenticated");
warn!(domain = %domain, "Domain already in use");
error!(error = ?e, session_id = %id, "Connection failed");
debug!(bytes = payload.len(), "Request received");

// WRONG - String interpolation in log messages
info!("User {} authenticated with plan {}", user.id, plan);

// CORRECT - Structured logging
info!(user_id = %user.id, plan = %plan, "User authenticated");
```

**Prefixes:**
- `%` - Display trait
- `?` - Debug trait

---

## 4. Resource Cleanup

```rust
// CORRECT - Always cleanup on exit
loop {
    tokio::select! {
        // ... handle messages
        _ = tokio::signal::ctrl_c() => {
            break;
        }
    }
}

// Cleanup after loop
relay.close().await;
registry.remove(&domain);
session_client.close_session(&session_id, bytes_in, bytes_out).await;
info!("Connection closed cleanly");
```

---

## 5. Configuration Loading

```rust
// CORRECT - Use noverlink_shared for config
use noverlink_shared::RelayConfig;

let config = RelayConfig::load()
    .map_err(|e| anyhow::anyhow!("{}", e))?;

// WRONG - Direct env access
let port = std::env::var("PORT").unwrap();

// CORRECT - Config struct with validation
let port = config.ws_port;
```

---

## 6. Shared Types

```rust
// CORRECT - Use shared protocol types
use noverlink_shared::WebSocketMessage;

let msg = WebSocketMessage::TunnelCreated {
    url: tunnel_url.clone(),
    subdomain: subdomain.clone(),
};

// All WebSocket messages should use noverlink_shared::WebSocketMessage enum
```

---

## 7. Arc and Cloning

```rust
// CORRECT - Clone Arc before moving into spawn
let registry = Arc::clone(&registry);
let session_client = Arc::clone(&session_client);

tokio::spawn(async move {
    // Use cloned Arcs
    registry.remove(&domain);
});

// WRONG - Moving original Arc
tokio::spawn(async move {
    registry.remove(&domain);  // Moved registry, can't use it later!
});
```

---

## 8. Channel Patterns

```rust
// CORRECT - Use mpsc for request/response patterns
let (tx, mut rx) = mpsc::unbounded_channel::<TunnelMessage>();

// Send requests
tx.send(TunnelMessage::Request { id, payload })?;

// Receive in select loop
tokio::select! {
    Some(msg) = rx.recv() => {
        handle_message(msg).await;
    }
}
```

---

## 9. Clippy Lints

```rust
// Project uses strict clippy - these will fail CI:
#![deny(clippy::unwrap_used)]
#![deny(clippy::expect_used)]
#![deny(clippy::panic)]

// Allow in tests only
#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests { }
```

---

## 10. Module Organization

```
packages/relay/src/
├── main.rs           # Entry point, server setup
├── handlers/
│   ├── mod.rs        # Re-exports
│   ├── ws.rs         # WebSocket handler
│   └── http.rs       # HTTP proxy handler
├── registry.rs       # Tunnel registry
├── session_client.rs # Backend API client
└── ticket.rs         # Ticket verification

packages/cli/src/
├── main.rs           # Entry point
├── cli.rs            # Clap CLI definition
├── commands/
│   ├── mod.rs        # Re-exports
│   ├── http.rs       # HTTP tunnel command
│   └── login.rs      # Login command
├── api.rs            # Backend API client
├── auth.rs           # Token storage
├── relay.rs          # Relay connection
├── display.rs        # Terminal UI
└── forwarder.rs      # Local forwarding
```

---

## Check Process

1. Find `.unwrap()` or `.expect()` in non-test code
2. Check for `std::thread::sleep` in async code
3. Verify structured logging (not string interpolation)
4. Check cleanup on connection close
5. Verify Arc cloning before spawn
6. Check for direct env access (use config)

---

## Output Format

```text
【Rust Check】 Pass / Violations Found

Violations:
- [file:line] Using .unwrap() in production code
- [file:line] Blocking sleep in async context
- [file:line] String interpolation in log message

Suggested Fixes:
- Use .context()? instead of .unwrap()
- Use tokio::time::sleep instead of std::thread::sleep
- Use structured logging: info!(field = %value, "message")
```

---

## Commands

```bash
# Check
cargo check -p relay
cargo check -p noverlink-cli

# Lint (strict - matches CI)
cargo clippy -p relay -- -D warnings
cargo clippy -p noverlink-cli -- -D warnings

# Test
cargo test -p relay
cargo test -p noverlink-cli

# Run relay
cd packages/relay && cargo run

# Run CLI
cd packages/cli && cargo run -- http 3000
```
