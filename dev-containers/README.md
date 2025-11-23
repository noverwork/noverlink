# Development Containers

Docker services for local development. Relay runs on host via `cargo run` for faster iteration.

## Services

- **Caddy**: HTTPS reverse proxy for `*.localhost` with self-signed certificates

## Quick Start

### 1. Start Relay (Terminal 1)

```bash
cd packages/relay
cargo run
```

### 2. Start Caddy (Terminal 2)

```bash
cd dev-containers
docker compose up
```

### 3. Start CLI (Terminal 3)

```bash
cd packages/cli
cargo run -- http 3000
```

You'll get a URL like `https://funny-cat.localhost` - open in browser and accept self-signed certificate.

## Accepting Self-Signed Certificates

- **Chrome/Edge**: Click "Advanced" → "Proceed to localhost (unsafe)"
- **Firefox**: Click "Advanced" → "Accept the Risk and Continue"

## Services Overview

| Service | Port | Purpose |
|---------|------|---------|
| Caddy | 80, 443 | HTTPS proxy for `*.localhost` |

## Development Workflow

```bash
# Start all dev services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Remove volumes (reset certificates)
docker compose down -v
```

## vs. Production Deployment

| Aspect | Development | Production |
|--------|-------------|------------|
| **Relay** | Runs on host (`cargo run`) | Runs in Docker |
| **Caddy** | Self-signed certs | Cloudflare Origin CA |
| **Domain** | `*.localhost` | `*.noverlink.com` |
| **Database** | Optional, if needed | PostgreSQL container |
| **Redis** | Optional, if needed | Redis container |

See [../deploy/](../deploy/) for production deployment with Cloudflare.
