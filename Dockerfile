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

# Copy standalone build from builder with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/bun.lock ./bun.lock

# Ensure the db directory exists and is owned by nextjs
RUN mkdir -p /app/db && chown nextjs:nodejs /app/db && chmod 777 /app/db

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ENTRYPOINT to handle migrations, seed data, then start the server
# --skip-generate prevents EACCES issues during 'db push'
CMD ["sh", "-c", "bunx prisma@6 db push --accept-data-loss --skip-generate && bunx prisma@6 db seed && bun server.js"]
