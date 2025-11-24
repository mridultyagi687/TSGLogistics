# Neon Database Setup for TSG Logistics

## Your Neon Connection String

```
postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Step 1: Create Database Schemas

### Option A: Using Neon SQL Editor (Recommended)

1. Go to your Neon dashboard: https://console.neon.tech
2. Select your project
3. Click on "SQL Editor"
4. Run this SQL:

```sql
-- Create required schemas
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS vendors;
CREATE SCHEMA IF NOT EXISTS wallet;
CREATE SCHEMA IF NOT EXISTS auth;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA orders TO neondb_owner;
GRANT ALL PRIVILEGES ON SCHEMA vendors TO neondb_owner;
GRANT ALL PRIVILEGES ON SCHEMA wallet TO neondb_owner;
GRANT ALL PRIVILEGES ON SCHEMA auth TO neondb_owner;
```

### Option B: Using Setup Script

```bash
export DATABASE_URL="postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
bash scripts/setup-neon-db.sh
```

## Step 2: Service-Specific Connection Strings

Use these connection strings in your Render environment variables:

### Orders Service
```
postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=orders
```

### Vendor Service
```
postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=vendors
```

### Wallet Service
```
postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=wallet
```

### Web App (Auth)
```
postgresql://neondb_owner:npg_EPuyIcBzl8Q1@ep-red-shadow-a196epxf-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&schema=auth
```

## Step 3: Verify Schemas

Run this in Neon SQL Editor to verify:

```sql
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name IN ('orders', 'vendors', 'wallet', 'auth');
```

You should see all 4 schemas listed.

## Step 4: Set Up Auth Tables

After deploying the web app, run the SQL from `apps/web/prisma/init.sql` in the `auth` schema.

## Security Note

⚠️ **Important**: The connection string contains your password. Keep it secure:
- Never commit it to Git (already in .gitignore)
- Use environment variables in Render
- Consider rotating the password after setup

## Next Steps

1. ✅ Create schemas (Step 1 above)
2. Deploy services to Render
3. Add connection strings to Render environment variables
4. Run Prisma migrations in each service

