# Neon Database Connection Setup

This guide explains how to properly configure your Neon database connection string for the TSG Logistics application.

## Connection String Format

Your Neon connection string should look like this:

```
postgresql://neondb_owner:npg_BltKNAi17hwM@ep-curly-fire-ahq59jtk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Important Notes

1. **Remove `channel_binding=require`**: The `pg` library (node-postgres) doesn't support the `channel_binding` parameter. Remove it from your connection string.

2. **Keep `sslmode=require`**: SSL is required for Neon connections. The application will automatically configure SSL, but including `sslmode=require` in the connection string ensures compatibility.

3. **Use the Pooler URL**: Neon provides both direct and pooler connection strings. Use the **pooler** URL (contains `-pooler` in the hostname) for better connection management in serverless environments like Render.

## Setting Up in Render

1. **Go to your Render service dashboard**
2. **Navigate to Environment Variables**
3. **Set `WEB_DATABASE_URL`** with your Neon connection string:

   ```
   postgresql://neondb_owner:npg_BltKNAi17hwM@ep-curly-fire-ahq59jtk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

   **Important**: Remove `&channel_binding=require` if it's in your connection string.

4. **Also set `DATABASE_URL`** (as a fallback):
   
   ```
   postgresql://neondb_owner:npg_BltKNAi17hwM@ep-curly-fire-ahq59jtk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

## Verifying the Connection

After setting the environment variables:

1. **Redeploy your Render service** to apply the changes
2. **Check the Render logs** for connection messages:
   - Look for `[db] Connecting to Neon database with SSL`
   - Look for `[db] Database connection successful`
3. **Test the login endpoint** - it should now connect successfully

## Troubleshooting

### Error: "Database connection failed"

- **Check the connection string format**: Ensure it starts with `postgresql://` and includes `?sslmode=require`
- **Verify credentials**: Ensure the username and password are correct
- **Check Neon dashboard**: Ensure your Neon database is active and accessible
- **Review Render logs**: Look for detailed error messages about SSL or authentication failures

### Error: "SSL connection failed"

- The application automatically configures SSL for Neon connections
- Ensure `sslmode=require` is in your connection string
- Check that your Neon database allows SSL connections (this should be enabled by default)

### Error: "Database authentication failed"

- Verify your Neon database username and password
- Check that the database user has the necessary permissions
- Ensure you're using the correct database name

## Connection String Examples

### ✅ Correct Format (for Render)
```
postgresql://neondb_owner:npg_BltKNAi17hwM@ep-curly-fire-ahq59jtk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### ❌ Incorrect Format (includes channel_binding)
```
postgresql://neondb_owner:npg_BltKNAi17hwM@ep-curly-fire-ahq59jtk-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

The `channel_binding` parameter will be automatically removed by the application, but it's better to remove it from your environment variable.

## Getting Your Connection String from Neon

1. Log in to your Neon dashboard
2. Select your project
3. Go to the **Connection Details** section
4. Copy the **Pooler** connection string
5. Remove `&channel_binding=require` if present
6. Ensure `?sslmode=require` is included

