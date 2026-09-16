# web/Dockerfile — prod multi-stage (Next standalone)
# deps with bun (respects bun.lock), builder/runner with node to avoid Bun+TurboPack crash (Bun v1.3.6 + Next 16.3.5 Turbopack segfault)
FROM oven/bun:1.3.6 AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_TELEMETRY_DISABLED=1
# Use node to build (avoids Bun Turbopack runtime bug: "Expected CommonJS module to have a function wrapper")
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN apk add --no-cache curl
# Required for standalone output (next.config.ts: output:"standalone")
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --retries=5 --start-period=20s \
  CMD curl -f http://localhost:3000/ || exit 1
CMD ["node", "server.js"]
