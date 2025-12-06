# Noverlink Migrator Dockerfile
# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:22.14-slim AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy workspace package.json files BEFORE npm ci so workspaces are set up
COPY packages/migrator/package.json ./packages/migrator/package.json
COPY packages/backend-shared/package.json ./packages/backend-shared/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/interfaces/package.json ./packages/interfaces/package.json

# Install all dependencies (including dev) - this sets up workspace symlinks
RUN npm ci --retry 3 || (sleep 5 && npm ci --retry 3)

# Copy config files
COPY tsconfig.base.json tsconfig.json nx.json jest.preset.js eslint.config.mjs ./

# Copy source files
COPY packages/migrator ./packages/migrator
COPY packages/backend-shared ./packages/backend-shared
COPY packages/shared ./packages/shared
COPY packages/interfaces ./packages/interfaces

# Sync NX workspace and build dependencies
RUN npx nx sync --yes && npx nx run-many --target=build --projects=@noverlink/interfaces,shared

# Build migrator
RUN NX_DAEMON=false npm run migrator:build

# Runner stage
FROM node:22.14-slim AS runner

WORKDIR /app

# Copy package files for workspace structure
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/packages/migrator/package.json ./packages/migrator/package.json
COPY --from=builder /app/packages/backend-shared/package.json ./packages/backend-shared/package.json
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/packages/interfaces/package.json ./packages/interfaces/package.json

# Install production dependencies
RUN npm ci --omit=dev --ignore-scripts --retry 3 || (sleep 5 && npm ci --omit=dev --ignore-scripts --retry 3)

# Copy built migrator and its dependencies
COPY --from=builder /app/dist/apps/migrator ./dist/migrator
COPY --from=builder /app/dist/shared ./dist/shared
COPY --from=builder /app/dist/interfaces ./dist/interfaces

COPY packages/migrator/docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

# Optional: Set migrator command via environment variable
# ENV MIGRATOR_COMMAND=up
# Valid values: up, down, refresh, create
# Can be overridden at runtime: docker run -e MIGRATOR_COMMAND=down ...

# Set entrypoint and default command
ENTRYPOINT ["./docker-entrypoint.sh"]
# CMD can be overridden with command line args or MIGRATOR_COMMAND env var
CMD ["up"]
