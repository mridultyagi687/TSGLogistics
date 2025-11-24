# Simple Deployment Guide - Web Services Only

All services are web services - no Redis or other dependencies needed!

## Quick Deploy Steps

### Step 1: Deploy with Blueprint

1. Go to https://render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect GitHub → Select `TSGLogistics` repository
4. Click **"Apply"**
5. Render will create 5 web services automatically:
   - `tsg-api-gateway`
   - `tsg-orders-service`
   - `tsg-vendor-service`
   - `tsg-wallet-service`
   - `tsg-web`

### Step 2: Add Environment Variables

After services are created, add these to each service:

#### Orders Service (`tsg-orders-service`)
```
NODE_ENV = production
PORT = 4001
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=orders
```

#### Vendor Service (`tsg-vendor-service`)
```
NODE_ENV = production
PORT = 4002
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=vendors
```

#### Wallet Service (`tsg-wallet-service`)
```
NODE_ENV = production
PORT = 4003
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=wallet
```

#### API Gateway (`tsg-api-gateway`)

Wait for other services to get their URLs first, then add:
```
NODE_ENV = production
PORT = 4000
ORDERS_SERVICE_URL = https://tsg-orders-service.onrender.com
VENDOR_SERVICE_URL = https://tsg-vendor-service.onrender.com
WALLET_SERVICE_URL = https://tsg-wallet-service.onrender.com
CORS_ORIGINS = https://tsg-web.onrender.com
TELEMETRY_CHANNEL = telemetry:gateway:events
```

#### Web App (`tsg-web`)

Generate AUTH_SECRET:
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

### Step 3: Wait for Deployment

- Services will build automatically
- Watch build logs for any errors
- Wait for all services to show "Live" status (~10-15 minutes)

### Step 4: Run Database Migrations

After services are live, go to each service's **"Shell"** tab:

**Orders Service Shell:**
```bash
cd services/orders-service
npm run prisma:deploy
```

**Vendor Service Shell:**
```bash
cd services/vendor-service
npm run prisma:deploy
```

**Wallet Service Shell:**
```bash
cd services/wallet-service
npm run prisma:deploy
```

### Step 5: Test Your App

Visit: `https://tsg-web.onrender.com`

## What You Get

✅ 5 Web Services (all on Render)
✅ No Redis needed
✅ No additional dependencies
✅ Everything works!

## Service URLs

After deployment:
- Web App: `https://tsg-web.onrender.com`
- API Gateway: `https://tsg-api-gateway.onrender.com`
- Orders: `https://tsg-orders-service.onrender.com`
- Vendor: `https://tsg-vendor-service.onrender.com`
- Wallet: `https://tsg-wallet-service.onrender.com`

## Troubleshooting

**Build fails?**
- Check build logs
- Verify Node.js 18+ is used
- Check all dependencies install

**Service won't start?**
- Verify DATABASE_URL is correct
- Check environment variables are set
- Review service logs

**Database errors?**
- Verify schema parameter in DATABASE_URL
- Check Neon database is accessible
- Run migrations in Shell tab

That's it! Simple web services deployment. 🚀

