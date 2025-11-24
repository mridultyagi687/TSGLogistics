import { NextResponse } from "next/server";
import { testConnection } from "../../../lib/db";

/**
 * Health check endpoint for diagnosing database connection issues
 * Accessible at: /api/health
 */
export async function GET() {
  const healthStatus: {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    database: {
      connected: boolean;
      error?: string;
      connectionStringPreview?: string;
    };
    environment: {
      nodeEnv: string;
      hasWEB_DATABASE_URL: boolean;
      hasDATABASE_URL: boolean;
      isProduction: boolean;
    };
  } = {
    status: "unhealthy",
    timestamp: new Date().toISOString(),
    database: {
      connected: false,
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || "development",
      hasWEB_DATABASE_URL: !!process.env.WEB_DATABASE_URL,
      hasDATABASE_URL: !!process.env.DATABASE_URL,
      isProduction: process.env.NODE_ENV === "production",
    },
  };

  // Check if pool initialization failed
  const connectionString = process.env.WEB_DATABASE_URL ?? process.env.DATABASE_URL;
  
  if (!connectionString) {
    healthStatus.status = "unhealthy";
    healthStatus.database.connected = false;
    healthStatus.database.error = "No database connection string found (WEB_DATABASE_URL or DATABASE_URL not set)";
    healthStatus.environment.hasWEB_DATABASE_URL = false;
    healthStatus.environment.hasDATABASE_URL = false;
    return NextResponse.json(healthStatus, { status: 503 });
  }

  try {
    // Test database connection
    const connectionResult = await testConnection();
    
    if (connectionResult.success) {
      healthStatus.status = "healthy";
      healthStatus.database.connected = true;
      
      // Show connection string preview (masked for security)
      const connectionString = process.env.WEB_DATABASE_URL ?? process.env.DATABASE_URL;
      if (connectionString) {
        try {
          const url = new URL(connectionString.replace("postgresql://", "http://"));
          healthStatus.database.connectionStringPreview = `${url.protocol}//${url.hostname}:${url.port || '5432'}/${url.pathname.split('/')[1] || 'unknown'}?${url.searchParams.toString().substring(0, 50)}...`;
        } catch {
          healthStatus.database.connectionStringPreview = connectionString.substring(0, 50) + "...";
        }
      }
    } else {
      healthStatus.status = "degraded";
      healthStatus.database.connected = false;
      
      // Include detailed error information
      if (connectionResult.error) {
        const error = connectionResult.error;
        const errorMessage = error.message || "Database connection test failed";
        const errorCode = error.code ? ` (${error.code})` : "";
        healthStatus.database.error = `${errorMessage}${errorCode}`;
        
        // Add error details for debugging
        if (error.detail) {
          healthStatus.database.error += ` - ${error.detail}`;
        }
        if (error.hint) {
          healthStatus.database.error += ` Hint: ${error.hint}`;
        }
      } else {
        healthStatus.database.error = "Database connection test failed";
      }
    }
  } catch (error: any) {
    healthStatus.status = "unhealthy";
    healthStatus.database.connected = false;
    healthStatus.database.error = error?.message || "Unknown database error";
  }

  const statusCode = healthStatus.status === "healthy" ? 200 : healthStatus.status === "degraded" ? 200 : 503;

  return NextResponse.json(healthStatus, { status: statusCode });
}

