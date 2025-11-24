# Render Database Connection Troubleshooting Guide

## Quick Diagnosis

1. **Check Health Endpoint**: Visit `https://your-app.onrender.com/api/health` to see detailed database connection status

2. **Check Render Logs**: Go to your Render service → Logs tab to see database connection errors

## Common Issues and Fixes

### Issue 1: Environment Variables Not Set

**Symptoms**: 
- Health check shows `hasWEB_DATABASE_URL: false` and `hasDATABASE_URL: false`
- Error: "DATABASE_URL or WEB_DATABASE_URL environment variable is not set"

**Fix**:
1. Go to Render Dashboard → Your Service → Environment
2. Add these environment variables:
   ```
   WEB_DATABASE_URL=postgresql://user:password@host:port/db?sslmode=require&schema=auth
   DATABASE_URL=postgresql://user:password@host:port/db?sslmode=require&schema=auth
   ```
3. Click "Save Changes"
4. Restart the service

### Issue 2: SSL Connection Errors (Neon Database)

**Symptoms**:
- Error codes: `08006`, `SSL connection failed`
- Connection timeout errors

**Fix**:
The code automatically handles Neon SSL connections, but verify:

1. Your connection string includes `sslmode=require`
2. Your Neon database allows SSL connections
3. Check Neon dashboard → Settings → Connection Pooling

**Example Neon Connection String**:
```
postgresql://user:password@ep-xxx-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&schema=auth
```

### Issue 3: Connection Timeout

**Symptoms**:
- Database connection takes too long
- Timeout errors in logs

**Fix**:
The connection timeout has been increased to 15 seconds. If still timing out:

1. Check if Neon database is in the same region
2. Verify network connectivity from Render
3. Check Neon dashboard for any service issues

### Issue 4: Wrong Database Schema

**Symptoms**:
- Connection succeeds but queries fail
- "schema does not exist" errors

**Fix**:
1. Ensure your connection string includes `schema=auth` parameter
2. Verify the schema exists in your Neon database:
   ```sql
   CREATE SCHEMA IF NOT EXISTS auth;
   ```

### Issue 5: Database Credentials Invalid

**Symptoms**:
- Error code: `28P01`
- "Database authentication failed"

**Fix**:
1. Verify credentials in Neon dashboard
2. Reset password if needed
3. Update connection string in Render environment variables
4. Ensure username/password don't contain special characters that need URL encoding

## Step-by-Step Debugging

### Step 1: Check Environment Variables

1. Go to Render Dashboard → Your Service → Environment
2. Verify `WEB_DATABASE_URL` or `DATABASE_URL` is set
3. Copy the value (mask password) and verify format

### Step 2: Test Connection Locally

```bash
# Test connection string locally (mask password)
psql "postgresql://user:password@host:port/db?sslmode=require&schema=auth"
```

### Step 3: Check Health Endpoint

Visit: `https://your-app.onrender.com/api/health`

Expected response:
```json
{
  "status": "healthy",
  "database": {
    "connected": true,
    "connectionStringPreview": "..."
  },
  "environment": {
    "hasWEB_DATABASE_URL": true,
    "hasDATABASE_URL": true
  }
}
```

### Step 4: Check Render Logs

1. Go to Render Dashboard → Your Service → Logs
2. Look for `[db]` prefixed messages
3. Check for connection errors or SSL errors

### Step 5: Verify Database Tables Exist

Connect to your database and verify:
```sql
-- Check if User table exists
SELECT * FROM "User" LIMIT 1;

-- Check if Session table exists
SELECT * FROM "Session" LIMIT 1;
```

## Render-Specific Notes

### Connection Pooling

For Neon databases, use the **pooler** connection string (includes `-pooler` in hostname):
```
postgresql://user:password@ep-xxx-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require&schema=auth
```

### Service Restart

After changing environment variables:
1. Save changes in Render dashboard
2. Service will automatically restart
3. Wait 2-3 minutes for restart to complete
4. Check logs for initialization messages

### Environment Variable Sync

If using `render.yaml`, ensure variables are marked as `sync: false`:
```yaml
envVars:
  - key: WEB_DATABASE_URL
    sync: false  # Set this in Render dashboard, not in YAML
```

## Still Having Issues?

1. **Check Health Endpoint**: `/api/health` for detailed diagnostics
2. **Review Logs**: Look for `[db]` prefixed error messages
3. **Verify Neon Status**: Check Neon dashboard for service status
4. **Test Connection String**: Try connecting with `psql` locally
5. **Contact Support**: Include health endpoint response and logs

## Recent Improvements

- ✅ Increased connection timeout to 15 seconds
- ✅ Added keepalive settings to prevent connection drops
- ✅ Enhanced error logging with detailed diagnostics
- ✅ Added health check endpoint at `/api/health`
- ✅ Better error messages for missing environment variables
- ✅ Automatic SSL configuration for Neon databases

