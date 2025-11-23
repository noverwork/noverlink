# Noverlink Deployment Guide

This directory contains deployment configurations for Noverlink relay server with HTTPS support via Caddy.

## Table of Contents

- [Quick Start (Development)](#quick-start-development)
- [Production Deployment](#production-deployment)
  - [Option A: Cloudflare (Recommended)](#option-a-cloudflare-recommended)
  - [Option B: Direct Let's Encrypt](#option-b-direct-lets-encrypt)
- [Architecture](#architecture)
- [DNS Configuration](#dns-configuration)
- [Troubleshooting](#troubleshooting)

---

## Quick Start (Development)

For local development with HTTPS support, see [../dev-containers/](../dev-containers/).

**Quick summary**:
```bash
# Terminal 1: Start relay
cd packages/relay && cargo run

# Terminal 2: Start Caddy
cd dev-containers && docker compose up

# Terminal 3: Start CLI
cd packages/cli && cargo run -- http 3000
```

Visit the tunnel URL (e.g., `https://funny-cat.localhost`) and accept self-signed certificate.

---

## Production Deployment

**Choose your deployment method:**

### Option A: Cloudflare (Recommended)

✅ **Best for**: Unlimited tunnels, free SSL, global CDN, DDoS protection

**Advantages**:
- Unlimited subdomain HTTPS (bypasses Let's Encrypt 50/week limit)
- Free Cloudflare Origin CA certificate (15 year validity)
- Automatic DDoS protection
- Global CDN acceleration
- Zero cost

**When to use**: If you expect >50 new tunnels per week or want DDoS protection.

📖 **[Complete Cloudflare Setup Guide](CLOUDFLARE.md)**

**Quick summary**:
1. Add domain to Cloudflare (free plan)
2. Update nameservers
3. Generate Origin CA certificate
4. Configure DNS: `*.noverlink.com` [Proxied], `ws.noverlink.com` [DNS only]
5. Deploy with `docker-compose.yml`

---

### Option B: Direct Let's Encrypt

✅ **Best for**: Direct control, low latency, <50 tunnels/week

**Advantages**:
- No third-party proxy
- Lowest latency (direct connection)
- Full control over traffic

**Limitations**:
- Let's Encrypt rate limit: 50 certificates per week
- No built-in DDoS protection
- No CDN acceleration

**Setup**:

#### Prerequisites

1. **Domain name**: You need a domain (e.g., `noverlink.com`)
2. **DNS configuration**: Set up DNS records pointing directly to your server
3. **Server**: VPS with Docker installed (Ubuntu/Debian recommended)
4. **Ports**: Open ports 80 and 443 in firewall

#### Step 1: Configure DNS

Point your domain directly to your server (no Cloudflare):

```
*.noverlink.com    A    YOUR_SERVER_IP
ws.noverlink.com   A    YOUR_SERVER_IP
```

#### Step 2: Modify Caddyfile

Edit [caddy/Caddyfile](caddy/Caddyfile) to use Let's Encrypt instead of Origin CA:

```caddyfile
*.{$BASE_DOMAIN} {
    # Remove the tls directive to use Let's Encrypt
    reverse_proxy relay:8080
}
```

**Note**: Wildcard Let's Encrypt certificates require DNS-01 challenge, which Caddy doesn't support by default. You'll need to either:
- Use DNS API integration (complex)
- Accept the 50 certs/week limit with individual subdomain certificates
- Use Cloudflare (recommended)

#### Step 3: Configure environment

```bash
cd deploy
cp .env.example .env
nano .env  # Edit with your values
```

Required values:
- `BASE_DOMAIN`: Your domain (e.g., `noverlink.com`)
- `POSTGRES_PASSWORD`: Strong password for database

#### Step 4: Deploy

```bash
docker compose -f docker-compose.yml up -d
```

#### Step 5: Verify

```bash
# Check all services are running
docker compose -f docker-compose.yml ps

# Check Caddy logs
docker logs noverlink-caddy

# Check relay logs
docker logs noverlink-relay
```

#### Step 6: Test tunnel

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
docker compose -f docker-compose.yml down
docker compose -f docker-compose.yml build --no-cache
docker compose -f docker-compose.yml up -d
```

### View logs

```bash
docker compose -f docker-compose.yml logs -f
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
   # In docker-compose.yml
   relay:
     deploy:
       resources:
         limits:
           cpus: '2'
           memory: 2G
   ```

2. **Redis persistence**:
   ```yaml
   # In docker-compose.yml
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
