# Noverlink Relay Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build
FROM rust:1.83-bookworm AS builder

# Version to inject at build time (e.g., git tag or commit SHA)
ARG RELAY_VERSION
ENV RELAY_VERSION=${RELAY_VERSION}

# Install dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Step 1: Copy Cargo manifests and shared library (small, rarely changes)
COPY Cargo.toml Cargo.lock ./
COPY packages/rs-shared ./packages/rs-shared
COPY packages/cli/Cargo.toml ./packages/cli/Cargo.toml
COPY packages/relay/Cargo.toml ./packages/relay/Cargo.toml

# Step 2: Create dummy source files for cli and relay
RUN mkdir -p packages/cli/src packages/relay/src && \
    echo "fn main() {}" > packages/cli/src/main.rs && \
    echo "fn main() {}" > packages/relay/src/main.rs

# Step 3: Build dependencies only (this layer gets cached!)
RUN cargo build --release --package relay 2>/dev/null || true
# Clean up dummy builds so real source compiles fresh
RUN rm -rf target/release/.fingerprint/relay-* target/release/deps/relay-* \
    target/release/.fingerprint/noverlink_cli-* target/release/deps/noverlink_cli-*

# Step 4: Copy real source code
COPY packages/cli ./packages/cli
COPY packages/relay ./packages/relay

# Step 5: Build relay
RUN cargo build --release --package relay

# Stage 2: Runtime
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 relay

# Copy binary from builder
COPY --from=builder /app/target/release/relay /usr/local/bin/relay

# Set ownership
RUN chown relay:relay /usr/local/bin/relay

# Switch to non-root user
USER relay

# Expose ports
EXPOSE 8080 8444

# Run relay
CMD ["relay"]
