# Step-by-Step Render Deployment Guide

Follow these steps to deploy TSG Logistics to Render.

## Prerequisites Checklist

- [x] Neon database created and schemas set up
- [x] GitHub repository pushed
- [x] Connection strings ready

## Step 1: Sign Up / Login to Render

1. Go to https://render.com
2. Sign up or log in (you can use GitHub to sign in)
3. Verify your email if required

## Step 2: Create Redis Instance

1. Click **"New +"** button (top right)
2. Select **"Redis"**
3. Configure:
   - **Name**: `tsg-redis`
   - **Plan**: Free (or Starter for production)
   - **Region**: Choose closest to your Neon database (Asia Pacific if using ap-southeast-1)
4. Click **"Create Redis"**
5. **Wait for it to start** (takes ~2 minutes)
6. **Copy the "Internal Redis URL"** - you'll need this later
   - It looks like: `redis://red-xxxxx:6379`

## Step 3: Deploy Services Using Blueprint (Easiest Method)

### Option A: Blueprint Deployment (Recommended)

1. Click **"New +"** → **"Blueprint"**
2. Connect your GitHub account if not already connected
3. Select repository: **`mridultyagi687/TSGLogistics`**
4. Render will detect `render.yaml`
5. Click **"Apply"**
6. Render will create all services automatically
7. **IMPORTANT**: You'll need to add environment variables manually (see Step 4)

### Option B: Manual Service Creation

If Blueprint doesn't work, create services manually (see Step 3B below)

## Step 4: Add Environment Variables

After services are created, add these environment variables to each service:

### 🔴 Orders Service (`tsg-orders-service`)

1. Go to the service in Render dashboard
2. Click **"Environment"** tab
3. Add these variables:

```
NODE_ENV = production
PORT = 4001
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=orders
```

4. Click **"Save Changes"**

### 🟢 Vendor Service (`tsg-vendor-service`)

```
NODE_ENV = production
PORT = 4002
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=vendors
```

### 🔵 Wallet Service (`tsg-wallet-service`)

```
NODE_ENV = production
PORT = 4003
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=wallet
```

### 🟡 API Gateway (`tsg-api-gateway`)

First, note the URLs of your services (they'll be like `https://tsg-orders-service.onrender.com`)

```
NODE_ENV = production
PORT = 4000
ORDERS_SERVICE_URL = https://tsg-orders-service.onrender.com
VENDOR_SERVICE_URL = https://tsg-vendor-service.onrender.com
WALLET_SERVICE_URL = https://tsg-wallet-service.onrender.com
CORS_ORIGINS = https://tsg-web.onrender.com
REDIS_URL = [Paste the Internal Redis URL from Step 2]
TELEMETRY_CHANNEL = telemetry:gateway:events
```

### 🟣 Web App (`tsg-web`)

Generate AUTH_SECRET first:
```bash
openssl rand -base64 32
```

Then add:
```
NODE_ENV = production
NEXT_PUBLIC_GATEWAY_URL = https://tsg-api-gateway.onrender.com
DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=auth
REDIS_URL = [Paste the Internal Redis URL from Step 2]
TELEMETRY_CHANNEL = telemetry:gateway:events
AUTH_SECRET = [Paste the generated secret]
```

## Step 5: Wait for Services to Deploy

1. Services will automatically start building
2. Watch the build logs for any errors
3. Each service takes ~5-10 minutes to build and deploy
4. **Wait for all services to show "Live" status**

## Step 6: Run Database Migrations

After services are deployed, run migrations:

### Orders Service Migration

1. Go to `tsg-orders-service` in Render
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

1. Go to `tsg-web`
2. Click **"Shell"** tab
3. Run the SQL from `apps/web/prisma/init.sql` in Neon SQL Editor (in the `auth` schema)

## Step 7: Update Service URLs

After all services are live, update URLs:

1. **API Gateway**: Update `CORS_ORIGINS` with your actual web app URL
2. **Web App**: Verify `NEXT_PUBLIC_GATEWAY_URL` points to your API Gateway URL

## Step 8: Test Your Deployment

1. Visit your web app: `https://tsg-web.onrender.com`
2. Try logging in
3. Test creating a load
4. Check all features work

## Step 3B: Manual Service Creation (If Blueprint Fails)

If you need to create services manually:

### Create Orders Service

1. **New +** → **"Web Service"**
2. Connect GitHub → Select `TSGLogistics` repo
3. Settings:
   - **Name**: `tsg-orders-service`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run prisma:generate --workspace services/orders-service && npm run build --workspace services/orders-service`
   - **Start Command**: `cd services/orders-service && npm run prisma:deploy && npm start`
   - **Root Directory**: (leave empty)
4. Add environment variables (from Step 4)
5. Click **"Create Web Service"**

### Create Vendor Service

Same as above, but:
- **Name**: `tsg-vendor-service`
- **Build Command**: `npm install && npm run prisma:generate --workspace services/vendor-service && npm run build --workspace services/vendor-service`
- **Start Command**: `cd services/vendor-service && npm run prisma:deploy && npm start`

### Create Wallet Service

Same as above, but:
- **Name**: `tsg-wallet-service`
- **Build Command**: `npm install && npm run prisma:generate --workspace services/wallet-service && npm run build --workspace services/wallet-service`
- **Start Command**: `cd services/wallet-service && npm run prisma:deploy && npm start`

### Create API Gateway

- **Name**: `tsg-api-gateway`
- **Build Command**: `npm install && npm run build --workspace services/api-gateway`
- **Start Command**: `cd services/api-gateway && npm start`

### Create Web App

- **Name**: `tsg-web`
- **Build Command**: `npm install && npm run build --workspace apps/web`
- **Start Command**: `cd apps/web && npm start`

## Troubleshooting

### Build Fails

- Check build logs for errors
- Verify Node.js version (should be 18+)
- Check if all dependencies install correctly

### Service Won't Start

- Check environment variables are set correctly
- Verify DATABASE_URL format
- Check service logs for errors

### Database Connection Errors

- Verify schema parameter in DATABASE_URL
- Check Neon database is accessible
- Verify SSL mode is set correctly

### CORS Errors

- Update CORS_ORIGINS in API Gateway
- Ensure URLs match exactly (no trailing slashes)

## Service URLs

After deployment, your services will be at:
- Web App: `https://tsg-web.onrender.com`
- API Gateway: `https://tsg-api-gateway.onrender.com`
- Orders: `https://tsg-orders-service.onrender.com`
- Vendor: `https://tsg-vendor-service.onrender.com`
- Wallet: `https://tsg-wallet-service.onrender.com`

## Next Steps After Deployment

1. ✅ Test all features
2. Set up custom domain (optional)
3. Configure monitoring
4. Set up backups
5. Enable auto-deploy from main branch

## Need Help?

- Check Render service logs
- Review build logs
- Check Neon database logs
- See `DEPLOYMENT.md` for detailed troubleshooting

