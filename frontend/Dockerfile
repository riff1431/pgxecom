FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build the application
COPY . .
RUN npm run build

# -----------------
# Production Image
# -----------------
FROM node:20-alpine

WORKDIR /app

# Copy standalone build output and static files
# Note: Ensure next.config.ts has output: "standalone"
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

CMD ["node", "server.js"]
