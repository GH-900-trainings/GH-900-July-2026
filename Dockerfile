# syntax=docker/dockerfile:1

# --- Stage 1: install production dependencies -------------------------------
FROM node:22-alpine AS deps
WORKDIR /app

# Copy only the manifests first so this layer is cached unless deps change.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- Stage 2: runtime image -------------------------------------------------
FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3000
WORKDIR /app

# Bring in the production dependencies from the deps stage.
COPY --from=deps /app/node_modules ./node_modules

# Copy the application source.
COPY package.json ./
COPY server.js ./
COPY src ./src
COPY public ./public

# Run as the built-in, unprivileged "node" user.
USER node

EXPOSE 3000

# Simple liveness check against the static home page (no Azure key required).
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/ > /dev/null 2>&1 || exit 1

CMD ["node", "server.js"]
