# Noverlink

> Local-to-global tunneling solution — like ngrok, but self-hosted and cost-effective

Noverlink exposes your local services to the internet. Supports HTTP, WebSocket, and TCP tunneling with a high-performance Rust relay.

## Why Noverlink?

ngrok's pricing doesn't scale for multiple tunnels. Noverlink gives you:
- **Unlimited tunnels** on your own infrastructure
- **Full control** over your data
- **Simple pricing** — host it yourself

## Features

- **HTTP/WebSocket Proxy** — Full HTTP and WebSocket support
- **TCP Tunneling** — Raw TCP forwarding for any protocol
- **Custom Subdomains** — Reserve `myapp.yourdomain.com`
- **Real-time Dashboard** — Monitor active tunnels and traffic
- **Request Inspector** — View HTTP request/response details
- **Usage Tracking** — Bandwidth and request metrics
- **Multi-plan Support** — Free, Hobbyist, Pro, Enterprise tiers
- **OAuth Login** — Social authentication support
- **Subscription Billing** — Polar integration

## Architecture

```
┌─────────────┐                    ┌─────────────┐                    ┌─────────────┐
│   Browser   │ ───── HTTP ──────► │    Relay    │ ◄──── WebSocket ── │     CLI     │
│             │                    │   (Rust)    │                    │   (Rust)    │
└─────────────┘                    └─────────────┘                    └─────────────┘
                                          │                                  │
                                          │                                  │
                                          ▼                                  ▼
                                   ┌─────────────┐                    ┌─────────────┐
                                   │   Backend   │                    │  localhost  │
                                   │  (NestJS)   │                    │   :3000     │
                                   └─────────────┘                    └─────────────┘
                                          │
                                          ▼
                                   ┌─────────────┐
                                   │  Frontend   │
                                   │  (Next.js)  │
                                   └─────────────┘
```

### Components

| Package | Tech | Purpose |
|---------|------|---------|
| `relay` | Rust | High-performance traffic forwarding |
| `cli` | Rust | Client tunnel agent |
| `backend` | NestJS | API server, auth, billing |
| `frontend` | Next.js | Control panel dashboard |
| `backend-shared` | TypeScript | Shared entities and types |
| `migrator` | MikroORM | Database migrations |

## Data Model

```
User
├── authToken          # CLI authentication
├── plan               # free / hobbyist / pro / enterprise
├── maxTunnels         # Tunnel limit per plan
├── maxBandwidthMb     # Monthly bandwidth limit
│
├── Domain[]           # Reserved subdomains
│   ├── hostname       # e.g., "myapp" or "tunnel.mycompany.com"
│   ├── isReserved     # User reserved this subdomain
│   └── TunnelSession[]
│       ├── protocol   # http / tcp
│       ├── status     # active / closed
│       ├── bytesIn/Out
│       └── HttpRequest[]  # Request/response logs
│
├── Subscription[]     # Polar billing
├── UsageQuota[]       # Monthly usage tracking
└── OAuthConnection[]  # Social logins
```

## Quick Start

### Prerequisites

- Rust 1.70+
- Node.js 20+
- PostgreSQL 15+

### 1. Start Infrastructure

```bash
npm run ms:start  # Start PostgreSQL via Docker
```

### 2. Run Migrations

```bash
npm run migrator:up
```

### 3. Start Development Servers

```bash
npm run dev  # Starts backend + frontend
```

### 4. Start Relay

```bash
cd packages/relay
WS_PORT=8444 HTTP_PORT=9444 BASE_DOMAIN=localhost cargo run
```

### 5. Connect CLI

```bash
cd packages/cli
NOVERLINK_RELAY_URL=ws://localhost:8444 cargo run -- http 3000
```

## CLI Usage

```bash
# Basic tunnel
noverlink http 3000

# Custom subdomain
noverlink http 3000 --domain myapp

# With auth token
noverlink http 3000 --token YOUR_AUTH_TOKEN
```

## Environment Variables

### Relay

```bash
WS_PORT=8444           # WebSocket control port
HTTP_PORT=9444         # HTTP proxy port
BASE_DOMAIN=localhost  # Base domain for subdomains
```

### CLI

```bash
NOVERLINK_RELAY_URL=ws://localhost:8444  # Relay WebSocket URL
NOVERLINK_AUTH_TOKEN=xxx                 # User auth token
```

### Backend

```bash
DATABASE_URL=postgresql://...
POLAR_API_KEY=xxx      # Billing integration
```

## Project Structure

```
noverlink/
├── packages/
│   ├── relay/           # Rust relay server
│   ├── cli/             # Rust CLI client
│   ├── backend/         # NestJS API
│   ├── frontend/        # Next.js dashboard
│   ├── backend-shared/  # Shared entities
│   ├── ui-shared/       # Shared UI components
│   ├── shared/          # Shared utilities
│   └── migrator/        # DB migrations
├── scripts/             # Dev scripts
└── docker-compose.yml   # Local infrastructure
```

## Scripts

```bash
npm run dev              # Start backend + frontend
npm run relay:serve      # Start relay
npm run cli:serve        # Start CLI
npm run migrator:up      # Run migrations
npm run migrator:down    # Rollback migrations
npm run typecheck        # Type checking
npm run lint             # Linting
npm run test             # Run tests
```

## License

[AGPL-3.0](LICENSE)
