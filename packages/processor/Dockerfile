FROM rust:1.83-bookworm AS builder

RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Cargo.toml ./
COPY packages/relay/Cargo.toml ./packages/relay/Cargo.toml

RUN mkdir -p packages/relay/src && \
    printf 'fn main() {}\n' > packages/relay/src/main.rs

RUN cargo build --release --package relay 2>/dev/null || true
RUN rm -rf target/release/.fingerprint/relay-* target/release/deps/relay-*

COPY packages/relay/src ./packages/relay/src

RUN cargo build --release --package relay

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 relay

COPY --from=builder /app/target/release/relay /usr/local/bin/relay
RUN chown relay:relay /usr/local/bin/relay

USER relay

EXPOSE 8080

CMD ["relay"]
