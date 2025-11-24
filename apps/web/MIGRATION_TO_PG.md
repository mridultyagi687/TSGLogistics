# Migration from Prisma to pg (node-postgres)

## ✅ Migration Complete

The authentication system has been successfully migrated from Prisma to `pg` (node-postgres) for direct PostgreSQL access.

## Changes Made

### 1. Removed Prisma
- ❌ Removed `@prisma/client` dependency
- ❌ Removed `prisma` dev dependency
- ❌ Deleted `lib/prisma.ts`
- ❌ Removed Prisma scripts from package.json

### 2. Added pg (node-postgres)
- ✅ Added `pg@8.13.1` dependency
- ✅ Added `@types/pg@8.11.6` dev dependency
- ✅ Created `lib/db.ts` with connection pool and query helpers

### 3. Rebuilt Authentication System
- ✅ Completely rewrote `lib/auth-simple.ts` to use `pg` instead of Prisma
- ✅ All functions now use raw SQL queries
- ✅ Maintained same API interface (no breaking changes)
- ✅ Added automatic table creation if tables don't exist

## New Database Connection

**File:** `lib/db.ts`
- Connection pool management
- Query helper function
- Transaction support
- Automatic connection reuse

## Updated Functions

All authentication functions now use direct SQL:
- `authenticate()` - Uses `SELECT` and `INSERT` queries
- `getSession()` - Uses `SELECT` with `JOIN`
- `deleteSession()` - Uses `DELETE` query
- `createUser()` - Uses `INSERT` query
- `updateUser()` - Uses `UPDATE` query
- All other functions updated similarly

## Benefits

1. ✅ **No Prisma validation issues** - Direct PostgreSQL access
2. ✅ **Faster queries** - No ORM overhead
3. ✅ **Full SQL control** - Can optimize queries as needed
4. ✅ **Simpler dependencies** - One less major dependency
5. ✅ **Better error handling** - Direct access to PostgreSQL errors

## Connection String

Update your `.env.local`:
```env
DATABASE_URL=postgresql://prisma_user:prisma_pass@localhost:5432/tsg_logistics
```

Or use the `tsg` user:
```env
DATABASE_URL=postgresql://tsg:tsg_secret@localhost:5432/tsg_logistics
```

## Testing

The system is ready to test:
1. Start the Next.js server: `npm run dev`
2. Go to http://localhost:3000/login
3. Login with: `admin` / `admin123`

## No Breaking Changes

The API interface remains the same - all existing code using `auth-simple.ts` functions will work without changes.

