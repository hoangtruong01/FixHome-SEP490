# Multi-stage Dockerfile for FixHome Backend
# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies needed for build
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build production artifacts
RUN npm run build

# Stage 2: Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package descriptors and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled build output from builder stage
COPY --from=builder /app/dist ./dist

# Non-root user execution for security
USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]
