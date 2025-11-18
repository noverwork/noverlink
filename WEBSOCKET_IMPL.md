# WebSocket Implementation Guide

## Current Status

✅ **Completed**:
- Protocol messages defined (`WebSocketUpgrade`, `WebSocketReady`)
- WebSocket upgrade detection in Relay HTTP handler
- Metrics stub interface ready

⏳ **TODO**:
- Relay: Handle WebSocket proxying after upgrade detection
- CLI: Handle `WebSocketUpgrade` message and establish tunnels
- End-to-end testing

---

## Implementation Approach

Based on current architecture, use the **simple proxying approach**:

1. When Relay detects WebSocket upgrade → send `WebSocketUpgrade` to CLI via control channel
2. CLI connects to localhost WebSocket, gets successful upgrade (101)
3. Use existing control WebSocket to forward frames (base64-encoded for now)
4. Later optimize with dedicated TCP connection

---

## Step-by-Step Implementation

### Step 1: Modify Relay to Handle WebSocket Proxying

**File**: [`packages/relay/src/handlers/http.rs`](packages/relay/src/handlers/http.rs:67:0-75:0)

Replace the `501 Not Implemented` response with actual proxying:

```rust
if is_websocket_upgrade(headers_slice) {
    info!("WebSocket upgrade request detected for {}", host);

    // Forward the upgrade request as-is to CLI
    let full_request = buf[..headers_end + 4].to_vec();
    forward_to_tunnel(&mut stream, tunnel, &registry, full_request, &host).await?;

    // After getting 101 response, switch to bidirectional byte forwarding
    // This requires modifications to forward_to_tunnel to support streaming mode

    return Ok(());
}
```

### Step 2: Extend `TunnelMessage` to Support Streaming

**File**: [`packages/relay/src/registry.rs`](packages/relay/src/registry.rs:9:0-15:0)

Change `TunnelMessage` from struct to enum:

```rust
pub enum TunnelMessage {
    /// Standard HTTP request-response
    HttpRequest {
        request_id: u64,
        request_data: Vec<u8>,
    },

    /// WebSocket upgrade initiation
    WebSocketUpgrade {
        connection_id: String,
        request_data: Vec<u8>, // Initial HTTP upgrade request
    },

    /// WebSocket frame data (after upgrade)
    WebSocketData {
        connection_id: String,
        data: Vec<u8>,
    },

    /// Close WebSocket connection
    WebSocketClose {
        connection_id: String,
    },
}
```

Update all usages in `ws.rs` and `http.rs`.

### Step 3: Update Relay WebSocket Handler

**File**: [`packages/relay/src/handlers/ws.rs`](packages/relay/src/handlers/ws.rs:96:0-150:0)

Add handling for new message types:

```rust
loop {
    tokio::select! {
        Some(tunnel_msg) = request_rx.recv() => {
            match tunnel_msg {
                TunnelMessage::HttpRequest { request_id, request_data } => {
                    // Existing HTTP handling
                    let request_msg = WebSocketMessage::Request {
                        request_id,
                        payload: base64_encode(&request_data),
                    };
                    // ... send to CLI
                }

                TunnelMessage::WebSocketUpgrade { connection_id, request_data } => {
                    // Send WebSocketUpgrade message to CLI
                    let msg = WebSocketMessage::WebSocketUpgrade { connection_id };
                    let json = serde_json::to_string(&msg)?;
                    ws_sink.send(tokio_tungstenite::tungstenite::Message::Text(json)).await?;

                    // Also send the initial upgrade request
                    // (CLI needs this to complete handshake with localhost)
                    // TODO: Include request_data in WebSocketUpgrade message
                }

                TunnelMessage::WebSocketData { connection_id, data } => {
                    // Forward frame data to CLI
                    // TODO: Define protocol for frame forwarding
                }

                TunnelMessage::WebSocketClose { connection_id } => {
                    // Notify CLI to close WebSocket
                }
            }
        }

        msg = ws_stream.next() => {
            match msg {
                Some(Ok(msg)) => {
                    let text = msg.to_string();
                    if let Ok(ws_msg) = serde_json::from_str::<WebSocketMessage>(&text) {
                        match ws_msg {
                            WebSocketMessage::Response { request_id, payload } => {
                                // Existing HTTP response handling
                            }

                            WebSocketMessage::WebSocketReady { connection_id } => {
                                // CLI is ready to proxy WebSocket
                                // Register this connection as active
                            }

                            // Handle WebSocket frame data from CLI
                            // (Need to define in protocol)

                            _ => {}
                        }
                    }
                }
                // ... error handling
            }
        }
    }
}
```

### Step 4: Implement CLI WebSocket Handling

**File**: `packages/cli/src/forwarder.rs` (likely location)

When CLI receives `WebSocketUpgrade` message:

```rust
WebSocketMessage::WebSocketUpgrade { connection_id } => {
    info!("WebSocket upgrade request for connection {}", connection_id);

    // 1. Connect to localhost WebSocket endpoint
    let local_ws_url = format!("ws://127.0.0.1:{}/", local_port);
    let (local_ws_stream, _) = connect_async(&local_ws_url).await?;

    // 2. Send initial upgrade request received from Relay
    // (This should be included in WebSocketUpgrade message)

    // 3. Wait for 101 Switching Protocols response

    // 4. Send WebSocketReady back to Relay
    let ready_msg = WebSocketMessage::WebSocketReady { connection_id: connection_id.clone() };
    relay_ws.send(serde_json::to_string(&ready_msg)?).await?;

    // 5. Start bidirectional forwarding
    let (local_sink, local_stream) = local_ws_stream.split();

    // Spawn task for localhost → Relay direction
    tokio::spawn(forward_ws_frames(local_stream, relay_ws_clone, connection_id.clone()));

    // Spawn task for Relay → localhost direction
    tokio::spawn(forward_ws_frames(relay_ws_stream, local_sink, connection_id.clone()));
}
```

### Step 5: Update Protocol Messages

**File**: [`packages/rs-shared/src/protocol.rs`](packages/rs-shared/src/protocol.rs:74:0-91:0)

Enhance `WebSocketUpgrade` to include request data:

```rust
WebSocketUpgrade {
    connection_id: String,
    /// The initial HTTP upgrade request that CLI should send to localhost
    initial_request: String, // base64-encoded
},
```

Add messages for WebSocket frame forwarding:

```rust
/// Relay ↔ CLI: WebSocket frame data
WebSocketFrame {
    connection_id: String,
    /// Frame data (base64-encoded)
    data: String,
    /// Frame direction (up = client→localhost, down = localhost→client)
    direction: String,
},

/// Either party: Close WebSocket connection
WebSocketClose {
    connection_id: String,
},
```

---

## Simplified Alternative (Recommended)

Instead of modifying the control channel protocol, use **HTTP forward-then-proxy**:

1. Forward WebSocket upgrade request like normal HTTP request
2. CLI sends upgrade request to localhost, gets 101 response
3. CLI sends 101 response back through normal response channel
4. After Relay sends 101 to browser, **switch both connections to raw TCP forwarding**
5. No more JSON framing, just raw bytes

This requires:
- Relay: After sending 101, enter "transparent mode" for that TCP stream
- CLI: After receiving 101 from localhost, enter "transparent mode"

**Implementation**:

```rust
// In Relay http.rs:
if is_websocket_upgrade(headers_slice) {
    // Send request to CLI normally
    forward_to_tunnel(&mut stream, tunnel, &registry, full_request, &host).await?;

    // After getting response (should be 101)
    // Check if response is 101 Switching Protocols
    if response_data.starts_with(b"HTTP/1.1 101") {
        // Enter transparent TCP forwarding mode
        // Need to establish direct connection to CLI somehow...
        // This is where it gets complex
    }

    return Ok(());
}
```

**Problem**: Current architecture uses one WebSocket control connection between Relay and CLI. Can't switch that to raw TCP mode.

**Solution**: CLI establishes a **new raw TCP connection** to Relay for each WebSocket tunnel.

---

## Recommended Final Architecture

**When WebSocket upgrade is detected**:

1. Relay generates `connection_id`
2. Relay sends `WebSocketUpgrade { connection_id }` to CLI via control WebSocket
3. CLI connects to `localhost:PORT` WebSocket, completes handshake
4. CLI opens a **new raw TCP connection** to Relay at special endpoint: `wss://relay:PORT/_ws_proxy/{connection_id}`
5. Relay accepts this connection, matches `connection_id`, pairs it with browser's TCP connection
6. Both directions: raw byte forwarding on these two TCP connections

This approach:
- ✅ Clean separation: control messages vs data
- ✅ High performance (no JSON overhead)
- ✅ Simple forwarding logic (just `tokio::io::copy`)
- ❌ Requires new endpoint on Relay

**Implementation**: See [DISCUSS.md](DISCUSS.md:398:0-443:0) for full architecture.

---

## Testing Plan

1. **Unit tests**: WebSocket upgrade detection (✅ done)
2. **Integration test**:
   - Start Relay and CLI
   - Open WebSocket connection from browser
   - Verify bidirectional communication
   - Check metrics recording

3. **Test cases**:
   - Simple echo WebSocket server
   - Multiple concurrent WebSocket connections
   - Large message handling
   - Connection close scenarios

---

## Files to Modify

Summary of changes needed:

| File | Changes |
|------|---------|
| [`protocol.rs`](packages/rs-shared/src/protocol.rs:1:0-198:0) | ✅ Messages defined (may need enhancement) |
| [`http.rs`](packages/relay/src/handlers/http.rs:38:0-84:0) | ✅ Detection done, ⏳ Replace 501 with actual proxying |
| [`registry.rs`](packages/relay/src/registry.rs:1:0-134:0) | ⏳ Add WebSocket connection tracking |
| [`ws.rs`](packages/relay/src/handlers/ws.rs:1:0-166:0) | ⏳ Handle WebSocket messages |
| [`cli/forwarder.rs`](packages/cli/src/forwarder.rs:1:0-1:0) | ⏳ Implement WebSocket upgrade handling |
| [`cli/relay.rs`](packages/cli/src/relay.rs:1:0-1:0) | ⏳ Add WebSocket message handling |

---

## Performance Considerations

Current simple approach (forwarding through control WebSocket with base64):
- 👎 33% overhead from base64 encoding
- 👎 JSON serialization cost per frame
- 👍 Simple to implement
- 👍 Works immediately

Optimized approach (dedicated TCP connections):
- 👍 Zero overhead (raw bytes)
- 👍 Maximum throughput
- 👎 More complex
- 👎 Needs new Relay endpoint

**Recommendation**: Start with simple approach, profile, then optimize if needed.

---

## Next Steps

1. Decide on architecture: simple (control channel) vs optimized (dedicated connections)
2. Implement chosen approach step-by-step
3. Add integration tests
4. Update DISCUSS.md with actual implementation details
5. Consider metrics integration (record WebSocket bytes transferred)

---

## Resources

- [RFC 6455: WebSocket Protocol](https://datatracker.ietf.org/doc/html/rfc6455)
- [tokio-tungstenite docs](https://docs.rs/tokio-tungstenite/)
- [Current relay WebSocket handler](packages/relay/src/handlers/ws.rs:1:0-166:0)
