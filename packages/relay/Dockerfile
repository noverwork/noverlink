# Noverlink Relay Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build
FROM rust:1.83-bookworm AS builder

# Install dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Step 1: Copy only Cargo manifests for dependency caching
COPY Cargo.toml Cargo.lock ./
COPY packages/rs-shared/Cargo.toml ./packages/rs-shared/Cargo.toml
COPY packages/cli/Cargo.toml ./packages/cli/Cargo.toml
COPY packages/relay/Cargo.toml ./packages/relay/Cargo.toml

# Step 2: Create dummy source files to build dependencies
RUN mkdir -p packages/rs-shared/src packages/cli/src packages/relay/src && \
    echo "fn main() {}" > packages/cli/src/main.rs && \
    echo "fn main() {}" > packages/relay/src/main.rs && \
    echo "" > packages/rs-shared/src/lib.rs

# Step 3: Build dependencies only (this layer gets cached!)
RUN cargo build --release --package relay

# Step 4: Copy real source code
COPY packages/rs-shared ./packages/rs-shared
COPY packages/cli ./packages/cli
COPY packages/relay ./packages/relay

# Step 5: Touch source files to invalidate cache and rebuild only our code
RUN touch packages/rs-shared/src/lib.rs packages/relay/src/main.rs && \
    cargo build --release --package relay

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
COPY --from=builder /app/target/release/relay /usr/local/bin/relay

# Set ownership
RUN chown relay:relay /usr/local/bin/relay

# Switch to non-root user
USER relay

# Expose ports
EXPOSE 8080 8444

# Run relay
CMD ["relay"]
