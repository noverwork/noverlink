# Noverlink Backend Dockerfile

# ===== Stage 1: Dependencies =====
FROM node:22.14-slim AS dependencies
WORKDIR /app

COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY packages/interfaces/package.json ./packages/interfaces/
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend-shared/package.json ./packages/backend-shared/
COPY packages/backend/package.json ./packages/backend/

RUN npm ci

# ===== Stage 2: Builder =====
FROM dependencies AS builder

COPY tsconfig.json ./
COPY packages/interfaces ./packages/interfaces
COPY packages/shared ./packages/shared
COPY packages/backend-shared ./packages/backend-shared
COPY packages/backend ./packages/backend

RUN npx nx sync --yes && NX_DAEMON=false npx nx run @noverlink/backend:build

# ===== Stage 3: Runner =====
FROM node:22.14-slim AS runner
WORKDIR /app

# Copy node_modules (includes all deps - can't prune without losing backend deps)
COPY --from=dependencies /app/node_modules ./node_modules
RUN rm -rf ./node_modules/@noverlink

# Copy built workspace modules
COPY --from=builder /app/packages/interfaces/dist ./node_modules/@noverlink/interfaces/dist
COPY --from=builder /app/packages/interfaces/package.json ./node_modules/@noverlink/interfaces/
COPY --from=builder /app/packages/shared/dist ./node_modules/@noverlink/shared/dist
COPY --from=builder /app/packages/shared/package.json ./node_modules/@noverlink/shared/
# backend-shared uses src directly (no build step)
COPY --from=builder /app/packages/backend-shared/src ./node_modules/@noverlink/backend-shared/src
COPY --from=builder /app/packages/backend-shared/package.json ./node_modules/@noverlink/backend-shared/

# Copy built app
COPY --from=builder /app/packages/backend/dist ./dist/backend

# Create non-root user
RUN useradd -m backend && chown -R backend:backend /app
USER backend

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/backend/main.js"]
