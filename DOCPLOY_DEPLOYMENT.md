# Docploy Production Deployment Guide

This guide details how to deploy this repository on [Docploy](https://docploy.com/) as **two independent containers**:
1. **Backend Container** (NestJS API on port 4000 with persistent volume for `/app/uploads`)
2. **Frontend Container** (Next.js 16 Standalone on port 3000)
3. **Database** (Already hosted and seeded on remote PostgreSQL at `72.62.81.204:5432`)

---

## 1. Prerequisites & Remote Database Status

Your remote PostgreSQL database has already been migrated and seeded with:
- `DATABASE_URL`: `postgresql://postgres:zmBjwrBiwYgdF30sodkI@72.62.81.204:5432/postgres?schema=public`
- **PGX International Fitness Catalog**: 18 products, premium bundles, categories, and international shipping zones.
- **Admin Account**: `admin@store.com` / `admin123`

---

## 2. Setting Up the Backend Container in Docploy

In your Docploy Dashboard:

1. Click **Create Application**.
2. Select your Git Provider / Repository (`e-commerce-full-stack`).
3. **Configuration**:
   - **Source Type**: Git Repository
   - **Branch**: `main` (or your active branch)
   - **Root Directory**: `./backend`
   - **Build Type**: `Dockerfile` (Docploy will automatically detect `./backend/Dockerfile`)
   - **Port**: `4000`
4. **Persistent Volumes** (under Mounts / Volumes):
   - **Host Path or Volume Name**: `pgx-backend-uploads`
   - **Mount Path**: `/app/uploads`
   *(This ensures product images and athlete profile avatars persist across redeployments)*
5. **Environment Variables**:
   Add the following under the Application's **Environment** tab:
   ```env
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=postgresql://postgres:zmBjwrBiwYgdF30sodkI@72.62.81.204:5432/postgres?schema=public
   DIRECT_URL=postgresql://postgres:zmBjwrBiwYgdF30sodkI@72.62.81.204:5432/postgres?schema=public
   JWT_SECRET=pgx-super-secret-jwt-key-change-in-production-2026
   JWT_EXPIRATION=7d
   FRONTEND_URL=https://nowripple.com,https://api.nowripple.com
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=5242880
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   MAIL_FROM="PGX Fitness <your-email@gmail.com>"
   ```
6. **Domain**:
   - Set your backend domain (e.g., `api.yourdomain.com`). Docploy will issue an SSL certificate via Let's Encrypt.
7. Click **Deploy**.

---

## 3. Setting Up the Frontend Container in Docploy

In your Docploy Dashboard:

1. Click **Create Application**.
2. Select the same Git Repository (`e-commerce-full-stack`).
3. **Configuration**:
   - **Source Type**: Git Repository
   - **Branch**: `main`
   - **Root Directory**: `./frontend`
   - **Build Type**: `Dockerfile` (Docploy will detect `./frontend/Dockerfile`)
   - **Port**: `3000`
4. **Build Arguments & Environment Variables**:
   > [!IMPORTANT]
   > Next.js bundles all `NEXT_PUBLIC_*` variables during compilation. You **must** set these in the **Build Args** and **Environment Variables** section in Docploy before hitting deploy:

   ```env
   NEXT_PUBLIC_API_URL=https://api.nowripple.com/api
   NEXT_PUBLIC_IMAGE_BASE_URL=https://api.nowripple.com
   NEXT_PUBLIC_STORE_NAME=PGX
   NEXT_PUBLIC_WHATSAPP_NUMBER=+18005550199
   NEXT_PUBLIC_SITE_URL=https://nowripple.com
   NODE_ENV=production
   PORT=3000
   HOSTNAME=0.0.0.0
   NEXT_TELEMETRY_DISABLED=1
   ```
5. **Domain**:
   - Set your frontend domain (e.g., `yourdomain.com`).
6. Click **Deploy**.

---

## 4. Verification & Testing

Once both containers report healthy in Docploy:

1. **Test API**:
   - Navigate to `https://api.yourdomain.com/api` (or `/api/categories/tree`).
   - You should see the JSON list of PGX categories.
   - Test asset serving: `https://api.yourdomain.com/uploads/placeholder-product.jpg`
2. **Test Frontend**:
   - Open `https://yourdomain.com`.
   - Verify that the dark luxury PGX storefront loads with Euro (`€`) pricing, products, bundles, and product images.
3. **Test Admin Portal**:
   - Navigate to `https://yourdomain.com/admin`.
   - Log in with `admin@store.com` and password `admin123`.
