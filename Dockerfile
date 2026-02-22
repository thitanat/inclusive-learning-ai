# ====================================
# Multi-stage Dockerfile for Next.js
# Inclusive Learning AI Platform
# ====================================
# Build targets:
# - development: For local development with hot-reload
# - production: Optimized production build

# ====================================
# Stage 1: Base - Common dependencies
# ====================================
FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

# Copy package files
COPY package.json package-lock.json* ./

# ====================================
# Stage 2: Dependencies - Install all deps
# ====================================
FROM base AS deps

# Install ALL dependencies (including devDependencies for development)
RUN npm ci --legacy-peer-deps && npm cache clean --force

# ====================================
# Stage 3: Development - For local development
# ====================================
FROM base AS development
WORKDIR /app

# Copy all dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Set environment
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3005
ENV HOSTNAME="0.0.0.0"

# Expose port
EXPOSE 3005

# Start development server with hot-reload
CMD ["npm", "run", "dev"]

# ====================================
# Stage 4: Builder - Build production assets
# ====================================
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy application code
COPY . .

# Load environment configuration
COPY env.config.js ./

# Set environment to production for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN npm run build

# ====================================
# Stage 5: Production - Optimized runtime
# ====================================
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3005
ENV HOSTNAME="0.0.0.0"

# Install wget for healthcheck
RUN apk add --no-cache wget

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/env.config.js ./env.config.js

# Change ownership to non-root user
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3005

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3005/ || exit 1

# Start the application
CMD ["node", "server.js"]
