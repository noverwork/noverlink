# Noverlink Backend Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:22.14-slim AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace package.json files BEFORE npm ci so workspaces are set up
COPY packages/backend/package.json ./packages/backend/package.json
COPY packages/backend-shared/package.json ./packages/backend-shared/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/interfaces/package.json ./packages/interfaces/package.json

# Install all dependencies (including dev) - this sets up workspace symlinks
RUN npm ci

# Copy config files
COPY tsconfig.base.json tsconfig.json nx.json jest.preset.js eslint.config.mjs ./

# Copy source files
COPY packages/backend ./packages/backend
COPY packages/backend-shared ./packages/backend-shared
COPY packages/shared ./packages/shared
COPY packages/interfaces ./packages/interfaces

# Sync NX workspace and build dependencies
RUN npx nx sync --yes && npx nx run-many --target=build --projects=@noverlink/interfaces,shared

# Build backend
RUN NX_DAEMON=false npm run backend:build

# Stage 2: Prune dev dependencies
FROM node:22.14-slim AS pruner

WORKDIR /app

# Copy package files and node_modules from builder
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules

# Prune dev dependencies (faster than fresh npm ci)
RUN npm prune --omit=dev

# Stage 3: Runtime
FROM node:22.14-slim AS runner

WORKDIR /app

# Copy pruned node_modules from pruner stage
COPY --from=pruner /app/node_modules ./node_modules

# Copy built application
COPY --from=builder /app/packages/backend/dist ./dist/backend

# Create non-root user
RUN useradd -m backend && chown -R backend:backend /app
USER backend

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Run backend
CMD ["node", "dist/backend/main.js"]
