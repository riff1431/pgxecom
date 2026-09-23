FROM node:20-alpine AS builder

WORKDIR /app

# Build-time environment arguments (configured in Docploy or default to fallbacks)
ARG NEXT_PUBLIC_API_URL=https://api.playgroundfitnex.com/api
ARG NEXT_PUBLIC_IMAGE_BASE_URL=https://api.playgroundfitnex.com
ARG NEXT_PUBLIC_STORE_NAME=PGX
ARG NEXT_PUBLIC_WHATSAPP_NUMBER=+18005550199
ARG NEXT_PUBLIC_SITE_URL=https://playgroundfitnex.com
ARG NEXT_PUBLIC_SUPABASE_URL=https://traqtwdfhxduijhqsuwg.supabase.co
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyYXF0d2RmaHhkdWlqaHFzdXdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTg3NDAsImV4cCI6MjA4Mzk3NDc0MH0.XgI_AA8bYrHxxAStgGixo1lUSFqXrLFqWI6aL-GdZxQ
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51UGAa6HL4YaWgPEs82v8KWHQoZiMD156ITnmMLp46YBBa6uZP4vLJBcxV6U9V6EzFrEIp2IKj4sJWiBYVufV6Fcr00eR7EFjv8

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_IMAGE_BASE_URL=$NEXT_PUBLIC_IMAGE_BASE_URL
ENV NEXT_PUBLIC_STORE_NAME=$NEXT_PUBLIC_STORE_NAME
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_TELEMETRY_DISABLED=1

# Install dependencies (ensure devDependencies like typescript, tailwindcss are installed for build)
ENV NODE_ENV=development
COPY package*.json ./
RUN npm ci

# Build the Next.js application
COPY . .
ENV NODE_ENV=production
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
