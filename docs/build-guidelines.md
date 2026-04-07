# Build Guidelines

This document provides comprehensive guidelines for building, configuring, and maintaining the Truley Interview monorepo. All contributors must follow these rules to ensure consistency and maintainability.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Version Requirements](#version-requirements)
3. [Nx Workspace](#nx-workspace)
4. [TypeScript Configuration](#typescript-configuration)
5. [Package Structure](#package-structure)
6. [Dockerfile Guidelines](#dockerfile-guidelines)
7. [Webpack Configuration](#webpack-configuration)
8. [Vite Configuration](#vite-configuration)
9. [Jest Configuration](#jest-configuration)
10. [Environment Variables](#environment-variables)
11. [Common Commands](#common-commands)

---

## Architecture Overview

```
truley-interview/
├── packages/
│   ├── backend/        # NestJS API server (webpack)
│   ├── frontend/       # React dashboard (vite)
│   ├── migrator/       # MikroORM migrations (webpack)
│   ├── backend-shared/ # MikroORM entities (NO build step)
│   ├── shared/         # TS utilities (tsc)
│   └── interfaces/     # Zod schemas (tsc)
├── .github/workflows/  # CI/CD pipelines
├── package.json        # Node.js workspace root
├── nx.json             # Nx configuration
└── tsconfig.base.json  # Base TypeScript config
```

### Build Tool Matrix

| Package          | Build Tool | Output                      | Notes              |
| ---------------- | ---------- | --------------------------- | ------------------ |
| `backend`        | Webpack    | `packages/backend/dist/`    | NxAppWebpackPlugin |
| `frontend`       | Vite       | `packages/frontend/dist/`   | Library mode       |
| `migrator`       | Webpack    | `dist/apps/migrator/`       | NxAppWebpackPlugin |
| `shared`         | tsc        | `packages/shared/dist/`     | @nx/js:tsc         |
| `interfaces`     | tsc        | `packages/interfaces/dist/` | @nx/js:tsc         |
| `backend-shared` | NONE       | N/A                         | Uses src directly  |

---

## Version Requirements

**CRITICAL: These versions MUST be used across all environments.**

| Tool    | Version   | Notes                            |
| ------- | --------- | -------------------------------- |
| Node.js | 22.14     | LTS version, used in Dockerfiles |
| npm     | (bundled) | Use `npm ci` only                |
| Nx      | 22.6.x    | Workspace orchestration          |

### Version Enforcement

- **Dockerfiles**: Always use `node:22.14-slim` as base image
- **Local**: Ensure Node.js version matches via `.nvmrc` or `volta`

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
    "customConditions": ["@truley-interview/source"]
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

---

## Package Structure

### Standard Library Package (`package.json`)

```json
{
  "name": "@truley-interview/package-name",
  "version": "0.0.1",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    "./package.json": "./package.json",
    ".": {
      "@truley-interview/source": "./src/index.ts",
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    }
  },
  "dependencies": {
    "@truley-interview/other-package": "*"
  }
}
```

### Rules

1. **Internal dependencies**: Use `"*"` for workspace packages
2. **Exports**: Always include `@truley-interview/source` condition for dev imports
3. **Private**: All packages must be `"private": true`
4. **Version**: Use `"0.0.1"` for internal packages

### Special: backend-shared (No Build)

```json
{
  "name": "@truley-interview/backend-shared",
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

RUN npx nx sync --yes && NX_DAEMON=false npx nx run @truley-interview/PACKAGE:build

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

---

## Webpack Configuration

### Backend/Migrator Pattern

```javascript
const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
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

---

## Vite Configuration

### Frontend Library Pattern

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
      },
      name: '@truley-interview/frontend',
      fileName: (format, entryName) => `${entryName}.js`,
      formats: ['es'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
    },
  },
}));
```

### Rules

1. **Format**: Use `'es'` only (ESM)
2. **External**: Externalize React and peer dependencies
3. **DTS plugin**: Generate declaration files from tsconfig.lib.json

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
  forceExit: true, // Required to prevent hanging tests
};
```

### Backend Test Configuration (with SWC)

```javascript
// packages/backend/jest.config.js
const { readFileSync } = require('fs');
const path = require('path');

const swcJestConfig = JSON.parse(
  readFileSync(path.join(__dirname, '.spec.swcrc'), 'utf-8'),
);
swcJestConfig.swcrc = false;

module.exports = {
  displayName: '@truley-interview/backend',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage',
  setupFiles: ['<rootDir>/jest.setup.ts'],
};
```

### Rules

1. **Preset**: Always extend `../../jest.preset.js`
2. **forceExit**: Required to prevent hanging async operations
3. **SWC**: Use for backend (faster than ts-jest with decorators)
4. **Test environment**: `node` for backend, `jsdom` for frontend

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

---

## Environment Variables

### Backend (`.env`)

```bash
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/app

# JWT Auth
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
JWT_EXPIRES_IN=15m

# OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GITHUB_CLIENT_ID=your-client-id

# Frontend URL
FRONTEND_URL=http://localhost:4200
```

### Frontend (`.env`)

```bash
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:4200
```

---

## Common Commands

### Development

```bash
# Start all services
npm run dev

# Start individual services
npx nx serve @truley-interview/backend
npx nx dev @truley-interview/frontend
```

### Building

```bash
# Build all
npx nx run-many --target=build --all

# Build specific package
npx nx build @truley-interview/backend
npx nx build @truley-interview/frontend
```

### Testing

```bash
# All tests
npm run test

# Specific package
npx nx test @truley-interview/backend
```

### Linting

```bash
# All lints
npm run lint

# Specific package
npx nx lint @truley-interview/frontend
```

---

## Checklist for New Packages

### TypeScript Package

- [ ] Create `tsconfig.json` extending `../../tsconfig.base.json`
- [ ] Create `tsconfig.lib.json` for build configuration
- [ ] Configure `package.json` with proper exports
- [ ] Add `@truley-interview/source` condition for dev imports
- [ ] Add reference in root `tsconfig.json`

### Dockerfile

- [ ] Use `node:22.14-slim` base image
- [ ] Follow 3-stage build pattern
- [ ] Copy package.json files before source (caching)
- [ ] Run `npx nx sync --yes && NX_DAEMON=false npx nx run ...`
- [ ] Create non-root user
- [ ] Set `NODE_ENV=production`

### Environment Variables

- [ ] Create `.env.example` with all required variables
- [ ] Document each variable with comments
- [ ] Add to deployment configuration

---

## Troubleshooting

### "Cannot find module @truley-interview/..."

Run `npx nx sync` to update TypeScript project references.

### Docker build cache not working

Ensure package.json files are copied before source files in Dockerfile.

### Nx daemon issues in Docker

Always use `NX_DAEMON=false` environment variable.
