# Environment Variables Guide

Complete list of environment variables for GitHub Actions and Render deployment.

## 🔴 Render Environment Variables

Add these in your Render web service dashboard:

### Required Variables

```
NODE_ENV = production
```

### Database URLs (Neon)

```
ORDERS_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=orders

VENDOR_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=vendors

WALLET_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=wallet

WEB_DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=auth

DATABASE_URL = postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=auth
```

### Service Ports

```
ORDERS_PORT = 4001
VENDOR_PORT = 4002
WALLET_PORT = 4003
PORT = 4000
```

### API Gateway Configuration

```
ORDERS_SERVICE_URL = http://localhost:4001
VENDOR_SERVICE_URL = http://localhost:4002
WALLET_SERVICE_URL = http://localhost:4003
CORS_ORIGINS = https://tsg-logistics.onrender.com
TELEMETRY_CHANNEL = telemetry:gateway:events
```

### Web App Configuration

**First, generate AUTH_SECRET:**
```bash
openssl rand -base64 32
```

Then add:
```
NEXT_PUBLIC_GATEWAY_URL = http://localhost:4000
AUTH_SECRET = [paste your generated secret here]
TELEMETRY_CHANNEL = telemetry:gateway:events
```

## 📋 Complete Render Environment Variables (Copy-Paste Ready)

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
AUTH_SECRET=[GENERATE THIS: openssl rand -base64 32]
```

## 🔵 GitHub Secrets (Optional - for CI/CD)

If you want to use GitHub Actions for automated deployment, add these secrets:

### GitHub Repository Secrets

Go to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

#### Required for Auto-Deploy (Optional)

```
RENDER_API_KEY = [Get from Render Dashboard → Account Settings → API Keys]
RENDER_SERVICE_ID = [Get from your Render service → Settings → Service ID]
```

**Note**: These are only needed if you want GitHub Actions to automatically deploy to Render. You can skip this if deploying manually.

## 📝 Step-by-Step: Adding to Render

1. **Go to your Render service**: `tsg-logistics`
2. **Click "Environment"** tab
3. **Click "Add Environment Variable"** for each variable
4. **Copy-paste** the variable name and value
5. **Click "Save Changes"**
6. **Service will automatically restart** with new variables

## 📝 Step-by-Step: Adding to GitHub (Optional)

1. **Go to your GitHub repository**: `mridultyagi687/TSGLogistics`
2. **Click "Settings"** → **"Secrets and variables"** → **"Actions"**
3. **Click "New repository secret"**
4. **Add**:
   - Name: `RENDER_API_KEY`
   - Value: [Your Render API key]
5. **Add another secret**:
   - Name: `RENDER_SERVICE_ID`
   - Value: [Your Render service ID]

## 🔐 Security Notes

⚠️ **Important**:
- Never commit these values to Git (already in `.gitignore`)
- `AUTH_SECRET` should be unique and secure
- Database URLs contain passwords - keep them secret
- Rotate `AUTH_SECRET` if compromised

## ✅ Quick Checklist

### Render (Required)
- [ ] `NODE_ENV`
- [ ] `ORDERS_DATABASE_URL`
- [ ] `VENDOR_DATABASE_URL`
- [ ] `WALLET_DATABASE_URL`
- [ ] `WEB_DATABASE_URL`
- [ ] `DATABASE_URL`
- [ ] `ORDERS_PORT`, `VENDOR_PORT`, `WALLET_PORT`, `PORT`
- [ ] `ORDERS_SERVICE_URL`, `VENDOR_SERVICE_URL`, `WALLET_SERVICE_URL`
- [ ] `CORS_ORIGINS`
- [ ] `NEXT_PUBLIC_GATEWAY_URL`
- [ ] `AUTH_SECRET` (generate first!)
- [ ] `TELEMETRY_CHANNEL`

### GitHub (Optional - only for CI/CD)
- [ ] `RENDER_API_KEY` (if using auto-deploy)
- [ ] `RENDER_SERVICE_ID` (if using auto-deploy)

## 🚀 After Adding Variables

1. **Render will automatically restart** your service
2. **Check logs** to ensure services start correctly
3. **Run migrations** in Shell tab
4. **Test your app** at the Render URL

That's it! All environment variables are documented and ready to use. 🎉

