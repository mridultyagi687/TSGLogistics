# Manual Web Service Deployment Guide

Step-by-step guide to manually create each web service in Render.

## Step 1: Create Orders Service

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account (if not already connected)
4. Select repository: **`mridultyagi687/TSGLogistics`**
5. Configure:
   - **Name**: `tsg-orders-service`
   - **Environment**: `Node`
   - **Region**: Choose closest to your database
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Build Command**: `npm install && npm run prisma:generate --workspace services/orders-service && npm run build --workspace services/orders-service`
   - **Start Command**: `cd services/orders-service && npm run prisma:deploy && npm start`
6. Click **"Advanced"** → **"Add Environment Variable"**
7. Add these variables:
   ```
   NODE_ENV = production
   PORT = 4001
   DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=orders
   ```
8. Click **"Create Web Service"**
9. Wait for it to deploy (~5-10 minutes)
10. **Copy the service URL** (e.g., `https://tsg-orders-service.onrender.com`)

## Step 2: Create Vendor Service

1. Click **"New +"** → **"Web Service"**
2. Select repository: **`mridultyagi687/TSGLogistics`**
3. Configure:
   - **Name**: `tsg-vendor-service`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Build Command**: `npm install && npm run prisma:generate --workspace services/vendor-service && npm run build --workspace services/vendor-service`
   - **Start Command**: `cd services/vendor-service && npm run prisma:deploy && npm start`
4. Add Environment Variables:
   ```
   NODE_ENV = production
   PORT = 4002
   DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=vendors
   ```
5. Click **"Create Web Service"**
6. Wait for deployment
7. **Copy the service URL** (e.g., `https://tsg-vendor-service.onrender.com`)

## Step 3: Create Wallet Service

1. Click **"New +"** → **"Web Service"**
2. Select repository: **`mridultyagi687/TSGLogistics`**
3. Configure:
   - **Name**: `tsg-wallet-service`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Build Command**: `npm install && npm run prisma:generate --workspace services/wallet-service && npm run build --workspace services/wallet-service`
   - **Start Command**: `cd services/wallet-service && npm run prisma:deploy && npm start`
4. Add Environment Variables:
   ```
   NODE_ENV = production
   PORT = 4003
   DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=wallet
   ```
5. Click **"Create Web Service"**
6. Wait for deployment
7. **Copy the service URL** (e.g., `https://tsg-wallet-service.onrender.com`)

## Step 4: Create API Gateway

1. Click **"New +"** → **"Web Service"**
2. Select repository: **`mridultyagi687/TSGLogistics`**
3. Configure:
   - **Name**: `tsg-api-gateway`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Build Command**: `npm install && npm run build --workspace services/api-gateway`
   - **Start Command**: `cd services/api-gateway && npm start`
4. Add Environment Variables (use the URLs from steps 1-3):
   ```
   NODE_ENV = production
   PORT = 4000
   ORDERS_SERVICE_URL = https://tsg-orders-service.onrender.com
   VENDOR_SERVICE_URL = https://tsg-vendor-service.onrender.com
   WALLET_SERVICE_URL = https://tsg-wallet-service.onrender.com
   CORS_ORIGINS = https://tsg-web.onrender.com
   TELEMETRY_CHANNEL = telemetry:gateway:events
   ```
5. Click **"Create Web Service"**
6. Wait for deployment
7. **Copy the service URL** (e.g., `https://tsg-api-gateway.onrender.com`)

## Step 5: Create Web Application

1. Click **"New +"** → **"Web Service"**
2. Select repository: **`mridultyagi687/TSGLogistics`**
3. Configure:
   - **Name**: `tsg-web`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Build Command**: `npm install && npm run build --workspace apps/web`
   - **Start Command**: `cd apps/web && npm start`
4. Generate AUTH_SECRET first:
   ```bash
   openssl rand -base64 32
   ```
5. Add Environment Variables (use API Gateway URL from step 4):
   ```
   NODE_ENV = production
   NEXT_PUBLIC_GATEWAY_URL = https://tsg-api-gateway.onrender.com
   DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=auth
   TELEMETRY_CHANNEL = telemetry:gateway:events
   AUTH_SECRET = [paste your generated secret]
   ```
6. Click **"Create Web Service"**
7. Wait for deployment
8. **Copy the service URL** (e.g., `https://tsg-web.onrender.com`)

## Step 6: Update Service URLs

After all services are deployed:

1. **Update API Gateway**:
   - Go to `tsg-api-gateway` service
   - Click **"Environment"** tab
   - Update `CORS_ORIGINS` to: `https://tsg-web.onrender.com` (your actual web app URL)

2. **Update Web App** (if needed):
   - Go to `tsg-web` service
   - Click **"Environment"** tab
   - Verify `NEXT_PUBLIC_GATEWAY_URL` is correct

## Step 7: Run Database Migrations

After all services are live, run migrations:

### Orders Service Migration

1. Go to `tsg-orders-service`
2. Click **"Shell"** tab
3. Run:
   ```bash
   cd services/orders-service
   npm run prisma:deploy
   ```

### Vendor Service Migration

1. Go to `tsg-vendor-service`
2. Click **"Shell"** tab
3. Run:
   ```bash
   cd services/vendor-service
   npm run prisma:deploy
   ```

### Wallet Service Migration

1. Go to `tsg-wallet-service`
2. Click **"Shell"** tab
3. Run:
   ```bash
   cd services/wallet-service
   npm run prisma:deploy
   ```

### Web App Auth Tables

1. Go to your Neon dashboard
2. Open SQL Editor
3. Switch to `auth` schema
4. Run the SQL from `apps/web/prisma/init.sql`

## Step 8: Test Your Application

1. Visit your web app: `https://tsg-web.onrender.com`
2. Try logging in
3. Test creating a load
4. Verify all features work

## Quick Reference: All Environment Variables

### Orders Service
```
NODE_ENV = production
PORT = 4001
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=orders
```

### Vendor Service
```
NODE_ENV = production
PORT = 4002
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=vendors
```

### Wallet Service
```
NODE_ENV = production
PORT = 4003
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=wallet
```

### API Gateway
```
NODE_ENV = production
PORT = 4000
ORDERS_SERVICE_URL = https://tsg-orders-service.onrender.com
VENDOR_SERVICE_URL = https://tsg-vendor-service.onrender.com
WALLET_SERVICE_URL = https://tsg-wallet-service.onrender.com
CORS_ORIGINS = https://tsg-web.onrender.com
TELEMETRY_CHANNEL = telemetry:gateway:events
```

### Web App
```
NODE_ENV = production
NEXT_PUBLIC_GATEWAY_URL = https://tsg-api-gateway.onrender.com
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=auth
TELEMETRY_CHANNEL = telemetry:gateway:events
AUTH_SECRET = [generate with: openssl rand -base64 32]
```

## Troubleshooting

**Build fails?**
- Check build logs in Render
- Verify Node.js version (should be 18+)
- Check if all dependencies install

**Service won't start?**
- Check environment variables are set correctly
- Verify DATABASE_URL format
- Check service logs

**Database connection errors?**
- Verify schema parameter in DATABASE_URL
- Check Neon database is accessible
- Run migrations in Shell tab

**CORS errors?**
- Update CORS_ORIGINS in API Gateway
- Ensure URLs match exactly (no trailing slashes)

## Service Order

Create services in this order:
1. ✅ Orders Service
2. ✅ Vendor Service  
3. ✅ Wallet Service
4. ✅ API Gateway (needs URLs from 1-3)
5. ✅ Web App (needs API Gateway URL)

That's it! You now have all 5 web services deployed manually. 🚀

