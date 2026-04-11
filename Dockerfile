# Stage 1: Build
FROM oven/bun:latest AS builder
WORKDIR /app

# Enable experimental standalone output
ENV NEXT_PRIVATE_STANDALONE=true

# Copy source code
COPY . .

# Install, generate client, and build in a single layer
RUN bun install --frozen-lockfile && \
    bunx prisma generate && \
    bun run build && \
    rm -rf /root/.bun/install/cache

# Stage 2: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-privileged user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build from builder
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/bun.lock ./bun.lock

# Install sharp for image optimization in production
RUN npm install sharp

# Ensure the app directory and db directory are owned by nextjs
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app && chmod -R 777 /app/db

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ENTRYPOINT to handle migrations, seed data, then start the server
# --skip-generate prevents EACCES issues during 'db push'
CMD ["sh", "-c", "npx prisma@6 db push --accept-data-loss --skip-generate && npx prisma@6 db seed && node server.js"]
