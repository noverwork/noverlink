ARG VITE_API_URL=__VITE_API_URL__
ARG VITE_APP_URL=__VITE_APP_URL__

FROM node:22.14-slim AS dependencies
WORKDIR /app

COPY package.json package-lock.json nx.json tsconfig.base.json ./
COPY packages/interfaces/package.json ./packages/interfaces/
COPY packages/shared/package.json ./packages/shared/
COPY packages/backend-shared/package.json ./packages/backend-shared/
COPY packages/frontend/package.json ./packages/frontend/

RUN npm ci

FROM dependencies AS builder

ARG VITE_API_URL
ARG VITE_APP_URL

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_URL=$VITE_APP_URL

COPY tsconfig.json ./
COPY packages/interfaces ./packages/interfaces
COPY packages/shared ./packages/shared
COPY packages/backend-shared ./packages/backend-shared
COPY packages/frontend ./packages/frontend

RUN NX_DAEMON=false npx nx sync --yes && NX_DAEMON=false npx nx run @truley-interview/frontend:build

FROM nginx:alpine AS runner

COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
