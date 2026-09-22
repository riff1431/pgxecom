FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npx prisma generate && npm run build

# -----------------
# Production Image
# -----------------
FROM node:20-alpine

WORKDIR /app

# Copy essentially required components
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Ensure uploads directory exists and copy default placeholder asset
RUN mkdir -p /app/uploads
COPY --from=builder /app/uploads/placeholder-product.jpg /app/uploads/placeholder-product.jpg

EXPOSE 4000

# Start server with schema check
CMD ["sh", "-c", "npx prisma db push || true; node dist/src/main.js"]
