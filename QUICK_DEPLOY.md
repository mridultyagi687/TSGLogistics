# Quick Deploy Guide

## 🚀 Fast Track Deployment (15 minutes)

### Step 1: Neon Database (5 min)

1. **Sign up**: https://neon.tech
2. **Create project**: Name it `tsg-logistics`
3. **Copy connection string** from dashboard
4. **Run setup script**:
   ```bash
   export DATABASE_URL="your-neon-connection-string"
   bash scripts/setup-neon-db.sh
   ```

### Step 2: Render Services (10 min)

#### Option A: Using Blueprint (Easiest)

1. **Sign up**: https://render.com
2. **New +** → **Blueprint**
3. **Connect GitHub** → Select `TSGLogistics` repo
4. **Render will auto-detect** `render.yaml`
5. **Add environment variables**:
   - For each service, add `DATABASE_URL` with appropriate schema
   - Get Redis URL from Redis service
   - Generate `AUTH_SECRET`: `bash scripts/generate-env-secrets.sh`

#### Option B: Manual Setup

1. **Create Redis**: New + → Redis → Name: `tsg-redis`
2. **Create each service** using the settings from `DEPLOYMENT.md`
3. **Add environment variables** from `env.production.example`

### Step 3: Run Migrations

In each service's Render Shell:

```bash
# Orders Service
cd services/orders-service
npm run prisma:deploy

# Vendor Service  
cd services/vendor-service
npm run prisma:deploy

# Wallet Service
cd services/wallet-service
npm run prisma:deploy
```

### Step 4: Test

1. Visit your web app: `https://tsg-web.onrender.com`
2. Login with default credentials
3. Test creating a load

## 📋 Environment Variables Checklist

Copy these to each Render service:

### API Gateway
- [ ] `ORDERS_SERVICE_URL`
- [ ] `VENDOR_SERVICE_URL`
- [ ] `WALLET_SERVICE_URL`
- [ ] `REDIS_URL`
- [ ] `CORS_ORIGINS`

### Orders Service
- [ ] `DATABASE_URL` (with `?schema=orders`)

### Vendor Service
- [ ] `DATABASE_URL` (with `?schema=vendors`)

### Wallet Service
- [ ] `DATABASE_URL` (with `?schema=wallet`)

### Web App
- [ ] `NEXT_PUBLIC_GATEWAY_URL`
- [ ] `DATABASE_URL` (with `?schema=auth`)
- [ ] `REDIS_URL`
- [ ] `AUTH_SECRET`

## ⚡ Common Issues

**Services not starting?**
- Check build logs
- Verify all env vars are set
- Check database connection

**Database errors?**
- Verify schema parameter in DATABASE_URL
- Check Neon connection string format
- Run migrations manually

**CORS errors?**
- Update `CORS_ORIGINS` in API Gateway
- Ensure no trailing slashes in URLs

## 📚 Full Documentation

See `DEPLOYMENT.md` for detailed instructions.

