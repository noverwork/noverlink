# Node.js + Rust CI Image
# Used for running lint, typecheck, and test in Drone CI

FROM node:22-bookworm

# Install Rust
ENV RUSTUP_HOME=/usr/local/rustup \
    CARGO_HOME=/usr/local/cargo \
    PATH=/usr/local/cargo/bin:$PATH \
    RUST_VERSION=1.83.0

RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain $RUST_VERSION \
    && rustup component add clippy rustfmt \
    && chmod -R a+w $RUSTUP_HOME $CARGO_HOME

# Verify installations
RUN node --version && npm --version && rustc --version && cargo --version

WORKDIR /app
