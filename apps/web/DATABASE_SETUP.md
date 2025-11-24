# Database Setup for Authentication

The web app now uses PostgreSQL to persist user authentication and sessions. This allows users to stay logged in across page refreshes and tracks device information for each login session.

## Database Schema

The authentication system uses a separate schema called `auth` in the PostgreSQL database with the following tables:

- **User**: Stores user accounts with username, email, password hash, role, and organization ID
- **Session**: Stores active sessions with device information (user agent, IP address, device info)

## Setup Steps

1. **Ensure PostgreSQL is running** (via Docker or local installation)

2. **Set the DATABASE_URL environment variable** in `.env.local`:
   ```bash
   DATABASE_URL=postgresql://tsg:tsg_secret@localhost:5432/tsg_logistics?schema=auth
   ```
   
   Adjust the connection string based on your setup:
   - If using Docker: `postgresql://tsg:tsg_secret@localhost:5432/tsg_logistics?schema=auth`
   - If using local PostgreSQL: `postgresql://YOUR_USERNAME@localhost:5432/tsg_logistics?schema=auth`

3. **Create the database schema**:
   ```bash
   cd apps/web
   npm run db:push
   ```
   
   This will create the `auth` schema and tables in your database.

4. **Generate Prisma Client** (if not already done):
   ```bash
   npm run db:generate
   ```

## Default Users

The system automatically creates three default users on first run:

- **admin** / `admin123` - Administrator role
- **ops-lead** / `ChangeMe123!` - Operations Lead role  
- **viewer** / `viewer123` - Viewer role

⚠️ **Important**: Change these passwords in production!

## Features

- **Persistent Sessions**: Sessions are stored in the database and persist across server restarts
- **Device Tracking**: Each login session records:
  - User agent (browser/device type)
  - IP address
  - Device information (platform, etc.)
- **Session Management**: 
  - Sessions expire after 24 hours
  - Expired sessions are automatically cleaned up
  - Users can have multiple active sessions (different devices)

## Database Migrations

To create a migration:
```bash
npm run db:migrate
```

To apply migrations:
```bash
npm run db:push
```

## Troubleshooting

If you encounter connection errors:
1. Verify PostgreSQL is running: `docker ps` or `pg_isready`
2. Check DATABASE_URL is set correctly
3. Ensure the database `tsg_logistics` exists
4. Verify the user has permissions to create schemas

