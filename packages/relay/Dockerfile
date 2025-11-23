# Noverlink Relay Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build
FROM rust:1.83-bookworm AS builder

# Install dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy workspace files
COPY Cargo.toml Cargo.lock ./

# Copy shared library
COPY packages/rs-shared ./packages/rs-shared

# Copy relay source
COPY packages/relay ./packages/relay

# Build relay in release mode
WORKDIR /app/packages/relay
RUN cargo build --release

# Stage 2: Runtime
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 relay

# Copy binary from builder
COPY --from=builder /app/packages/relay/target/release/relay /usr/local/bin/relay

# Set ownership
RUN chown relay:relay /usr/local/bin/relay

# Switch to non-root user
USER relay

# Expose ports
EXPOSE 8080 8444

# Run relay
CMD ["relay"]
