# Cloudflare Deployment Guide

**Recommended**: Free unlimited subdomain HTTPS without Let's Encrypt rate limits

Using Cloudflare Free plan provides:
- ✅ Unlimited subdomain HTTPS (bypass Let's Encrypt's 50/week limit)
- ✅ Automatic DDoS protection
- ✅ Global CDN acceleration
- ✅ Completely free

---

## Architecture

```
HTTP Traffic (*.noverlink.com):
  User → Cloudflare [Proxied] → Caddy (Origin CA) → Relay

WebSocket Connections (ws.noverlink.com):
  CLI → Caddy (Let's Encrypt) [DNS only] → Relay
```

**Why this hybrid approach?**
- HTTP traffic benefits from Cloudflare's unlimited wildcard SSL
- WebSocket bypasses Cloudflare's 100-second timeout limit for free plans
- Best of both worlds: unlimited HTTP + persistent WebSocket

---

## Prerequisites

1. **Domain name**: You need a registered domain (e.g., `noverlink.com`)
2. **Cloudflare account**: Free plan is sufficient
3. **Server**: VPS with Docker installed and ports 80/443 open
4. **DNS access**: Ability to change your domain's nameservers

---

## Step 1: Add Domain to Cloudflare

### 1.1 Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Register a free account
3. Verify your email

### 1.2 Add Your Domain

1. Click **Add a Site**
2. Enter your domain: `noverlink.com`
3. Select **Free** plan
4. Click **Continue**

### 1.3 Update Nameservers

Cloudflare will display two nameservers, for example:
```
chloe.ns.cloudflare.com
kirk.ns.cloudflare.com
```

1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Find **Nameservers** or **DNS** settings
3. Replace existing nameservers with Cloudflare's
4. Save changes

**Wait for DNS propagation** (5 minutes - 48 hours, usually within 10 minutes)

Verify:
```bash
dig NS noverlink.com
# Should show Cloudflare nameservers
```

---

## Step 2: Configure DNS Records

In Cloudflare DNS page, add the following records:

| Type | Name | Content | Proxy Status | Purpose |
|------|------|---------|--------------|---------|
| A | `*.noverlink.com` | Your server IP | ☁️ **Proxied** | Wildcard for all tunnels |
| A | `ws.noverlink.com` | Your server IP | ⚪ **DNS only** | WebSocket endpoint (direct) |
| A | `noverlink.com` | Your server IP | ☁️ Proxied (optional) | Homepage/dashboard |

**Critical**:
- `*.noverlink.com` must be **Proxied** (orange cloud) → Enables unlimited subdomain SSL
- `ws.noverlink.com` must be **DNS only** (gray cloud) → Avoids 100-second WebSocket timeout

### Verify DNS

```bash
# Test wildcard resolution
dig random-subdomain.noverlink.com
# Should return Cloudflare IP (not your server IP)

# Test WebSocket endpoint
dig ws.noverlink.com
# Should return your actual server IP
```

---

## Step 3: Generate Cloudflare Origin CA Certificate

Origin CA certificates are required for Cloudflare → Caddy HTTPS connection.

### 3.1 Create Certificate

1. In Cloudflare Dashboard, select your domain
2. Navigate to **SSL/TLS** → **Origin Server**
3. Click **Create Certificate**
4. Configure:
   - **Private key type**: RSA (2048)
   - **Hostnames**:
     ```
     *.noverlink.com
     noverlink.com
     ```
   - **Certificate Validity**: 15 years (maximum)
5. Click **Create**

### 3.2 Download and Install

1. **Download files**:
   - **Origin Certificate** → Save as `origin.pem`
   - **Private Key** → Save as `origin.key`

2. **Upload to server**:
   ```bash
   # From your local machine
   scp origin.pem origin.key user@your-server:/path/to/noverlink/deploy/caddy/certs/
   ```

3. **Set permissions** (on server):
   ```bash
   cd /path/to/noverlink/deploy/caddy/certs
   chmod 600 origin.key  # Private key: owner only
   chmod 644 origin.pem  # Certificate: readable
   ```

4. **Verify files exist**:
   ```bash
   ls -la /path/to/noverlink/deploy/caddy/certs/
   # Should show:
   # -rw-r--r-- origin.pem
   # -rw------- origin.key
   ```

---

## Step 4: Configure SSL/TLS Settings

### 4.1 Set Encryption Mode

1. In Cloudflare Dashboard, go to **SSL/TLS** → **Overview**
2. Select **Full (strict)**

**Mode explanation**:
- **Off**: No encryption (❌ Don't use)
- **Flexible**: Cloudflare ↔ User encrypted, Cloudflare ↔ Origin unencrypted (❌ Insecure)
- **Full**: End-to-end encryption, self-signed certs accepted (⚠️ OK but not ideal)
- **Full (strict)**: End-to-end encryption, valid certs required (✅ **Recommended**)

### 4.2 Optional: Enable Additional Security

1. **Always Use HTTPS**: **SSL/TLS** → **Edge Certificates** → Enable **Always Use HTTPS**
2. **Minimum TLS Version**: Set to **TLS 1.2** or higher
3. **Automatic HTTPS Rewrites**: Enable (rewrites HTTP links to HTTPS)

---

## Step 5: Deploy Noverlink

### 5.1 Verify Configuration Files

Check that these files are configured:
- ✅ [deploy/caddy/Caddyfile](caddy/Caddyfile) - Uses Origin CA
- ✅ [deploy/docker-compose.yml](docker-compose.yml) - Mounts certs directory
- ✅ [deploy/caddy/certs/origin.pem](caddy/certs/origin.pem) - Certificate (you created)
- ✅ [deploy/caddy/certs/origin.key](caddy/certs/origin.key) - Private key (you created)

### 5.2 Configure Environment

```bash
cd deploy
cp .env.example .env
nano .env
```

Set:
```env
BASE_DOMAIN=noverlink.com
POSTGRES_USER=noverlink
POSTGRES_PASSWORD=<strong-password>
RUST_LOG=info
```

**Note**: `ACME_EMAIL` is not needed (using Origin CA, not Let's Encrypt for wildcard)

### 5.3 Deploy

```bash
cd deploy
docker compose up -d
```

### 5.4 Verify Services

```bash
# Check all services are running
docker compose ps

# Check Caddy logs (should load Origin CA cert successfully)
docker logs noverlink-caddy

# Check relay logs
docker logs noverlink-relay
```

---

## Step 6: Test the Setup

### 6.1 Test HTTPS (Wildcard)

```bash
# Test a random subdomain (should return 404 or tunnel response)
curl -I https://test-subdomain.noverlink.com

# Should show:
# HTTP/2 200 (or 404)
# server: Cloudflare
```

### 6.2 Test WebSocket Endpoint

```bash
# Test WebSocket endpoint health
curl -I https://ws.noverlink.com/health

# Should show Let's Encrypt certificate (not Cloudflare)
```

### 6.3 Test Full Tunnel Flow

```bash
# On your local machine, start a local server
python3 -m http.server 3000

# Connect CLI to production relay
noverlink-cli http 3000

# You'll get a URL like: https://funny-cat.noverlink.com
# Open in browser - should show your local server content
```

---

## Troubleshooting

### 1. "Certificate not found" Error

**Error**:
```
Error: failed to load certificate: no such file or directory: /etc/caddy/certs/origin.pem
```

**Solution**:
```bash
# Verify files exist on host
ls -la /path/to/noverlink/deploy/caddy/certs/
# Should show origin.pem and origin.key

# Restart Caddy
docker compose restart caddy
```

### 2. 502 Bad Gateway (Cloudflare)

**Cause**: Cloudflare cannot connect to your origin server

**Solutions**:
1. Verify server firewall allows ports 80/443:
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

2. Check Caddy is running:
   ```bash
   docker ps | grep caddy
   ```

3. Verify DNS points to correct IP:
   ```bash
   dig +short @1.1.1.1 ws.noverlink.com
   # Should return your server IP
   ```

### 3. SSL Handshake Failed

**Cause**: SSL/TLS mode mismatch or certificate issue

**Solutions**:
1. Verify Cloudflare SSL/TLS mode is **Full (strict)**
2. Check Caddy logs for certificate errors:
   ```bash
   docker logs noverlink-caddy | grep -i error
   ```
3. Verify origin.pem includes full certificate chain
4. Regenerate Origin CA certificate if needed

### 4. WebSocket 100-Second Timeout

**Cause**: `ws.noverlink.com` has Cloudflare proxy enabled

**Solution**:
1. Go to Cloudflare DNS page
2. Find `ws.noverlink.com` record
3. Click the orange cloud → Change to gray cloud (DNS only)
4. Wait 1-2 minutes for DNS propagation

### 5. Let's Encrypt Fails for ws.noverlink.com

**Error**:
```
failed to obtain certificate: acme: error presenting token
```

**Solution**:
Ensure `ws.noverlink.com` proxy is **OFF** (DNS only):
- Cloudflare proxy blocks Let's Encrypt HTTP-01 challenge
- DNS-only mode allows Caddy to complete ACME challenge

---

## Performance Considerations

### Latency Impact

Cloudflare adds one hop to HTTP traffic:

```
Without Cloudflare:
  User → Your Server (1 hop)

With Cloudflare:
  User → Cloudflare → Your Server (2 hops)
```

**Typical latency**: +20-80ms depending on Cloudflare edge location

**Impact by application type**:
| Application | Latency Impact | Acceptable? |
|-------------|----------------|-------------|
| Web browsing | +50ms | ✅ Imperceptible |
| API requests | +50ms | ✅ Acceptable |
| Real-time chat | +50ms | ⚠️ Noticeable |
| Online gaming | +50ms | ❌ May affect gameplay |
| Video streaming | +50ms | ✅ Only affects initial load |

**Why still use Cloudflare?**
- Global CDN often makes distant users **faster** (smart routing)
- DDoS protection
- Free unlimited wildcard SSL (worth $72/year)

### Optimization Tips

1. **Enable HTTP/3 (QUIC)**:
   - Cloudflare Dashboard → **Network** → Enable **HTTP/3**
   - Faster connection establishment

2. **Enable Brotli Compression**:
   - **Speed** → **Optimization** → Enable **Brotli**
   - Reduces bandwidth usage

3. **Disable unnecessary features**:
   - Don't enable **Auto Minify** (can break code)
   - Don't enable **Rocket Loader** (can break JavaScript)

---

## Cost Analysis

| Solution | Subdomain Limit | Cost/Year | WebSocket | Setup Complexity |
|----------|----------------|-----------|-----------|------------------|
| **Let's Encrypt only** | 50/week | $0 | Unlimited | Low |
| **Wildcard SSL cert** | Unlimited | $72 | Unlimited | Medium |
| **Cloudflare Free** | Unlimited | $0 | 100s timeout | Low |
| **Cloudflare + Let's Encrypt** | Unlimited | $0 | Unlimited | Medium |

**Recommendation**: Cloudflare + Let's Encrypt (current setup) - Best value

---

## Multi-Region Setup (Future)

When scaling to multiple relay servers:

### Option A: Geographic Subdomains

```
*.us.noverlink.com    → relay-1 (US West)
*.eu.noverlink.com    → relay-2 (Europe)
*.asia.noverlink.com  → relay-3 (Asia)
```

Each region gets unlimited subdomains via Cloudflare wildcard.

### Option B: Cloudflare Load Balancing

**Cost**: $5/month (paid feature)

```
*.noverlink.com → Cloudflare Load Balancer
  → Route to nearest relay based on geography
  → Health checks and failover
```

**Not needed for MVP** - Use geographic subdomains instead.

---

## Security Best Practices

1. **Never commit certificates**:
   - `.gitignore` protects `*.pem` and `*.key`
   - Use server-specific certificates per environment

2. **Rotate certificates regularly**:
   - Origin CA valid for 15 years, but rotate every 1-2 years
   - Cloudflare will email before expiration

3. **Use strong passwords**:
   - PostgreSQL: `POSTGRES_PASSWORD` in `.env`
   - Never use default passwords in production

4. **Enable Cloudflare firewall rules** (optional):
   - **Security** → **WAF** → Create rules
   - Block suspicious traffic patterns
   - Rate limiting on API endpoints

---

## Monitoring

### Check Certificate Expiry

```bash
# On server, check Origin CA cert expiry
openssl x509 -in deploy/caddy/certs/origin.pem -noout -enddate

# Check Let's Encrypt cert for ws.noverlink.com
echo | openssl s_client -connect ws.noverlink.com:443 2>/dev/null | openssl x509 -noout -enddate
```

### Monitor Cloudflare Analytics

1. Cloudflare Dashboard → **Analytics & Logs**
2. View:
   - Traffic volume
   - Blocked threats
   - Response time
   - Bandwidth usage

---

## References

- [Cloudflare Free Plan Features](https://www.cloudflare.com/plans/)
- [Origin CA Documentation](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)
- [Cloudflare SSL/TLS Modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/)
- [Wildcard DNS Records](https://developers.cloudflare.com/dns/manage-dns-records/reference/wildcard-dns-records/)
- [Caddy TLS Documentation](https://caddyserver.com/docs/caddyfile/directives/tls)
