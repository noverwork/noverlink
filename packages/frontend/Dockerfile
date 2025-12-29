# Noverlink Frontend Dockerfile

# ===== Stage 1: Dependencies =====
FROM node:22.14-slim AS dependencies
WORKDIR /app

COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY packages/interfaces/package.json ./packages/interfaces/
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend-shared/package.json ./packages/backend-shared/
COPY packages/ui-shared/package.json ./packages/ui-shared/
COPY packages/frontend/package.json ./packages/frontend/

RUN npm ci

# ===== Stage 2: Builder =====
FROM dependencies AS builder

COPY tsconfig.json ./
COPY packages/interfaces ./packages/interfaces
COPY packages/shared ./packages/shared
COPY packages/backend-shared ./packages/backend-shared
COPY packages/ui-shared ./packages/ui-shared
COPY packages/frontend ./packages/frontend

# Build-time environment variables (NEXT_PUBLIC_* are embedded at build time)
ARG NEXT_PUBLIC_API_URL=http://localhost:3000
ARG NEXT_PUBLIC_APP_URL=http://localhost:4200
ARG NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID
ARG NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID=$NEXT_PUBLIC_POLAR_STARTER_PRODUCT_ID
ENV NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID=$NEXT_PUBLIC_POLAR_PRO_PRODUCT_ID
ENV NEXT_TELEMETRY_DISABLED=1

RUN npx nx sync --yes && NX_DAEMON=false npx nx run @noverlink/frontend:build

# ===== Stage 3: Runner =====
FROM node:22.14-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build (includes node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/standalone ./

# Copy public and static assets to where standalone server.js expects them
# Per Next.js docs: copy to standalone/public and standalone/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/public ./packages/frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/packages/frontend/.next/static ./packages/frontend/.next/static

USER nextjs

EXPOSE 4200
ENV PORT=4200
ENV HOSTNAME="0.0.0.0"

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4200', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "packages/frontend/server.js"]
