# Deploy Without Redis - Simplified Guide

**Good News**: Redis is optional! Your app will work perfectly without it. You'll just miss some telemetry features.

## Quick Deploy Steps (No Redis Needed)

### Step 1: Deploy Using Blueprint

1. Go to https://render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect GitHub → Select `TSGLogistics` repository
4. Click **"Apply"**
5. Render will create all services (it will skip Redis if not available)

### Step 2: Add Environment Variables

**IMPORTANT**: Don't add `REDIS_URL` - skip it entirely!

#### Orders Service
```
NODE_ENV = production
PORT = 4001
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=orders
```

#### Vendor Service
```
NODE_ENV = production
PORT = 4002
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=vendors
```

#### Wallet Service
```
NODE_ENV = production
PORT = 4003
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=wallet
```

#### API Gateway
```
NODE_ENV = production
PORT = 4000
ORDERS_SERVICE_URL = https://tsg-orders-service.onrender.com
VENDOR_SERVICE_URL = https://tsg-vendor-service.onrender.com
WALLET_SERVICE_URL = https://tsg-wallet-service.onrender.com
CORS_ORIGINS = https://tsg-web.onrender.com
TELEMETRY_CHANNEL = telemetry:gateway:events
```
**Note**: No REDIS_URL needed!

#### Web App
First generate AUTH_SECRET:
```bash
openssl rand -base64 32
```

Then add:
```
NODE_ENV = production
NEXT_PUBLIC_GATEWAY_URL = https://tsg-api-gateway.onrender.com
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=auth
TELEMETRY_CHANNEL = telemetry:gateway:events
AUTH_SECRET = [paste your generated secret]
```
**Note**: No REDIS_URL needed!

### Step 3: Wait for Deployment

- Services will build automatically
- Wait for all to show "Live" status (~10-15 minutes)

### Step 4: Run Migrations

In each service's Shell tab:

**Orders:**
```bash
cd services/orders-service && npm run prisma:deploy
```

**Vendor:**
```bash
cd services/vendor-service && npm run prisma:deploy
```

**Wallet:**
```bash
cd services/wallet-service && npm run prisma:deploy
```

### Step 5: Test

Visit: `https://tsg-web.onrender.com`

## What You'll Miss Without Redis

- Real-time telemetry streaming (not critical)
- Some caching (app will work, just slightly slower)

## Everything Else Works!

✅ Authentication
✅ Creating loads
✅ Managing vendors
✅ Wallet operations
✅ All core features

## Add Redis Later (Optional)

If you want Redis later, you can:
1. Use **Upstash** (free Redis): https://upstash.com
2. Or wait until Render adds Redis support

For now, **just skip Redis and deploy!** 🚀

