# Noverlink Migrator Dockerfile

# ===== Stage 1: Dependencies =====
FROM node:22.14-slim AS dependencies
WORKDIR /app

COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY packages/interfaces/package.json ./packages/interfaces/
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend-shared/package.json ./packages/backend-shared/
COPY packages/migrator/package.json ./packages/migrator/

RUN npm ci

# ===== Stage 2: Builder =====
FROM dependencies AS builder

COPY tsconfig.json ./
COPY packages/interfaces ./packages/interfaces
COPY packages/shared ./packages/shared
COPY packages/backend-shared ./packages/backend-shared
COPY packages/migrator ./packages/migrator

RUN npx nx sync --yes && NX_DAEMON=false npx nx run @noverlink/migrator:build

# ===== Stage 3: Runner =====
FROM node:22.14-slim AS runner
WORKDIR /app

# Copy package.json for npm prune reference
COPY package.json ./

# Copy full node_modules then prune dev deps
COPY --from=dependencies /app/node_modules ./node_modules
RUN rm -rf ./node_modules/@noverlink && npm prune --omit=dev

# Copy built workspace modules
COPY --from=builder /app/packages/interfaces/dist ./node_modules/@noverlink/interfaces/dist
COPY --from=builder /app/packages/interfaces/package.json ./node_modules/@noverlink/interfaces/
COPY --from=builder /app/packages/shared/dist ./node_modules/@noverlink/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@noverlink/shared/

# Copy built app
COPY --from=builder /app/dist/apps/migrator/main.js ./dist/migrator/
COPY packages/migrator/docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh

ENV NODE_ENV=production
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["up"]
