/**
 * Database connection using pg (node-postgres)
 * Replaces Prisma with direct PostgreSQL access
 */

import { Pool, QueryResult } from "pg";
import type { PoolClient } from "pg";

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};

// Create connection pool
function createPool(): Pool {
  const connectionString = process.env.WEB_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    const errorMsg = `DATABASE_URL or WEB_DATABASE_URL environment variable is not set. Available env vars: ${Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('DB')).join(', ') || 'none'}`;
    console.error("[db]", errorMsg);
    throw new Error(errorMsg);
  }

  const isProduction = process.env.NODE_ENV === "production";
  const isNeon = connectionString.includes("neon.tech") || connectionString.includes("neon");

  console.log("[db] Initializing connection pool", {
    isNeon,
    isProduction,
    hasConnectionString: !!connectionString,
    connectionStringPreview: connectionString ? `${connectionString.substring(0, 30)}...` : 'none'
  });

  // For Neon, always use connection string with SSL explicitly configured
  // This ensures SSL is properly enabled even with connection string parameters
  if (isNeon) {
    // Remove channel_binding parameter as it's not supported by pg
    let cleanConnectionString = connectionString
      .replace(/[?&]channel_binding=[^&]*/g, "");
    
    // Remove existing sslmode parameter (we'll add it back)
    cleanConnectionString = cleanConnectionString.replace(/[?&]sslmode=[^&]*/g, "");
    
    // Remove trailing ? if present
    cleanConnectionString = cleanConnectionString.replace(/\?$/, "");
    
    // Ensure sslmode is set to require
    const finalConnectionString = cleanConnectionString.includes("?")
      ? `${cleanConnectionString}&sslmode=require`
      : `${cleanConnectionString}?sslmode=require`;

    console.log("[db] Connecting to Neon database with SSL");
    console.log("[db] Connection string preview:", finalConnectionString.substring(0, 80) + "...");
    console.log("[db] Using pooler connection:", finalConnectionString.includes("-pooler"));
    
    const poolConfig = {
      connectionString: finalConnectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 20000, // Increased timeout for Render/Neon
      // Explicitly enable SSL for Neon - required for all Neon connections
      ssl: {
        rejectUnauthorized: false,
      },
      // Add keepalive to prevent connection drops
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      // Allow exit on idle for better connection management
      allowExitOnIdle: false,
    };
    
    return new Pool(poolConfig);
  }

  // For other databases, try to parse the connection string
  try {
    const url = new URL(connectionString.replace("postgresql://", "http://"));
    
    const config: any = {
      host: url.hostname || "localhost",
      port: parseInt(url.port || "5432", 10),
      database: url.pathname.slice(1) || undefined,
      user: url.username || undefined,
      password: url.password || undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      // Enable SSL for production
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    };

    // Remove undefined values
    Object.keys(config).forEach(key => {
      if (config[key] === undefined) {
        delete config[key];
      }
    });

    return new Pool(config);
  } catch (error) {
    // Fallback to connection string
    console.log("[db] Using connection string directly");
    return new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    });
  }
}

// Initialize pool as singleton - reuse existing pool if available
let pool: Pool;

// Check if pool already exists in global scope (reuse across module reloads)
if (globalForDb.pool) {
  pool = globalForDb.pool;
  // Only log once if we're reusing an existing pool
  if (process.env.NODE_ENV === "development") {
    console.log("[db] Reusing existing database pool from global scope");
  }
} else {
  // Create new pool
  try {
    pool = createPool();
    // Always cache in global scope to prevent multiple pool creation
    globalForDb.pool = pool;
    
    // Only log once per actual pool creation
    const poolId = Math.random().toString(36).substring(7);
    console.log(`[db] Database pool initialized successfully [${poolId}]`);
  } catch (error: any) {
    console.error("[db] Failed to initialize database pool:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });
    
    const connectionString = process.env.WEB_DATABASE_URL ?? process.env.DATABASE_URL;
    console.error("[db] Connection string status:", {
      hasWEB_DATABASE_URL: !!process.env.WEB_DATABASE_URL,
      hasDATABASE_URL: !!process.env.DATABASE_URL,
      connectionStringPreview: connectionString ? `${connectionString.substring(0, 30)}...` : 'NOT SET'
    });
    
    // Create a dummy pool that will fail gracefully on queries
    pool = new Pool({
      connectionString: "postgresql://invalid",
      max: 1,
    });
    console.error("[db] Created fallback pool. Database queries will fail until connection is configured.");
  }
}

export { pool };

// Test database connection with detailed error info
export async function testConnection(): Promise<{ success: boolean; error?: any }> {
  try {
    console.log("[db] Testing database connection...");
    const startTime = Date.now();
    const result = await pool.query("SELECT NOW() as now, version() as version");
    const duration = Date.now() - startTime;
    console.log("[db] Database connection successful", {
      duration: `${duration}ms`,
      timestamp: result.rows[0]?.now,
      version: result.rows[0]?.version?.substring(0, 50)
    });
    return { success: true };
  } catch (error: any) {
    const errorInfo = {
      message: error?.message,
      code: error?.code,
      name: error?.name,
      severity: error?.severity,
      detail: error?.detail,
      hint: error?.hint,
    };
    
    console.error("[db] Database connection failed:", {
      ...errorInfo,
      position: error?.position,
      internalPosition: error?.internalPosition,
      internalQuery: error?.internalQuery,
      where: error?.where,
      schema: error?.schema,
      table: error?.table,
      column: error?.column,
      dataType: error?.dataType,
      constraint: error?.constraint,
      file: error?.file,
      line: error?.line,
      routine: error?.routine,
      stack: error?.stack,
    });
    
    // Log environment info for debugging
    const connectionString = process.env.WEB_DATABASE_URL ?? process.env.DATABASE_URL;
    console.error("[db] Environment info:", {
      hasWEB_DATABASE_URL: !!process.env.WEB_DATABASE_URL,
      hasDATABASE_URL: !!process.env.DATABASE_URL,
      connectionStringPreview: connectionString ? `${connectionString.substring(0, 50)}...` : 'none',
      nodeEnv: process.env.NODE_ENV,
      isNeon: connectionString?.includes("neon.tech") || connectionString?.includes("neon"),
    });
    
    return { success: false, error: errorInfo };
  }
}

// Helper function to execute queries
export async function query<T extends Record<string, any> = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === "development") {
      console.log("Executed query", { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error: any) {
    console.error("Database query error:", {
      message: error?.message,
      code: error?.code,
      query: text.substring(0, 100),
      detail: error?.detail,
      hint: error?.hint,
    });
    // Provide more helpful error messages
    if (error?.code === "ECONNREFUSED") {
      throw new Error("Database connection refused. Check DATABASE_URL and ensure the database is running.");
    }
    if (error?.code === "ENOTFOUND") {
      throw new Error("Database host not found. Check DATABASE_URL.");
    }
    if (error?.code === "28P01") {
      throw new Error("Database authentication failed. Check database credentials.");
    }
    if (error?.code === "3D000") {
      throw new Error("Database does not exist. Check DATABASE_URL.");
    }
    if (error?.code === "08006" || error?.message?.includes("SSL")) {
      throw new Error("Database SSL connection failed. Ensure SSL is properly configured for your database provider.");
    }
    throw error;
  }
}

// Helper function to get a client from the pool (for transactions)
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

// Helper function to execute a transaction
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// Close the pool (for cleanup)
export async function closePool(): Promise<void> {
  await pool.end();
}

