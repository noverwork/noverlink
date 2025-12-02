# Noverlink Backend Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:22.14-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source files needed for build
COPY tsconfig.base.json nx.json ./
COPY packages/backend ./packages/backend
COPY packages/backend-shared ./packages/backend-shared
COPY packages/shared ./packages/shared
COPY packages/interfaces ./packages/interfaces

# Build backend
RUN npm run backend:build

# Stage 2: Runtime
FROM node:22.14-slim AS runner

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts

# Copy built application
COPY --from=builder /app/dist/apps/backend ./dist/backend

# Create non-root user
RUN useradd -m -u 1000 backend && chown -R backend:backend /app
USER backend

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Run backend
CMD ["node", "dist/backend/main.js"]
