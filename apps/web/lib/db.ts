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
    throw new Error("DATABASE_URL or WEB_DATABASE_URL environment variable is not set");
  }

  // Parse connection string
  try {
    const url = new URL(connectionString.replace("postgresql://", "http://"));
    const isProduction = process.env.NODE_ENV === "production";
    const isNeon = connectionString.includes("neon.tech") || connectionString.includes("neon.tech");
    
    const config: any = {
      host: url.hostname || "localhost",
      port: parseInt(url.port || "5432", 10),
      database: url.pathname.slice(1) || undefined,
      user: url.username || undefined,
      password: url.password || undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      // Enable SSL for production or Neon databases
      ssl: isProduction || isNeon ? { rejectUnauthorized: false } : false,
    };

    // Remove undefined values
    Object.keys(config).forEach(key => {
      if (config[key] === undefined) {
        delete config[key];
      }
    });

    return new Pool(config);
  } catch (error) {
    // Fallback to connection string (for Neon and other providers)
    const isNeon = connectionString.includes("neon.tech");
    return new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      // Ensure SSL for Neon even when using connection string
      ssl: isNeon ? { rejectUnauthorized: false } : undefined,
    });
  }
}

export const pool = globalForDb.pool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
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

