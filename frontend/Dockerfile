FROM node:20-alpine AS builder

WORKDIR /app

# Build-time environment arguments (configured in Docploy or default to fallbacks)
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api
ARG NEXT_PUBLIC_IMAGE_BASE_URL=http://localhost:4000
ARG NEXT_PUBLIC_STORE_NAME=PGX
ARG NEXT_PUBLIC_WHATSAPP_NUMBER=+18005550199
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_IMAGE_BASE_URL=$NEXT_PUBLIC_IMAGE_BASE_URL
ENV NEXT_PUBLIC_STORE_NAME=$NEXT_PUBLIC_STORE_NAME
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build the Next.js application
COPY . .
RUN npm run build

# -----------------
# Production Image
# -----------------
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone build output and static files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
