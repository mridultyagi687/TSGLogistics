# Single Web Service Deployment Guide

Deploy all services together in one Render web service.

## Quick Deploy Steps

### Step 1: Create Single Web Service in Render

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account (if not already)
4. Select repository: **`mridultyagi687/TSGLogistics`**
5. Configure:
   - **Name**: `tsg-logistics`
   - **Environment**: `Node`
   - **Region**: Choose closest to your database
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Build Command**: `npm install && npm run build:all`
   - **Start Command**: `npm run start:all`

### Step 2: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

#### Database URLs (one for each service)

```
ORDERS_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=orders

VENDOR_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=vendors

WALLET_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=wallet

WEB_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=auth
```

#### Service Ports

```
ORDERS_PORT = 4001
VENDOR_PORT = 4002
WALLET_PORT = 4003
PORT = 4000
```

#### API Gateway Configuration

```
ORDERS_SERVICE_URL = http://localhost:4001
VENDOR_SERVICE_URL = http://localhost:4002
WALLET_SERVICE_URL = http://localhost:4003
CORS_ORIGINS = https://tsg-logistics.onrender.com
TELEMETRY_CHANNEL = telemetry:gateway:events
```

#### Web App Configuration

Generate AUTH_SECRET first:
```bash
openssl rand -base64 32
```

Then add:
```
NEXT_PUBLIC_GATEWAY_URL = http://localhost:4000
AUTH_SECRET = [paste your generated secret]
```

#### General

```
NODE_ENV = production
```

### Step 3: Create Web Service

Click **"Create Web Service"**

### Step 4: Wait for Build and Deploy

- Build will take ~10-15 minutes (building all services)
- Watch build logs for any errors
- Wait for service to show "Live" status

### Step 5: Run Database Migrations

After service is live, go to **"Shell"** tab and run:

```bash
# Orders Service Migration
cd services/orders-service
npm run prisma:deploy

# Vendor Service Migration
cd ../vendor-service
npm run prisma:deploy

# Wallet Service Migration
cd ../wallet-service
npm run prisma:deploy
```

### Step 6: Set Up Auth Tables

1. Go to your Neon dashboard
2. Open SQL Editor
3. Switch to `auth` schema
4. Run the SQL from `apps/web/prisma/init.sql`

### Step 7: Test Your Application

Visit: `https://tsg-logistics.onrender.com`

## How It Works

All services run together in one process:
- **Orders Service**: Port 4001
- **Vendor Service**: Port 4002
- **Wallet Service**: Port 4003
- **API Gateway**: Port 4000 (main entry point)
- **Web App**: Port 3000 (Next.js)

The API Gateway proxies requests to the other services running on localhost.

## Environment Variables Summary

Copy-paste ready list:

```
NODE_ENV = production
ORDERS_PORT = 4001
VENDOR_PORT = 4002
WALLET_PORT = 4003
PORT = 4000
ORDERS_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=orders
VENDOR_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=vendors
WALLET_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=wallet
WEB_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=auth
ORDERS_SERVICE_URL = http://localhost:4001
VENDOR_SERVICE_URL = http://localhost:4002
WALLET_SERVICE_URL = http://localhost:4003
CORS_ORIGINS = https://tsg-logistics.onrender.com
TELEMETRY_CHANNEL = telemetry:gateway:events
NEXT_PUBLIC_GATEWAY_URL = http://localhost:4000
AUTH_SECRET = [generate with: openssl rand -base64 32]
```

## Troubleshooting

**Build fails?**
- Check build logs
- Verify Node.js 18+ is used
- Check if all dependencies install

**Service won't start?**
- Check all environment variables are set
- Verify DATABASE_URL formats
- Check service logs

**Port conflicts?**
- Verify ports are set correctly (4001, 4002, 4003, 4000)
- Check if services are starting on correct ports

**Database errors?**
- Verify schema parameters in DATABASE_URLs
- Check Neon database is accessible
- Run migrations in Shell tab

## Benefits of Single Web Service

✅ Simpler deployment (one service)
✅ Lower cost (one Render service)
✅ Easier to manage
✅ All services communicate via localhost

## Note

The web app will be accessible at the Render service URL. The API Gateway runs on port 4000 internally and proxies to other services.

That's it! One web service, all your microservices running together. 🚀

