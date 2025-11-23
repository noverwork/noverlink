# Noverlink Deployment Guide

This directory contains deployment configurations for Noverlink relay server with HTTPS support via Caddy.

## Table of Contents

- [Quick Start (Development)](#quick-start-development)
- [Production Deployment](#production-deployment)
- [Architecture](#architecture)
- [DNS Configuration](#dns-configuration)
- [Troubleshooting](#troubleshooting)

---

## Quick Start (Development)

For local development with HTTPS support:

### 1. Start the relay server

```bash
cd packages/relay
WS_PORT=8444 HTTP_PORT=8080 BASE_DOMAIN=localhost cargo run
```

### 2. Start Caddy (in a new terminal)

```bash
cd deploy
docker compose -f docker-compose.dev.yml up
```

### 3. Test the setup

```bash
# Start a tunnel (you'll need to build the CLI first)
cd packages/cli
cargo run -- http 3000

# You'll get a URL like: https://funny-cat-123.localhost
```

### 4. Accept self-signed certificate

When you visit `https://*.localhost` in your browser, you'll need to accept the self-signed certificate:
- Chrome/Edge: Click "Advanced" → "Proceed to localhost (unsafe)"
- Firefox: Click "Advanced" → "Accept the Risk and Continue"

---

## Production Deployment

### Prerequisites

1. **Domain name**: You need a domain (e.g., `noverlink.com`)
2. **DNS configuration**: Set up wildcard DNS records (see [DNS Configuration](#dns-configuration))
3. **Server**: VPS with Docker installed (Ubuntu/Debian recommended)
4. **Ports**: Open ports 80 and 443 in firewall

### Step 1: Configure environment

```bash
cd deploy
cp .env.example .env
nano .env  # Edit with your values
```

Required values:
- `BASE_DOMAIN`: Your domain (e.g., `noverlink.com`)
- `ACME_EMAIL`: Email for Let's Encrypt notifications
- `POSTGRES_PASSWORD`: Strong password for database
- `REDIS_PASSWORD`: Strong password for Redis

### Step 2: Deploy

```bash
docker compose -f docker-compose.prod.yml up -d
```

This will:
- Build the relay server from source
- Start Caddy with automatic HTTPS
- Start PostgreSQL and Redis
- Request Let's Encrypt certificates automatically

### Step 3: Verify

```bash
# Check all services are running
docker compose -f docker-compose.prod.yml ps

# Check Caddy logs (certificate acquisition)
docker logs noverlink-caddy

# Check relay logs
docker logs noverlink-relay
```

### Step 4: Test tunnel

```bash
# On your local machine, connect CLI to production relay
NOVERLINK_RELAY_URL=wss://ws.noverlink.com noverlink-cli http 3000

# You'll get a URL like: https://funny-cat-123.noverlink.com
```

---

## Architecture

```
Internet
   │
   ├─► Port 80/443 ─► Caddy (HTTPS termination)
   │                    │
   │                    ├─► *.noverlink.com ─► relay:8080 (HTTP handler)
   │                    │                         │
   │                    │                         └─► Tunnels to CLI clients
   │                    │
   │                    └─► ws.noverlink.com ─► relay:8444 (WebSocket handler)
   │                                               │
   │                                               └─► CLI connections
   │
   └─► relay ←→ PostgreSQL (user data)
         └────► Redis (session cache)
```

### Port Mapping

| Service | Internal Port | External Port | Purpose |
|---------|--------------|---------------|---------|
| Caddy | 80 | 80 | HTTP (redirects to HTTPS) |
| Caddy | 443 | 443 | HTTPS (public access) |
| Relay HTTP | 8080 | - | HTTP traffic forwarding |
| Relay WS | 8444 | - | CLI WebSocket connections |
| PostgreSQL | 5432 | - | Database (internal only) |
| Redis | 6379 | - | Cache (internal only) |

---

## DNS Configuration

You need to configure DNS records for your domain:

### Required Records

```
# Wildcard A record for all tunnel subdomains
*.noverlink.com    A    1.2.3.4

# A record for WebSocket endpoint
ws.noverlink.com   A    1.2.3.4
```

Replace `1.2.3.4` with your server's IP address.

### Verification

```bash
# Test wildcard resolution
dig random-subdomain.noverlink.com

# Test WebSocket endpoint
dig ws.noverlink.com
```

Both should return your server IP.

---

## Troubleshooting

### Let's Encrypt certificate fails

**Problem**: Caddy can't get HTTPS certificates

**Solutions**:
1. Verify DNS records are correct: `dig ws.noverlink.com`
2. Ensure ports 80/443 are open: `sudo ufw status`
3. Check Caddy logs: `docker logs noverlink-caddy`
4. Verify email in `.env` is valid

**Common error**: `challenge failed: DNS problem`
- Your DNS records aren't propagated yet (wait 5-60 minutes)
- Your domain doesn't point to this server

### Relay connection refused

**Problem**: CLI can't connect to relay

**Solutions**:
1. Check relay is running: `docker ps`
2. Check relay logs: `docker logs noverlink-relay`
3. Verify WebSocket endpoint: `curl https://ws.noverlink.com`
4. Check firewall: `sudo ufw status`

### Development mode: "connection refused" to localhost

**Problem**: Caddy in Docker can't reach relay on host

**Solutions**:
1. Verify relay is running: `ps aux | grep relay`
2. Check relay is listening: `netstat -tlnp | grep 8080`
3. Try alternative: `docker compose -f docker-compose.dev.yml down && docker compose -f docker-compose.dev.yml up`

### Tunnel shows 502 Bad Gateway

**Problem**: Public URL returns 502 error

**Possible causes**:
1. CLI disconnected → Restart CLI
2. Relay can't reach CLI → Check CLI logs
3. Local service not running → Start your app on port 3000

---

## Updating Deployment

### Pull latest code

```bash
git pull
```

### Rebuild and restart

```bash
cd deploy
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### View logs

```bash
docker compose -f docker-compose.prod.yml logs -f
```

---

## Security Notes

1. **Change default passwords**: Edit `.env` before deploying
2. **Firewall**: Only expose ports 80, 443, and SSH
3. **Updates**: Keep Docker images updated
4. **Backups**: Backup PostgreSQL data regularly

---

## Performance Tuning

For high-traffic deployments:

1. **Increase relay resources**:
   ```yaml
   # In docker-compose.prod.yml
   relay:
     deploy:
       resources:
         limits:
           cpus: '2'
           memory: 2G
   ```

2. **Redis persistence**:
   ```yaml
   # In docker-compose.prod.yml
   redis:
     command: redis-server --appendonly yes --save 60 1000
   ```

3. **PostgreSQL tuning**: Mount custom `postgresql.conf`

---

## Development vs Production

| Feature | Development | Production |
|---------|-------------|-----------|
| Relay | `cargo run` on host | Docker container |
| Caddy | Docker container | Docker container |
| TLS | Self-signed | Let's Encrypt |
| Domain | `*.localhost` | `*.noverlink.com` |
| Database | dev-containers | Production container |
| Redis | dev-containers | Production container |

---

## Further Reading

- [Caddy Documentation](https://caddyserver.com/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
