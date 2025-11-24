# Deployment Guide: TSG Logistics to Neon + Render + GitHub

This guide walks you through deploying the TSG Logistics application to production using:
- **Neon**: Serverless PostgreSQL database
- **Render**: Hosting platform for services and web app
- **GitHub**: Source code repository

## Prerequisites

1. GitHub account with the repository pushed
2. Neon account (free tier available at https://neon.tech)
3. Render account (free tier available at https://render.com)
4. Node.js 18+ installed locally (for testing)

## Step 1: Set Up Neon Database

### 1.1 Create Neon Account and Project

1. Go to https://neon.tech and sign up/login
2. Click "Create Project"
3. Name it `tsg-logistics` (or your preferred name)
4. Select a region closest to your users
5. Choose PostgreSQL version (14+ recommended)
6. Click "Create Project"

### 1.2 Get Database Connection Strings

1. In your Neon dashboard, go to your project
2. Click on "Connection Details"
3. You'll see connection strings for:
   - **Direct connection** (for local development)
   - **Pooled connection** (for production - recommended)

4. Copy the connection string. It will look like:
   ```
   postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### 1.3 Create Database Schemas

Connect to your Neon database and create the required schemas:

```sql
-- Connect using Neon's SQL editor or psql
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS vendors;
CREATE SCHEMA IF NOT EXISTS wallet;
CREATE SCHEMA IF NOT EXISTS auth;
```

### 1.4 Update Connection Strings for Each Service

For each service, you'll need a connection string with the appropriate schema:

- **Orders Service**: Add `?schema=orders` or `&schema=orders` to the connection string
- **Vendor Service**: Add `?schema=vendors` or `&schema=vendors`
- **Wallet Service**: Add `?schema=wallet` or `&schema=wallet`
- **Web App (Auth)**: Add `?schema=auth` or `&schema=auth`

Example:
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require&schema=orders
```

## Step 2: Set Up Render Services

### 2.1 Connect GitHub Repository

1. Go to https://render.com and sign up/login
2. Click "New +" → "Blueprint"
3. Connect your GitHub account
4. Select the `TSGLogistics` repository
5. Render will detect the `render.yaml` file

### 2.2 Configure Services in Render Dashboard

Alternatively, you can create services manually:

#### A. Create Redis Instance

1. Click "New +" → "Redis"
2. Name: `tsg-redis`
3. Plan: Free (or Starter for production)
4. Region: Choose closest to your database
5. Click "Create Redis"

#### B. Create Orders Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Settings:
   - **Name**: `tsg-orders-service`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run prisma:generate --workspace services/orders-service && npm run build --workspace services/orders-service`
   - **Start Command**: `cd services/orders-service && npm run prisma:deploy && npm start`
   - **Root Directory**: Leave empty (root of repo)

4. Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `4001`
   - `DATABASE_URL` = (Your Neon connection string with `?schema=orders`)

5. Click "Create Web Service"

#### C. Create Vendor Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Settings:
   - **Name**: `tsg-vendor-service`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run prisma:generate --workspace services/vendor-service && npm run build --workspace services/vendor-service`
   - **Start Command**: `cd services/vendor-service && npm run prisma:deploy && npm start`

4. Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `4002`
   - `DATABASE_URL` = (Your Neon connection string with `?schema=vendors`)

#### D. Create Wallet Service

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Settings:
   - **Name**: `tsg-wallet-service`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run prisma:generate --workspace services/wallet-service && npm run build --workspace services/wallet-service`
   - **Start Command**: `cd services/wallet-service && npm run prisma:deploy && npm start`

4. Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `4003`
   - `DATABASE_URL` = (Your Neon connection string with `?schema=wallet`)

#### E. Create API Gateway

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Settings:
   - **Name**: `tsg-api-gateway`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build --workspace services/api-gateway`
   - **Start Command**: `cd services/api-gateway && npm start`

4. Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `4000`
   - `ORDERS_SERVICE_URL` = `https://tsg-orders-service.onrender.com` (or your service URL)
   - `VENDOR_SERVICE_URL` = `https://tsg-vendor-service.onrender.com`
   - `WALLET_SERVICE_URL` = `https://tsg-wallet-service.onrender.com`
   - `CORS_ORIGINS` = `https://tsg-web.onrender.com` (will be set after web app is created)
   - `REDIS_URL` = (Get from Redis service → "Internal Redis URL")
   - `TELEMETRY_CHANNEL` = `telemetry:gateway:events`

#### F. Create Web Application

1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Settings:
   - **Name**: `tsg-web`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build --workspace apps/web`
   - **Start Command**: `cd apps/web && npm start`

4. Environment Variables:
   - `NODE_ENV` = `production`
   - `NEXT_PUBLIC_GATEWAY_URL` = `https://tsg-api-gateway.onrender.com`
   - `DATABASE_URL` = (Your Neon connection string with `?schema=auth`)
   - `REDIS_URL` = (Get from Redis service → "Internal Redis URL")
   - `TELEMETRY_CHANNEL` = `telemetry:gateway:events`
   - `AUTH_SECRET` = (Generate with: `openssl rand -base64 32`)

5. Click "Create Web Service"

### 2.3 Update Service URLs

After all services are created, update the environment variables:

1. **API Gateway**: Update `CORS_ORIGINS` with your web app URL
2. **Web App**: Update `NEXT_PUBLIC_GATEWAY_URL` with your API Gateway URL

## Step 3: Run Database Migrations

### 3.1 Orders Service Migrations

1. Go to Orders Service in Render
2. Open "Shell" tab
3. Run:
   ```bash
   cd services/orders-service
   npm run prisma:migrate
   ```

### 3.2 Vendor Service Migrations

1. Go to Vendor Service in Render
2. Open "Shell" tab
3. Run:
   ```bash
   cd services/vendor-service
   npm run prisma:migrate
   ```

### 3.3 Wallet Service Migrations

1. Go to Wallet Service in Render
2. Open "Shell" tab
3. Run:
   ```bash
   cd services/wallet-service
   npm run prisma:migrate
   ```

### 3.4 Web App Database Setup

1. Go to Web App in Render
2. Open "Shell" tab
3. Run the SQL from `apps/web/prisma/init.sql` to create auth tables

## Step 4: Verify Deployment

### 4.1 Check Service Health

Visit each service's health endpoint:
- API Gateway: `https://tsg-api-gateway.onrender.com/health`
- Orders Service: `https://tsg-orders-service.onrender.com/health`
- Vendor Service: `https://tsg-vendor-service.onrender.com/health`
- Wallet Service: `https://tsg-wallet-service.onrender.com/health`

### 4.2 Test Web Application

1. Visit your web app URL: `https://tsg-web.onrender.com`
2. Try logging in with default credentials
3. Test creating a load
4. Verify all features work

## Step 5: Set Up Custom Domain (Optional)

1. In Render, go to your web service
2. Click "Settings" → "Custom Domain"
3. Add your domain
4. Update DNS records as instructed
5. Update `CORS_ORIGINS` in API Gateway with your custom domain

## Step 6: Set Up GitHub Actions (Optional)

### 6.1 Get Render API Key

1. Go to Render Dashboard → Account Settings → API Keys
2. Create a new API key
3. Copy the key

### 6.2 Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add secrets:
   - `RENDER_API_KEY`: Your Render API key
   - `RENDER_SERVICE_ID`: Your service ID (found in service settings)

### 6.3 Enable Auto-Deploy

1. In Render, go to each service
2. Settings → "Auto-Deploy"
3. Enable "Auto-Deploy" for the `main` branch

## Troubleshooting

### Services Not Starting

1. Check build logs in Render
2. Verify all environment variables are set
3. Check database connection strings
4. Verify Prisma client is generated

### Database Connection Issues

1. Verify Neon connection string is correct
2. Check if SSL mode is required (add `?sslmode=require`)
3. Verify schema names match
4. Check Neon dashboard for connection limits

### CORS Errors

1. Verify `CORS_ORIGINS` includes your web app URL
2. Check API Gateway logs
3. Ensure URLs don't have trailing slashes

### Prisma Migration Issues

1. Run migrations manually in Render Shell
2. Check database schema exists
3. Verify connection string has correct schema parameter

## Cost Estimation (Free Tier)

- **Neon**: Free tier includes 0.5 GB storage, 1 project
- **Render**: Free tier includes:
  - 750 hours/month per service
  - Services sleep after 15 minutes of inactivity
  - Redis: 25 MB free
- **Total**: Free for development/testing

For production, consider:
- Render Starter plan: $7/month per service
- Neon Pro plan: $19/month for better performance

## Support

For issues:
1. Check Render service logs
2. Check Neon database logs
3. Review GitHub Actions logs (if enabled)
4. Check application logs in Render

## Next Steps

1. Set up monitoring (Render provides basic monitoring)
2. Configure backups in Neon
3. Set up staging environment
4. Configure CI/CD pipelines
5. Add error tracking (Sentry, etc.)

