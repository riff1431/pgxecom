# Docker Setup Guide

This guide explains how to run the e-commerce application using Docker and Docker Compose.

## Overview

The application consists of the following services:

- **postgres**: PostgreSQL 16 database
- **backend**: NestJS API server (port 4000)
- **frontend**: Next.js application (port 3000)
- **nginx**: Nginx reverse proxy (port 80/443)

## Prerequisites

- Docker installed on your system
- Docker Compose installed
- `.env` files configured in both `backend/` and `frontend/` directories

## Environment Configuration

The backend and frontend containers both source their runtime values directly from their own `.env` files. The backend image also runs Prisma generate at build time and Prisma migrate deploy at startup.

### Backend Environment Variables

The backend loads all variables from `backend/.env`. Key variables include:

```env
POSTGRES_DB=ecommerce
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/ecommerce?schema=public
DIRECT_URL=postgresql://postgres:postgres@postgres:5432/ecommerce
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d
PORT=4000
NODE_ENV=production
FRONTEND_URL=https://nowripple.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM=E-Commerce Store <your-email@gmail.com>
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Note**: The `postgres` service reads the same `POSTGRES_*` values from `backend/.env`, and Prisma uses the local `DATABASE_URL` and `DIRECT_URL` from the same file. Replace `your-vps-domain.com` with your actual VPS domain or public IP.

### Frontend Environment Variables

The frontend loads all variables from `frontend/.env`. Key variables include:

```env
NEXT_PUBLIC_API_URL=http://your-vps-domain.com/api
NEXT_PUBLIC_IMAGE_BASE_URL=http://your-vps-domain.com
NEXT_PUBLIC_STORE_NAME=PGX
NEXT_PUBLIC_WHATSAPP_NUMBER=+8801XXXXXXXXX
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_TELEMETRY_DISABLED=1
```

**Note**: The frontend build and runtime both read these values from `frontend/.env`. Replace `your-vps-domain.com` with your actual VPS domain or public IP.

## Running the Application

### Build and Start All Services

```bash
docker-compose up -d --build
```

This command will:

1. Build the backend image
2. Build the frontend image
3. Start all services in the background

### Verify Services are Running

```bash
docker-compose ps
```

You should see all services with status `Up`.

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API via Nginx**: http://localhost:80/api/

### View Logs

View logs for all services:

```bash
docker-compose logs -f
```

View logs for a specific service:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

## Database Management

### Run Database Migrations

The backend automatically runs migrations on startup with:

```bash
npx prisma migrate deploy
```

### Access Database with psql

```bash
docker-compose exec postgres psql -U postgres -d ecommerce
```

### Seed Database (if needed)

```bash
docker-compose exec backend npm run prisma:seed
```

## Stopping and Cleaning Up

### Stop All Services

```bash
docker-compose stop
```

### Stop and Remove All Containers

```bash
docker-compose down
```

### Remove All Containers and Volumes (WARNING: Deletes data)

```bash
docker-compose down -v
```

## Troubleshooting

### Port Already in Use

If ports 80, 3000, or 4000 are already in use:

1. Change the port mapping in `docker-compose.yml`
2. Or stop the service using the port: `lsof -i :PORT` and `kill PID`

### Database Connection Issues

1. Ensure postgres service is running: `docker-compose logs postgres`
2. Verify DATABASE_URL in backend `.env` matches docker-compose configuration
3. Check if postgres container has fully started (wait 5-10 seconds)

### Frontend Cannot Connect to Backend

1. Ensure `NEXT_PUBLIC_API_URL` is set to `http://backend:4000/api` in frontend `.env`
2. Check backend logs: `docker-compose logs backend`
3. Verify frontend can reach backend: `docker-compose exec frontend curl http://backend:4000`

### Build Failures

1. Clear Docker build cache: `docker-compose build --no-cache`
2. Check node_modules: Remove `node_modules` and `package-lock.json` before rebuild
3. Review build logs: `docker-compose build --progress=plain`

## Production Considerations

For production deployment:

1. **Update Database**: Change the `POSTGRES_*`, `DATABASE_URL`, and `DIRECT_URL` values in `backend/.env` if you are not using the local postgres container
2. **JWT Secret**: Change `JWT_SECRET` to a strong random value
3. **SMTP Configuration**: Update with your production email service
4. **Frontend URL**: Update `FRONTEND_URL` for production domain
5. **API URL**: Update `NEXT_PUBLIC_API_URL` to production domain
6. **SSL/TLS**: Configure SSL certificates in nginx.conf for HTTPS
7. **Environment**: Set `NODE_ENV=production` for backend

## Performance Tips

- Use bind mounts sparingly (they're slower on Docker Desktop)
- Consider using named volumes for database persistence
- Implement health checks in docker-compose.yml
- Use `.dockerignore` to exclude unnecessary files from builds

## Useful Commands

```bash
# View running containers
docker-compose ps

# Execute command in container
docker-compose exec backend sh
docker-compose exec frontend sh

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# View all images
docker images

# Remove unused images
docker image prune

# Inspect container
docker-compose logs SERVICE_NAME
docker inspect ecommerce-backend
```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Nginx (80/443)                   │
│              (Reverse Proxy & Router)               │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ┌────▼─────┐            ┌─────▼──────┐
   │ Frontend  │            │  Backend   │
   │ (3000)    │            │  (4000)    │
   └────┬──────┘            └─────┬──────┘
        │                         │
        └────────────────────┬────┘
                             │
                       ┌─────▼─────┐
                       │  Database  │
                       │ Postgres   │
                       └────────────┘
```

---

For more information, refer to:

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [NestJS Docker Guide](https://docs.nestjs.com/deployment/docker)
- [Next.js Docker Production](https://nextjs.org/docs/deployment/docker)
