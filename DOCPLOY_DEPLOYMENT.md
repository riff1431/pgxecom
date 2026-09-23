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
   FRONTEND_URL=https://playgroundfitnex.com,https://api.playgroundfitnex.com
   UPLOAD_DIR=./uploads
   MAX_FILE_SIZE=5242880
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   MAIL_FROM="PGX Fitness <your-email@gmail.com>"

   # Supabase Bridge & Wallet (Same project as adult site)
   NEXT_PUBLIC_SUPABASE_URL=https://traqtwdfhxduijhqsuwg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe Production / Test Integration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   STRIPE_CURRENCY=eur
   ```
6. **Domain**:
   - Set your backend domain: `api.playgroundfitnex.com`. Docploy will issue an SSL certificate via Let's Encrypt.
7. Click **Deploy**.

---

## 3. Setting Up the Frontend Container in Docploy

In your Docploy Dashboard:

1. Click **Create Application**.
2. Select the same Git Repository (`e-commerce-full-stack`).
3. **Configuration**:
   - **Source Type**: Git Repository
   - **Branch**: `main` (or your active branch)
   - **Root Directory**: `./frontend`
   - **Build Type**: `Dockerfile` (Docploy will detect `./frontend/Dockerfile`)
   - **Port**: `3000`
4. **Build Arguments & Environment Variables**:
   > [!IMPORTANT]
   > Next.js bundles all `NEXT_PUBLIC_*` variables during compilation. You **must** set these in the **Build Args** and **Environment Variables** section in Docploy before hitting deploy:

   ```env
   NEXT_PUBLIC_API_URL=https://api.playgroundfitnex.com/api
   NEXT_PUBLIC_IMAGE_BASE_URL=https://api.playgroundfitnex.com
   NEXT_PUBLIC_STORE_NAME=PGX
   NEXT_PUBLIC_WHATSAPP_NUMBER=+18005550199
   NEXT_PUBLIC_SITE_URL=https://playgroundfitnex.com
   NODE_ENV=production
   PORT=3000
   HOSTNAME=0.0.0.0
   NEXT_TELEMETRY_DISABLED=1

   # Supabase Bridge & Wallet
   NEXT_PUBLIC_SUPABASE_URL=https://traqtwdfhxduijhqsuwg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Stripe Client Key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
   ```
5. **Domain**:
   - Set your frontend domain: `playgroundfitnex.com`.
6. Click **Deploy**.

---

## 4. Setting Up Stripe Webhook for Production

The e-commerce backend processes wallet top-ups exclusively via Stripe Webhook (`checkout.session.completed`) to guarantee tamper-proof balance updates.

### Steps in the Stripe Dashboard:
1. Log in to the [Stripe Dashboard](https://dashboard.stripe.com/).
2. Toggle between **Test mode** or **Live mode** depending on your deployment stage.
3. In the left navigation, go to **Developers** ➔ **Webhooks** (or visit [stripe.com/docs/webhooks](https://dashboard.stripe.com/webhooks)).
4. Click **Add destination** (or **Add endpoint**).
5. Configure the endpoint:
   - **Endpoint URL**: 
     ```
     https://api.playgroundfitnex.com/api/webhook/stripe
     ```
     *(Note: Ensure `/api/` is included because the NestJS backend uses global prefix `api`)*
   - **Listen to**: Select **Events on your account**.
   - **Select events to listen to**: 
     - Click **Select events**
     - Search and check: `checkout.session.completed`
6. Click **Add endpoint**.
7. Under the newly created webhook, find the **Signing secret** section.
8. Click **Reveal** to copy the signing secret (starts with `whsec_...`).
9. In Docploy:
   - Go to your **Backend Container** ➔ **Environment**.
   - Set `STRIPE_WEBHOOK_SECRET=whsec_...`.
   - Redeploy or restart the backend container so it uses the new secret.

---

## 5. Verification & Testing

Once both containers report healthy in Docploy:

1. **Test API**:
   - Navigate to `https://api.playgroundfitnex.com/api/categories/tree`.
   - Verify that the JSON response returns the PGX fitness categories.
   - Verify asset serving: `https://api.playgroundfitnex.com/uploads/placeholder-product.jpg`
2. **Test Frontend**:
   - Open `https://playgroundfitnex.com`.
   - Verify that the dark luxury PGX storefront loads with Euro (`€`) pricing, products, bundles, and product images.
3. **Test Wallet Top-Up & Stripe Webhook**:
   - Log in or register an account at `https://playgroundfitnex.com`.
   - Go to `https://playgroundfitnex.com/my-account/wallet`.
   - Click a preset amount (min €25) and click **Proceed to Checkout**.
   - Complete the Stripe payment.
   - Check the Stripe Dashboard ➔ **Webhooks** tab: the `checkout.session.completed` event should return HTTP `200 OK`.
   - Refresh the wallet page on `https://playgroundfitnex.com` or check the adult platform to confirm both share the updated balance!
4. **Test Admin Portal**:
   - Navigate to `https://playgroundfitnex.com/admin`.
   - Log in with `admin@store.com` and password `admin123`.
