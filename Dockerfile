# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /app

# Enable experimental standalone output
ENV NEXT_PRIVATE_STANDALONE=true

# Copy package files first for better caching
COPY package*.json ./
COPY bun.lock ./

# Install dependencies, generate client, and cleanup cache
RUN npm install && npm cache clean --force

# Copy remaining source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate && npm run build

# Stage 2: Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-privileged user and setup directories
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p /app/db && \
    chown -R nextjs:nodejs /app && \
    chmod -R 777 /app/db

# Copy standalone build from builder
# The standalone output includes necessary node_modules (including sharp)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# ENTRYPOINT to handle migrations, seed data, then start the server
CMD ["sh", "-c", "npx prisma@6 db push --accept-data-loss && npx prisma@6 db seed && node server.js"]
