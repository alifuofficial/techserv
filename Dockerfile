# Stage 1: Build
FROM oven/bun:latest AS builder
WORKDIR /app

# Enable experimental standalone output
ENV NEXT_PRIVATE_STANDALONE=true

# Copy package files
COPY package.json bun.lock ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Build the application
RUN bun run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-privileged user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Ensure the db directory exists for the persistent volume
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app/db && chmod -R 777 /app/db

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ENTRYPOINT to handle migrations then start the server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node server.js"]
