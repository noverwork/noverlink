FROM 172.16.0.22:5000/base-images/node:22.14.0-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Set NODE_ENV for build optimization (build-time only)
ENV NODE_ENV=production

# Build the application
RUN npm run migrator:build

# Runner stage
FROM 172.16.0.22:5000/base-images/node:22.14.0-slim AS runner

WORKDIR /app

# Copy package files and install production dependencies only
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/dist/apps/migrator ./dist/migrator
COPY apps/migrator/docker-entrypoint.sh ./
RUN chmod +x ./docker-entrypoint.sh


# Optional: Set migrator command via environment variable
# ENV MIGRATOR_COMMAND=up
# Valid values: up, down, refresh, create
# Can be overridden at runtime: docker run -e MIGRATOR_COMMAND=down ...

# Set entrypoint and default command
ENTRYPOINT ["./docker-entrypoint.sh"]
# CMD can be overridden with command line args or MIGRATOR_COMMAND env var
CMD ["up"]