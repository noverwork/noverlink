# Build Guidelines

This document provides comprehensive guidelines for building, configuring, and maintaining the Noverlink monorepo. All contributors must follow these rules to ensure consistency and maintainability.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Version Requirements](#version-requirements)
3. [Nx Workspace](#nx-workspace)
4. [TypeScript Configuration](#typescript-configuration)
5. [Package Structure](#package-structure)
6. [Dockerfile Guidelines](#dockerfile-guidelines)
7. [Docker Ignore](#docker-ignore)
8. [Webpack Configuration](#webpack-configuration)
9. [Vite Configuration](#vite-configuration)
10. [Next.js Configuration](#nextjs-configuration)
11. [PostCSS / Tailwind Configuration](#postcss--tailwind-configuration)
12. [Rust/Cargo Configuration](#rustcargo-configuration)
13. [Jest Configuration](#jest-configuration)
14. [SWC Configuration](#swc-configuration)
15. [Environment Variables (Build-time)](#environment-variables-build-time)
16. [CI/CD Pipeline](#cicd-pipeline)
17. [Docker Image Tagging](#docker-image-tagging)
18. [Common Commands](#common-commands)

---

## Architecture Overview

```
noverlink/
├── packages/
│   ├── backend/        # NestJS API server (webpack)
│   ├── frontend/       # Next.js dashboard (next.config.js)
│   ├── relay/          # Rust WebSocket relay (Cargo)
│   ├── cli/            # Rust CLI client (Cargo)
│   ├── rs-shared/      # Shared Rust types
│   ├── migrator/       # MikroORM migrations (webpack)
│   ├── backend-shared/ # MikroORM entities (NO build step)
│   ├── shared/         # TS utilities (tsc)
│   ├── interfaces/     # Zod schemas (tsc)
│   └── ui-shared/      # React components (vite)
├── .github/workflows/  # CI/CD pipelines
├── Cargo.toml          # Rust workspace root
├── package.json        # Node.js workspace root
├── nx.json             # Nx configuration
└── tsconfig.base.json  # Base TypeScript config
```

### Build Tool Matrix

| Package | Build Tool | Output | Notes |
|---------|------------|--------|-------|
| `backend` | Webpack | `packages/backend/dist/` | NxAppWebpackPlugin |
| `frontend` | Next.js | `packages/frontend/.next/` | Standalone output |
| `migrator` | Webpack | `dist/apps/migrator/` | NxAppWebpackPlugin |
| `shared` | tsc | `packages/shared/dist/` | @nx/js:tsc |
| `interfaces` | tsc | `packages/interfaces/dist/` | @nx/js:tsc |
| `ui-shared` | Vite | `packages/ui-shared/dist/` | Library mode |
| `backend-shared` | NONE | N/A | Uses src directly |
| `relay` | Cargo | `target/release/relay` | Rust binary |
| `cli` | Cargo | `target/release/noverlink-cli` | Rust binary |

---

## Version Requirements

**CRITICAL: These versions MUST be used across all environments.**

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 22.14 | LTS version, used in Dockerfiles |
| Rust | 1.83 | Specified in CI workflows |
| npm | (bundled) | Use `npm ci` only |
| Nx | 21.6.x | Workspace orchestration |

### Version Enforcement

- **Dockerfiles**: Always use `node:22.14-slim` as base image
- **CI**: Set `NODE_VERSION: "22"` and `RUST_VERSION: "1.83"` in workflow env
- **Local**: Ensure `.nvmrc` or equivalent matches

---

## Nx Workspace

### Configuration (`nx.json`)

```json
{
  "plugins": [
    "@nx/js/typescript",
    "@nx/webpack/plugin",
    "@nx/eslint/plugin",
    "@nx/jest/plugin",
    "@nx/next/plugin",
    "@nx/vite/plugin"
  ],
  "targetDefaults": {
    "test": { "dependsOn": ["^build"] },
    "@nx/js:tsc": {
      "cache": true,
      "dependsOn": ["^build"],
      "inputs": ["production", "^production"]
    }
  }
}
```

### Key Rules

1. **Plugin-based configuration**: Prefer Nx plugins over manual target definitions
2. **Build dependencies**: Tests depend on `^build` (build dependencies first)
3. **Caching**: Enable caching for all build targets
4. **Named inputs**: Use `production` input to exclude test files from build cache

### Special Cases

- **backend-shared**: Excluded from `@nx/js/typescript` build plugin (uses source directly)
  ```json
  {
    "plugin": "@nx/js/typescript",
    "exclude": ["packages/backend-shared/*"]
  }
  ```

---

## TypeScript Configuration

### Base Configuration (`tsconfig.base.json`)

```json
{
  "compilerOptions": {
    "composite": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "isolatedModules": true,
    "lib": ["es2022"],
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "target": "es2022",
    "customConditions": ["@noverlink/source"]
  }
}
```

### Configuration Hierarchy

```
tsconfig.base.json (root base config)
├── tsconfig.json (root solution file - references all packages)
├── packages/*/tsconfig.json (package solution file)
│   ├── packages/*/tsconfig.lib.json (library build config)
│   ├── packages/*/tsconfig.app.json (app build config)
│   └── packages/*/tsconfig.spec.json (test config)
```

### Package-Specific Rules

#### Library Packages (`shared`, `interfaces`)
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src",
    "emitDeclarationOnly": false
  },
  "include": ["src/**/*.ts"],
  "exclude": ["**/*.spec.ts", "**/*.test.ts"]
}
```

#### NestJS Backend
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "es2021"
  }
}
```

#### Next.js Frontend
```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "noEmit": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

#### UI Library (Vite)
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

### Custom Conditions

The `@noverlink/source` custom condition enables importing TypeScript source directly during development:

```json
// package.json exports
{
  "exports": {
    ".": {
      "@noverlink/source": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  }
}
```

---

## Package Structure

### Standard Library Package (`package.json`)

```json
{
  "name": "@noverlink/package-name",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "@noverlink/source": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "dependencies": {
    "@noverlink/other-package": "*"
  }
}
```

### Rules

1. **Internal dependencies**: Use `"*"` for workspace packages
2. **Exports**: Always include `@noverlink/source` condition for dev imports
3. **Private**: All packages must be `"private": true`
4. **Version**: Use `"0.0.1"` for internal packages

### Special: backend-shared (No Build)

```json
{
  "name": "@noverlink/backend-shared",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "import": "./src/index.ts",
      "default": "./src/index.ts"
    }
  }
}
```

---

## Dockerfile Guidelines

### Base Image

**ALWAYS use `node:22.14-slim` for Node.js packages.**

```dockerfile
FROM node:22.14-slim AS dependencies
FROM node:22.14-slim AS builder
FROM node:22.14-slim AS runner
```

### Multi-Stage Build Pattern

All Dockerfiles MUST follow this 3-stage pattern:

```dockerfile
# ===== Stage 1: Dependencies =====
FROM node:22.14-slim AS dependencies
WORKDIR /app

# Copy package manifests (cache-friendly order)
COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY packages/PACKAGE/package.json ./packages/PACKAGE/

RUN npm ci

# ===== Stage 2: Builder =====
FROM dependencies AS builder

COPY tsconfig.json ./
COPY packages/PACKAGE ./packages/PACKAGE

RUN npx nx sync --yes && NX_DAEMON=false npx nx run @noverlink/PACKAGE:build

# ===== Stage 3: Runner =====
FROM node:22.14-slim AS runner
WORKDIR /app

# Copy built artifacts
COPY --from=builder /app/packages/PACKAGE/dist ./dist

# Create non-root user
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

ENV NODE_ENV=production
CMD ["node", "dist/main.js"]
```

### Critical Rules

1. **Copy order matters**: Copy package.json files first for better caching
2. **npm ci**: NEVER use `npm install` in Dockerfiles
3. **NX_DAEMON=false**: Always disable Nx daemon in Docker builds
4. **npx nx sync --yes**: Always sync before building
5. **Non-root user**: Always create and switch to non-root user
6. **NODE_ENV=production**: Always set in runner stage

### Package-Specific Patterns

#### Backend/Migrator: Copy Workspace Modules

```dockerfile
# Copy node_modules then remove workspace packages
COPY --from=dependencies /app/node_modules ./node_modules
RUN rm -rf ./node_modules/@noverlink

# Copy built workspace modules individually
COPY --from=builder /app/packages/interfaces/dist ./node_modules/@noverlink/interfaces/dist
COPY --from=builder /app/packages/interfaces/package.json ./node_modules/@noverlink/interfaces/
COPY --from=builder /app/packages/shared/dist ./node_modules/@noverlink/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@noverlink/shared/

# backend-shared uses src directly (no build step)
COPY --from=builder /app/packages/backend-shared/src ./node_modules/@noverlink/backend-shared/src
COPY --from=builder /app/packages/backend-shared/package.json ./node_modules/@noverlink/backend-shared/
```

#### Frontend: Standalone Build

```dockerfile
# Next.js standalone output
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/public ./packages/frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/static ./packages/frontend/.next/static

# Build-time args for NEXT_PUBLIC_* variables
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

CMD ["node", "packages/frontend/server.js"]
```

#### Relay (Rust): Dependency Caching

```dockerfile
FROM rust:1.83-bookworm AS builder

# Version injection
ARG RELAY_VERSION
ENV RELAY_VERSION=${RELAY_VERSION}

# Copy manifests first (cache dependencies)
COPY Cargo.toml Cargo.lock ./
COPY packages/rs-shared ./packages/rs-shared
COPY packages/relay/Cargo.toml ./packages/relay/Cargo.toml

# Create dummy source for dependency caching
RUN mkdir -p packages/relay/src && echo "fn main() {}" > packages/relay/src/main.rs
RUN cargo build --release --package relay 2>/dev/null || true
RUN rm -rf target/release/.fingerprint/relay-*

# Copy real source and build
COPY packages/relay ./packages/relay
RUN cargo build --release --package relay

# Runtime: minimal image
FROM debian:bookworm-slim
COPY --from=builder /app/target/release/relay /usr/local/bin/relay
```

### Healthcheck (Frontend)

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4200', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
```

---

## Docker Ignore

### Configuration (`.dockerignore`)

```text
# Dependencies (installed fresh in container)
node_modules
packages/*/node_modules

# Build outputs (will be rebuilt)
dist
packages/*/dist
.next
packages/*/.next
out-tsc
target

# Development files
.env
.env.*
!.env.example

# IDE and cache
.idea
.vscode
.nx
.git

# Tests (not needed for production build)
coverage
test-output
*.test.ts
*.spec.ts

# Documentation
docs
*.md
!README.md
```

### Key Patterns

1. **Exclude node_modules**: Dependencies installed fresh via `npm ci`
2. **Exclude build outputs**: Rebuilt inside container
3. **Include Cargo.lock**: Required for reproducible Rust builds
4. **Exclude tests**: Not needed in production images
5. **Keep .env.example**: Template files are useful

---

## Webpack Configuration

### Backend/Migrator Pattern

```javascript
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
    // Source maps for development only
    ...(process.env.NODE_ENV !== 'production' && {
      devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    }),
  },
  plugins: [
    new NxAppWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/main.ts',
      tsConfig: './tsconfig.app.json',
      optimization: false,
      outputHashing: 'none',
      generatePackageJson: true,
      sourceMaps: true,
    }),
  ],
};
```

### Rules

1. **Target**: Always `'node'` for backend packages
2. **Compiler**: Use `'tsc'` for NestJS (decorator metadata)
3. **Optimization**: Set to `false` for Node.js backends
4. **generatePackageJson**: Enable for Docker deployments
5. **Output path**:
   - Backend: `packages/backend/dist/`
   - Migrator: `dist/apps/migrator/`

---

## Vite Configuration

### UI Library Pattern

```typescript
import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(() => ({
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  build: {
    outDir: './dist',
    emptyOutDir: true,
    lib: {
      entry: {
        index: 'src/index.ts',
        server: 'src/server.ts',  // SSR entry if needed
      },
      name: '@noverlink/ui-shared',
      fileName: (format, entryName) => `${entryName}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'clsx',
        'tailwind-merge',
      ],
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
}));
```

### Rules

1. **Format**: Use `'es'` only (ESM)
2. **External**: Externalize React and peer dependencies
3. **DTS plugin**: Generate declaration files from tsconfig.lib.json
4. **Multiple entries**: Support both client and server exports

---

## Next.js Configuration

```javascript
const { composePlugins, withNx } = require('@nx/next');

const nextConfig = {
  nx: {
    svgr: false,  // Disable deprecated NX SVGR
  },
  output: 'standalone',  // Required for Docker
};

module.exports = composePlugins(withNx)(nextConfig);
```

### Rules

1. **Standalone output**: ALWAYS enable for Docker deployment
2. **SVGR**: Disabled by default, configure manually if needed
3. **Environment variables**: Use build args for NEXT_PUBLIC_* in Docker

---

## PostCSS / Tailwind Configuration

### Configuration (`postcss.config.mjs`)

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

### Key Points

1. **Tailwind CSS v4**: Uses `@tailwindcss/postcss` plugin (not legacy `tailwindcss`)
2. **No tailwind.config.js**: Tailwind v4 uses CSS-based configuration
3. **CSS file**: Styles defined in `src/styles.css` with `@import "tailwindcss"`

### Package Usage

| Package | PostCSS | Notes |
|---------|---------|-------|
| `frontend` | Yes | Next.js with Tailwind |
| `ui-shared` | Yes | Vite library with Tailwind |

---

## Rust/Cargo Configuration

### Workspace Configuration (`Cargo.toml`)

```toml
[workspace]
resolver = "2"
members = [
    "packages/cli",
    "packages/relay",
    "packages/rs-shared",
]

[workspace.package]
version = "0.1.0"
edition = "2021"
license = "MIT"
authors = ["Noverlink Team"]

[workspace.lints.rust]
unsafe_code = "forbid"
missing_docs = "warn"
unused_must_use = "deny"
unused_variables = "deny"
dead_code = "deny"
unused_imports = "deny"

[workspace.lints.clippy]
all = { level = "warn", priority = -2 }
pedantic = { level = "warn", priority = -1 }
nursery = { level = "warn", priority = -1 }
correctness = { level = "deny", priority = -1 }
suspicious = { level = "deny", priority = -1 }
unwrap_used = "deny"
expect_used = "deny"
todo = "deny"
dbg_macro = "deny"

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
strip = true
```

### Package Configuration

```toml
[package]
name = "package-name"
version = "0.1.0"
edition = "2021"

[lints]
workspace = true  # Inherit workspace lints

[dependencies]
noverlink-shared = { path = "../rs-shared", features = ["feature-name"] }
```

### Critical Rules

1. **unsafe_code = "forbid"**: No unsafe code allowed
2. **unwrap_used = "deny"**: No `.unwrap()` - use proper error handling
3. **expect_used = "deny"**: No `.expect()` - use `?` operator
4. **Workspace lints**: All packages inherit workspace lints
5. **Release profile**: Enable LTO and strip symbols

---

## Jest Configuration

### Root Configuration (`jest.config.ts`)

```typescript
import { getJestProjectsAsync } from '@nx/jest';
import type { Config } from 'jest';

export default async (): Promise<Config> => ({
  projects: await getJestProjectsAsync(),
});
```

### Preset (`jest.preset.js`)

```javascript
const nxPreset = require('@nx/jest/preset').default;

module.exports = {
  ...nxPreset,
  forceExit: true,  // Required to prevent hanging tests
};
```

### Package-Specific Configurations

#### Backend (NestJS with SWC)

```javascript
// packages/backend/jest.config.js
const { readFileSync } = require('fs');
const path = require('path');

const swcJestConfig = JSON.parse(
  readFileSync(path.join(__dirname, '.spec.swcrc'), 'utf-8')
);
swcJestConfig.swcrc = false;

module.exports = {
  displayName: '@noverlink/backend',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
  setupFiles: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^../app-config$': '<rootDir>/src/__mocks__/app-config.ts',
  },
};
```

#### Frontend (Next.js)

```typescript
// packages/frontend/jest.config.ts
import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  displayName: '@noverlink/frontend',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/packages/frontend',
  testEnvironment: 'jsdom',
};

export default createJestConfig(config);
```

### Rules

1. **Preset**: Always extend `../../jest.preset.js`
2. **forceExit**: Required to prevent hanging async operations
3. **SWC**: Use for backend (faster than ts-jest with decorators)
4. **Next.js**: Use `next/jest` for proper Next.js integration
5. **Test environment**: `node` for backend, `jsdom` for frontend

---

## SWC Configuration

SWC is used for fast TypeScript compilation in Jest tests, especially for NestJS with decorators.

### Backend Test Configuration (`.spec.swcrc`)

```json
{
  "jsc": {
    "target": "es2017",
    "parser": {
      "syntax": "typescript",
      "decorators": true,
      "dynamicImport": true
    },
    "transform": {
      "decoratorMetadata": true,
      "legacyDecorator": true
    },
    "keepClassNames": true,
    "externalHelpers": true,
    "loose": true
  },
  "module": {
    "type": "es6"
  },
  "sourceMaps": true,
  "exclude": []
}
```

### Key Settings

1. **decorators: true**: Enable TypeScript decorators
2. **decoratorMetadata: true**: Emit decorator metadata (required for NestJS DI)
3. **legacyDecorator: true**: Use legacy decorator behavior
4. **keepClassNames: true**: Preserve class names for dependency injection
5. **target: es2017**: Target ES2017 for Node.js compatibility

### Usage

Reference in Jest config:
```javascript
const swcJestConfig = JSON.parse(
  readFileSync(path.join(__dirname, '.spec.swcrc'), 'utf-8')
);
swcJestConfig.swcrc = false;  // Don't look for .swcrc, use this config

module.exports = {
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
};
```

---

## Environment Variables (Build-time)

These environment variables affect the build output and must be set before building.

### CLI Build Variables

```bash
# packages/cli/.env.example
# Set BEFORE running cargo build, baked into the binary
NOVERLINK_API_URL=http://localhost:3000   # Backend API URL
NOVERLINK_VERSION=v1.0.0                  # Version string (injected by CI)
```

### Frontend Build Variables (Docker)

```bash
# Passed as --build-arg in Docker build
NEXT_PUBLIC_API_URL=https://api.noverlink.com
NEXT_PUBLIC_APP_URL=https://noverlink.com
NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID=xxx
NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID=xxx
```

### Relay Build Variables

```bash
# packages/relay - version injected at build time
RELAY_VERSION=v1.0.0  # Injected by CI via --build-arg
```

### CI Build Variable Injection

```yaml
# GitHub Actions - CLI
- name: Set version
  run: |
    if [[ "${{ github.ref }}" == refs/tags/v* ]]; then
      echo "NOVERLINK_VERSION=${{ github.ref_name }}" >> $GITHUB_ENV
    else
      echo "NOVERLINK_VERSION=${{ github.sha }}" >> $GITHUB_ENV
    fi

# GitHub Actions - Frontend Docker
- name: Build frontend
  uses: docker/build-push-action@v6
  with:
    build-args: |
      NEXT_PUBLIC_API_URL=${{ vars.NEXT_PUBLIC_API_URL }}
      NEXT_PUBLIC_APP_URL=${{ vars.NEXT_PUBLIC_APP_URL }}
```

---

## CI/CD Pipeline

### Workflow Triggers

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | push/PR to main | Lint, typecheck, test |
| `build.yml` | push to main, tags | Build Docker images |
| `release-cli.yml` | push to main, tags | Build CLI binaries |

### CI Pipeline Order

```
install → build-deps → [lint, typecheck, test] (parallel)
```

### Docker Build Triggers

- **main branch**: Builds with `latest` and `<sha>` tags
- **v* tags**: Builds with `latest`, `<sha>`, and `<tag>` tags

### CLI Release Targets

| Platform | Target | Output |
|----------|--------|--------|
| Linux x64 | `x86_64-unknown-linux-gnu` | `.tar.gz` |
| Linux ARM64 | `aarch64-unknown-linux-gnu` | `.tar.gz` |
| macOS x64 | `x86_64-apple-darwin` | `.tar.gz` |
| macOS ARM64 | `aarch64-apple-darwin` | `.tar.gz` |
| Windows x64 | `x86_64-pc-windows-msvc` | `.zip` |

---

## Docker Image Tagging

### Tag Strategy

```yaml
tags: |
  ghcr.io/noverwork/noverlink-PACKAGE:${{ github.sha }}
  ghcr.io/noverwork/noverlink-PACKAGE:latest
  ${{ github.ref_type == 'tag' && format('ghcr.io/noverwork/noverlink-PACKAGE:{0}', github.ref_name) || '' }}
```

### Image Names

| Package | Image |
|---------|-------|
| Backend | `ghcr.io/noverwork/noverlink-backend` |
| Frontend | `ghcr.io/noverwork/noverlink-frontend` |
| Migrator | `ghcr.io/noverwork/noverlink-migrator` |
| Relay | `ghcr.io/noverwork/noverlink-relay` |

### Tag Types

1. **SHA tag**: Every build gets a commit SHA tag
2. **latest**: Updated on every main push and tag push
3. **Version tag**: Only created when pushing `v*` tags

---

## Common Commands

### Development

```bash
# Start all services
npm run dev

# Start individual services
npx nx serve @noverlink/backend
npx nx dev @noverlink/frontend

# Rust development
cd packages/relay && cargo run
cd packages/cli && cargo run -- http 3000
```

### Building

```bash
# Build all
npx nx run-many --target=build --all

# Build specific package
npx nx build @noverlink/backend
npx nx build @noverlink/frontend

# Build Rust
cargo build --release --package relay
cargo build --release --package noverlink-cli
```

### Testing

```bash
# All tests
npm run test

# Specific package
npx nx test @noverlink/backend

# Rust tests
cargo test --package relay
cargo test --package noverlink-cli
```

### Linting

```bash
# All lints
npm run lint

# Rust formatting
cargo fmt --all -- --check

# Rust clippy
cargo clippy --all-targets --all-features
```

### Docker

```bash
# Build locally
docker build -f packages/backend/Dockerfile -t noverlink-backend .
docker build -f packages/frontend/Dockerfile \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  -t noverlink-frontend .

# Build Relay with version
docker build -f packages/relay/Dockerfile \
  --build-arg RELAY_VERSION=v1.0.0 \
  -t noverlink-relay .
```

---

## Checklist for New Packages

### TypeScript Package

- [ ] Create `tsconfig.json` extending `../../tsconfig.base.json`
- [ ] Create `tsconfig.lib.json` for build configuration
- [ ] Configure `package.json` with proper exports
- [ ] Add `@noverlink/source` condition for dev imports
- [ ] Add reference in root `tsconfig.json`

### Dockerfile

- [ ] Use `node:22.14-slim` base image
- [ ] Follow 3-stage build pattern
- [ ] Copy package manifests before source (caching)
- [ ] Run `npx nx sync --yes && NX_DAEMON=false npx nx run ...`
- [ ] Create non-root user
- [ ] Set `NODE_ENV=production`

### Rust Package

- [ ] Add to workspace members in root `Cargo.toml`
- [ ] Use `[lints] workspace = true`
- [ ] Use workspace path dependencies for `noverlink-shared`
- [ ] No unsafe code, no unwrap/expect

### Environment Variables

- [ ] Create `.env.example` with all required variables
- [ ] Document each variable with comments
- [ ] Add to `deploy/.env.example` if needed for production

---

## Troubleshooting

### "Cannot find module @noverlink/..."

Run `npx nx sync` to update TypeScript project references.

### Docker build cache not working

Ensure package.json files are copied before source files in Dockerfile.

### Nx daemon issues in Docker

Always use `NX_DAEMON=false` environment variable.

### Rust dependency caching not working

Use dummy source file pattern to build dependencies first, then clean fingerprints before copying real source.
