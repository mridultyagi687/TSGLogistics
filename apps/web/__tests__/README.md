# Authentication Flow Test Suite

## Overview

This test suite provides comprehensive coverage of the authentication system, including:
- Unit tests for authentication functions
- Integration tests for API routes
- Edge case and error handling tests

## Test Files

### `lib/auth-simple.test.ts`
Unit tests for core authentication functions:
- `authenticate()` - User authentication with credentials
- `getSession()` - Session retrieval and validation
- `deleteSession()` - Session deletion
- `getUserByUsername()` / `getUserById()` - User lookup
- `createUser()` / `updateUser()` - User management
- `changePassword()` - Password management
- `getAllUsers()` - User listing
- `getUserSessions()` - Session management
- `deleteAllUserSessions()` - Bulk session deletion
- `cleanExpiredSessions()` - Session cleanup

**Test Coverage:**
- ✅ Valid authentication
- ✅ Invalid credentials
- ✅ Inactive users
- ✅ Device tracking
- ✅ Session expiration
- ✅ Case-insensitive usernames
- ✅ Password hashing
- ✅ Last login updates
- ✅ Session persistence

### `api/auth/login.test.ts`
Integration tests for the login API endpoint:
- ✅ Successful login with valid credentials
- ✅ 400 error for missing fields
- ✅ 401 error for invalid credentials
- ✅ Device information capture
- ✅ IP address tracking
- ✅ Cookie setting
- ✅ Error handling

### `api/auth/logout.test.ts`
Integration tests for the logout API endpoint:
- ✅ Successful logout
- ✅ Session deletion
- ✅ Cookie clearing
- ✅ Handling missing sessions
- ✅ Error handling

### `api/auth/session.test.ts`
Integration tests for the session API endpoint:
- ✅ Valid session retrieval
- ✅ Missing session handling
- ✅ Expired session handling
- ✅ Inactive user handling
- ✅ Last accessed updates
- ✅ Error handling

## Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth-simple.test.ts
```

## Prerequisites

1. **Database Connection**: Tests require a working PostgreSQL connection
   - Set `DATABASE_URL` in `.env.local` or `.env`
   - Database must have `User` and `Session` tables created
   - User `tsg` must have proper permissions

2. **Prisma Client**: Ensure Prisma client is generated
   ```bash
   npm run db:generate
   ```

## Known Issues

### Prisma Connection Error
Tests may fail with:
```
User `tsg` was denied access on the database `tsg_logistics.public`
```

**Workaround:**
1. Ensure database user has proper permissions:
   ```sql
   GRANT ALL ON SCHEMA public TO tsg;
   ALTER SCHEMA public OWNER TO tsg;
   ```

2. Or use a test database with a different user:
   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/test_db npm test
   ```

## Test Coverage Goals

- **Unit Tests**: 90%+ coverage of `auth-simple.ts`
- **Integration Tests**: 100% coverage of API routes
- **Edge Cases**: All error paths tested
- **Security**: Password hashing, session validation, etc.

## Adding New Tests

When adding new authentication features:

1. Add unit tests in `lib/auth-simple.test.ts`
2. Add integration tests in `api/auth/*.test.ts`
3. Test both success and failure cases
4. Test edge cases (empty strings, null values, etc.)
5. Test security aspects (password hashing, session expiration)

## Test Data Cleanup

Tests automatically clean up after themselves:
- Sessions are deleted after each test
- Test users are removed (except default users)
- Database is reset between test runs

