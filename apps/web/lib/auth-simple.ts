/**
 * Simple Authentication System with RBAC
 * Replaces Keycloak with a lightweight credential-based auth
 * Uses PostgreSQL database with pg (node-postgres) for persistence
 */

import { compare, hash } from "bcryptjs";
import type { Role, User } from "./rbac";
import { query, transaction } from "./db";
import { v4 as uuidv4 } from "uuid";

export interface AuthSession {
  userId: string;
  username: string;
  email: string;
  role: Role;
  orgId: string;
  name: string;
  sessionId: string;
}

export interface DeviceInfo {
  userAgent?: string;
  ipAddress?: string;
  deviceInfo?: string;
}

/**
 * Initialize default users if they don't exist
 */
async function initializeUsers() {
  try {
    const result = await query<{ count: string }>(
      'SELECT COUNT(*)::int as count FROM "User"'
    );
    const userCount = parseInt(result.rows[0]?.count || "0", 10);
    if (userCount > 0) return; // Already initialized
  } catch (error: any) {
    // If table doesn't exist, create it
    if (error.code === "42P01") {
      await createTables();
    } else {
      console.error("Failed to check user count:", error?.message || error);
      throw new Error(`Database connection failed: ${error?.message || "Unknown error"}`);
    }
  }

  // Default admin user
  const adminPassword = await hash("admin123", 10);
  await query(
    `INSERT INTO "User" (id, username, email, "passwordHash", role, "orgId", name, "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
     ON CONFLICT (username) DO NOTHING`,
    [
      uuidv4(),
      "admin",
      "admin@tsglogistics.in",
      adminPassword,
      "admin",
      "org_demo",
      "Administrator",
      true,
    ]
  );

  // Default ops-lead user
  const opsPassword = await hash("ChangeMe123!", 10);
  await query(
    `INSERT INTO "User" (id, username, email, "passwordHash", role, "orgId", name, "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
     ON CONFLICT (username) DO NOTHING`,
    [
      uuidv4(),
      "ops-lead",
      "ops-lead@tsglogistics.in",
      opsPassword,
      "ops_lead",
      "org_demo",
      "Operations Lead",
      true,
    ]
  );

  // Default viewer user
  const viewerPassword = await hash("viewer123", 10);
  await query(
    `INSERT INTO "User" (id, username, email, "passwordHash", role, "orgId", name, "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
     ON CONFLICT (username) DO NOTHING`,
    [
      uuidv4(),
      "viewer",
      "viewer@tsglogistics.in",
      viewerPassword,
      "viewer",
      "org_demo",
      "Viewer",
      true,
    ]
  );
}

/**
 * Create database tables if they don't exist
 */
async function createTables() {
  // Create Role enum type
  await query(`
    DO $$ 
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
        CREATE TYPE "Role" AS ENUM ('admin', 'ops_lead', 'fleet_manager', 'vendor', 'viewer');
      END IF;
    END $$;
  `);

  // Create User table
  await query(`
    CREATE TABLE IF NOT EXISTS "User" (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      "passwordHash" TEXT NOT NULL,
      role "Role" NOT NULL,
      "orgId" TEXT NOT NULL,
      name TEXT NOT NULL,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "lastLogin" TIMESTAMP,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Create Session table
  await query(`
    CREATE TABLE IF NOT EXISTS "Session" (
      id TEXT PRIMARY KEY,
      "sessionId" TEXT UNIQUE NOT NULL,
      "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "userAgent" TEXT,
      "ipAddress" TEXT,
      "deviceInfo" TEXT,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
      "lastAccessed" TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  // Create indexes
  await query(`CREATE INDEX IF NOT EXISTS "User_username_idx" ON "User"(username);`);
  await query(`CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"(email);`);
  await query(`CREATE INDEX IF NOT EXISTS "User_orgId_idx" ON "User"("orgId");`);
  await query(`CREATE INDEX IF NOT EXISTS "Session_sessionId_idx" ON "Session"("sessionId");`);
  await query(`CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");`);
  await query(`CREATE INDEX IF NOT EXISTS "Session_expiresAt_idx" ON "Session"("expiresAt");`);
}

/**
 * Authenticate user with username and password
 */
export async function authenticate(
  username: string,
  password: string,
  deviceInfo?: DeviceInfo
): Promise<AuthSession | null> {
  try {
    await initializeUsers();

    const result = await query<{
      id: string;
      username: string;
      email: string;
      passwordHash: string;
      role: string;
      orgId: string;
      name: string;
      isActive: boolean;
    }>(
      'SELECT id, username, email, "passwordHash", role, "orgId", name, "isActive" FROM "User" WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    const user = result.rows[0];

    if (!user || !user.isActive) {
      return null;
    }

    const isValid = await compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    // Update last login
    await query(
      'UPDATE "User" SET "lastLogin" = NOW(), "updatedAt" = NOW() WHERE id = $1',
      [user.id]
    );

    // Create session
    const sessionId = uuidv4();
    const sessionDbId = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    console.log("[authenticate] Creating session:", {
      sessionId: sessionId.substring(0, 8) + "...",
      userId: user.id.substring(0, 8) + "...",
      expiresAt
    });

    try {
      const insertResult = await query(
        `INSERT INTO "Session" (id, "sessionId", "userId", "userAgent", "ipAddress", "deviceInfo", "expiresAt", "createdAt", "lastAccessed")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [
          sessionDbId,
          sessionId,
          user.id,
          deviceInfo?.userAgent || null,
          deviceInfo?.ipAddress || null,
          deviceInfo?.deviceInfo || null,
          expiresAt,
        ]
      );

      console.log("[authenticate] Session created successfully:", {
        sessionId: sessionId.substring(0, 8) + "...",
        rowCount: insertResult.rowCount
      });

      // Verify session was created
      const verifyResult = await query(
        'SELECT "sessionId" FROM "Session" WHERE "sessionId" = $1',
        [sessionId]
      );

      if (verifyResult.rows.length === 0) {
        console.error("[authenticate] Session was not created in database!");
        throw new Error("Failed to create session in database");
      }

      console.log("[authenticate] Session verified in database");
    } catch (dbError) {
      console.error("[authenticate] Database error creating session:", dbError);
      throw dbError;
    }

    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role as Role,
      orgId: user.orgId,
      name: user.name,
      sessionId,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    throw error;
  }
}

/**
 * Get session by session ID
 */
export async function getSession(sessionId: string): Promise<AuthSession | null> {
  try {
    await initializeUsers();

    if (process.env.NODE_ENV === "development") {
      console.log(`[getSession] Looking up session: ${sessionId.substring(0, 8)}...`);
    }

    // First check if session exists
    const sessionCheck = await query<{ id: string; userId: string; expiresAt: Date }>(
      'SELECT id, "userId", "expiresAt" FROM "Session" WHERE "sessionId" = $1',
      [sessionId]
    );

    if (sessionCheck.rows.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[getSession] No session found for sessionId: ${sessionId.substring(0, 8)}...`);
      }
      return null;
    }

    const sessionRow = sessionCheck.rows[0];

    // Get user data
    const userResult = await query<{
      id: string;
      username: string;
      email: string;
      role: string;
      orgId: string;
      name: string;
      isActive: boolean;
    }>(
      'SELECT id, username, email, role, "orgId", name, "isActive" FROM "User" WHERE id = $1',
      [sessionRow.userId]
    );

    if (userResult.rows.length === 0) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[getSession] User not found for userId: ${sessionRow.userId.substring(0, 8)}...`);
      }
      return null;
    }

    const user = userResult.rows[0];

    if (process.env.NODE_ENV === "development") {
      console.log(`[getSession] Found session and user: ${user.username}`);
    }

    // Check if session is expired
    if (new Date() > new Date(sessionRow.expiresAt)) {
      await query('DELETE FROM "Session" WHERE id = $1', [sessionRow.id]);
      if (process.env.NODE_ENV === "development") {
        console.log(`[getSession] Session expired: ${sessionId.substring(0, 8)}...`);
      }
      return null;
    }

    // Check if user is still active
    if (!user.isActive) {
      await query('DELETE FROM "Session" WHERE id = $1', [sessionRow.id]);
      if (process.env.NODE_ENV === "development") {
        console.log(`[getSession] User inactive: ${sessionId.substring(0, 8)}...`);
      }
      return null;
    }

    // Update last accessed time
    await query('UPDATE "Session" SET "lastAccessed" = NOW() WHERE id = $1', [sessionRow.id]);

    return {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role as Role,
      orgId: user.orgId,
      name: user.name,
      sessionId: sessionId,
    };
  } catch (error) {
    console.error("[getSession] Error:", error);
    return null;
  }
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  try {
    await initializeUsers();

    const result = await query<{
      id: string;
      username: string;
      email: string;
      passwordHash: string;
      role: string;
      orgId: string;
      name: string;
      createdAt: Date;
      lastLogin: Date | null;
      isActive: boolean;
    }>(
      'SELECT id, username, email, "passwordHash", role, "orgId", name, "createdAt", "lastLogin", "isActive" FROM "User" WHERE LOWER(username) = LOWER($1)',
      [username]
    );

    const user = result.rows[0];
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as Role,
      orgId: user.orgId,
      name: user.name,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin ?? undefined,
      isActive: user.isActive,
    };
  } catch (error) {
    console.error("Get user by username error:", error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    await initializeUsers();

    const result = await query<{
      id: string;
      username: string;
      email: string;
      passwordHash: string;
      role: string;
      orgId: string;
      name: string;
      createdAt: Date;
      lastLogin: Date | null;
      isActive: boolean;
    }>(
      'SELECT id, username, email, "passwordHash", role, "orgId", name, "createdAt", "lastLogin", "isActive" FROM "User" WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role as Role,
      orgId: user.orgId,
      name: user.name,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin ?? undefined,
      isActive: user.isActive,
    };
  } catch (error) {
    console.error("Get user by ID error:", error);
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(
  username: string,
  email: string,
  password: string,
  role: Role,
  orgId: string,
  name: string
): Promise<User> {
  await initializeUsers();

  // Check if user exists
  const existing = await getUserByUsername(username);
  if (existing) {
    throw new Error("User already exists");
  }

  const passwordHash = await hash(password, 10);
  const id = uuidv4();

  await query(
    `INSERT INTO "User" (id, username, email, "passwordHash", role, "orgId", name, "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
    [id, username.toLowerCase(), email.toLowerCase(), passwordHash, role, orgId, name, true]
  );

  const user = await getUserById(id);
  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
}

/**
 * Update user
 */
export async function updateUser(
  userId: string,
  updates: Partial<Pick<User, "email" | "role" | "name" | "orgId" | "isActive">>
): Promise<User | null> {
  await initializeUsers();

  // Check if user exists
  const existing = await getUserById(userId);
  if (!existing) {
    return null;
  }

  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.email !== undefined) {
    setClauses.push(`email = $${paramIndex++}`);
    values.push(updates.email.toLowerCase());
  }
  if (updates.role !== undefined) {
    setClauses.push(`role = $${paramIndex++}`);
    values.push(updates.role);
  }
  if (updates.name !== undefined) {
    setClauses.push(`name = $${paramIndex++}`);
    values.push(updates.name);
  }
  if (updates.orgId !== undefined) {
    setClauses.push(`"orgId" = $${paramIndex++}`);
    values.push(updates.orgId);
  }
  if (updates.isActive !== undefined) {
    setClauses.push(`"isActive" = $${paramIndex++}`);
    values.push(updates.isActive);
  }

  if (setClauses.length === 0) {
    return existing;
  }

  setClauses.push(`"updatedAt" = NOW()`);
  values.push(userId);

  await query(
    `UPDATE "User" SET ${setClauses.join(", ")} WHERE id = $${paramIndex}`,
    values
  );

  return await getUserById(userId);
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string
): Promise<boolean> {
  await initializeUsers();

  const user = await getUserById(userId);
  if (!user) {
    return false;
  }

  const isValid = await compare(oldPassword, user.passwordHash);
  if (!isValid) {
    return false;
  }

  const newPasswordHash = await hash(newPassword, 10);
  await query(
    'UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2',
    [newPasswordHash, userId]
  );

  return true;
}

/**
 * Delete session (logout)
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await query('DELETE FROM "Session" WHERE "sessionId" = $1', [sessionId]);
}

/**
 * Delete all sessions for a user (logout from all devices)
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  await query('DELETE FROM "Session" WHERE "userId" = $1', [userId]);
}

/**
 * Clean expired sessions
 */
export async function cleanExpiredSessions(): Promise<void> {
  await query('DELETE FROM "Session" WHERE "expiresAt" < NOW()');
}

/**
 * Get all users (for admin)
 */
export async function getAllUsers(): Promise<User[]> {
  await initializeUsers();

  const result = await query<{
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    role: string;
    orgId: string;
    name: string;
    createdAt: Date;
    lastLogin: Date | null;
    isActive: boolean;
  }>(
    'SELECT id, username, email, "passwordHash", role, "orgId", name, "createdAt", "lastLogin", "isActive" FROM "User" ORDER BY "createdAt" DESC'
  );

  return result.rows.map((user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    passwordHash: user.passwordHash,
    role: user.role as Role,
    orgId: user.orgId,
    name: user.name,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin ?? undefined,
    isActive: user.isActive,
  }));
}

/**
 * Get all active sessions for a user
 */
export async function getUserSessions(userId: string) {
  const result = await query<{
    id: string;
    sessionId: string;
    userId: string;
    userAgent: string | null;
    ipAddress: string | null;
    deviceInfo: string | null;
    expiresAt: Date;
    createdAt: Date;
    lastAccessed: Date;
  }>(
    `SELECT id, "sessionId", "userId", "userAgent", "ipAddress", "deviceInfo", 
            "expiresAt", "createdAt", "lastAccessed"
     FROM "Session"
     WHERE "userId" = $1 AND "expiresAt" > NOW()
     ORDER BY "lastAccessed" DESC`,
    [userId]
  );

  return result.rows;
}

// Clean expired sessions every hour
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    cleanExpiredSessions().catch(console.error);
  }, 60 * 60 * 1000);
}
