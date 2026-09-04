# Multi-stage build for self-hosting Linzido outside Vercel (VPS, ECS, etc).
# Vercel deploys ignore this file entirely — it's an additive option, not a
# replacement for the existing zero-config Vercel path.
#
# IMPORTANT: several routes (/, /services, /services/[slug], /work/[slug])
# are statically generated at build time and fetch from Payload during that
# build — so `docker build` needs a reachable DATABASE_URI and a real
# PAYLOAD_SECRET, exactly like running `npm run build` locally does. Pass
# them as build args (see docker-compose.yml).

FROM node:20-alpine AS deps
WORKDIR /app
# Alpine's musl libc needs this for a couple of native deps (sharp's
# dependency chain among them) to resolve correctly.
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG PAYLOAD_SECRET
ARG DATABASE_URI
ENV PAYLOAD_SECRET=${PAYLOAD_SECRET}
ENV DATABASE_URI=${DATABASE_URI}
ENV NEXT_TELEMETRY_DISABLED=1
# Flips next.config.ts's output mode to "standalone" for this build only —
# local `npm run build`/`npm run start` outside Docker never sets this, so
# they're unaffected.
ENV DOCKER_BUILD=1

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# `output: "standalone"` (next.config.ts) traces exactly the node_modules
# this app actually needs at runtime — the final image never sees the full
# ~700-package install, keeping it small.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Payload's local media storage and the SQLite file both need to survive
# container restarts — mount volumes at these paths (see docker-compose.yml).
RUN mkdir -p /app/public/media /app/data && chown -R nextjs:nodejs /app/public/media /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
