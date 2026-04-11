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
FROM oven/bun:latest AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-privileged user
# In Bun image, the user is already 'bun' or we can stay as root for simple volume permissions
# but let's stick to the bun user for security
RUN groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs nextjs

# Copy standalone build from builder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lock ./bun.lock

# Ensure the app directory and db directory are owned by nextjs
# We do this as root before switching to the nextjs user
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app && chmod -R 777 /app/db

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ENTRYPOINT to handle migrations, seed data, then start the server
# --skip-generate prevents EACCES issues during 'db push'
CMD ["sh", "-c", "bunx prisma@6 db push --accept-data-loss --skip-generate && bunx prisma@6 db seed && bun server.js"]
