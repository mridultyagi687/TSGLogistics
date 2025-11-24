# Single Web Service Deployment Guide

Deploy all services together in **ONE** Render web service.

## 🚀 Quick Deploy Steps

### Step 1: Create Single Web Service

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub → Select `TSGLogistics` repository
4. Configure:
   - **Name**: `tsg-logistics`
   - **Environment**: `Node`
   - **Branch**: `main`
   - **Root Directory**: (leave empty)
   - **Build Command**: `npm install && npm run build:all`
   - **Start Command**: `npm run start:all`

### Step 2: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add ALL of these:

#### Database URLs (one for each service)

```
ORDERS_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=orders

VENDOR_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=vendors

WALLET_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=wallet

WEB_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=auth

DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=auth
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

Generate AUTH_SECRET:
```bash
openssl rand -base64 32
```

Then add:
```
NEXT_PUBLIC_GATEWAY_URL = http://localhost:4000
AUTH_SECRET = [paste your generated secret]
TELEMETRY_CHANNEL = telemetry:gateway:events
```

#### General

```
NODE_ENV = production
```

### Step 3: Create Web Service

Click **"Create Web Service"**

### Step 4: Wait for Build and Deploy

- Build takes ~10-15 minutes (building all 5 services)
- Watch build logs
- Wait for "Live" status

### Step 5: Run Database Migrations

After service is live, go to **"Shell"** tab:

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

1. Go to Neon dashboard → SQL Editor
2. Switch to `auth` schema
3. Run SQL from `apps/web/prisma/init.sql`

### Step 7: Test

Visit: `https://tsg-logistics.onrender.com`

## 📋 Complete Environment Variables List

Copy-paste this entire list into Render:

```
NODE_ENV=production
ORDERS_PORT=4001
VENDOR_PORT=4002
WALLET_PORT=4003
PORT=4000
ORDERS_DATABASE_URL=postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=orders
VENDOR_DATABASE_URL=postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=vendors
WALLET_DATABASE_URL=postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=wallet
WEB_DATABASE_URL=postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=auth
DATABASE_URL=postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=auth
ORDERS_SERVICE_URL=http://localhost:4001
VENDOR_SERVICE_URL=http://localhost:4002
WALLET_SERVICE_URL=http://localhost:4003
CORS_ORIGINS=https://tsg-logistics.onrender.com
TELEMETRY_CHANNEL=telemetry:gateway:events
NEXT_PUBLIC_GATEWAY_URL=http://localhost:4000
AUTH_SECRET=[generate with: openssl rand -base64 32]
```

## 🔧 How It Works

All services run in one process:
- **Orders Service**: `localhost:4001`
- **Vendor Service**: `localhost:4002`
- **Wallet Service**: `localhost:4003`
- **API Gateway**: `localhost:4000`
- **Web App (Next.js)**: Main port (exposed by Render)

Next.js is the entry point users access. It makes API calls to `localhost:4000` (gateway), which routes to other services.

## ⚠️ Important Notes

1. **Next.js runs on Render's PORT** (automatically assigned)
2. **Other services run on localhost** (not exposed externally)
3. **All services share the same process** (using `concurrently`)
4. **One service = One cost** (much cheaper!)

## 🐛 Troubleshooting

**Build fails?**
- Check build logs
- Verify Node.js 18+
- Check all dependencies install

**Service won't start?**
- Verify all environment variables are set
- Check DATABASE_URL formats
- Review service logs

**Port conflicts?**
- Verify ports: 4001, 4002, 4003, 4000
- Next.js uses Render's PORT automatically

**Database errors?**
- Verify schema parameters in DATABASE_URLs
- Check Neon database is accessible
- Run migrations in Shell tab

That's it! One web service, all your microservices running together. 🚀
