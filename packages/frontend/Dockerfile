# Noverlink Frontend Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM node:22.14-slim AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Stage 2: Build
FROM node:22.14-slim AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy package files and configs
COPY package.json package-lock.json tsconfig.base.json tsconfig.json nx.json jest.preset.js eslint.config.mjs ./

# Copy source files needed for build
COPY packages/frontend ./packages/frontend
COPY packages/ui-shared ./packages/ui-shared
COPY packages/shared ./packages/shared
COPY packages/interfaces ./packages/interfaces
COPY packages/backend-shared ./packages/backend-shared

# Sync NX workspace and build dependencies
RUN npx nx sync --yes && npx nx run-many --target=build --projects=@noverlink/ui-shared,@noverlink/interfaces,shared

# Build frontend
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run frontend:build

# Stage 3: Runtime
FROM node:22.14-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/packages/frontend/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/static ./packages/frontend/.next/static

USER nextjs

# Expose port
EXPOSE 4200

ENV PORT=4200
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4200', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Run frontend
CMD ["node", "packages/frontend/server.js"]
