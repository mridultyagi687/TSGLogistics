import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "../../../../lib/auth-simple";
import { testConnection } from "../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    // Test database connection first
    const connectionResult = await testConnection();
    if (!connectionResult.success) {
      console.error("[Login] Database connection test failed");
      const connectionString = process.env.WEB_DATABASE_URL ?? process.env.DATABASE_URL;
      const hasConnectionString = !!connectionString;
      const isNeon = connectionString?.includes("neon.tech") || connectionString?.includes("neon");
      
      // In production, provide helpful diagnostic info via health endpoint
      return NextResponse.json(
        { 
          error: "Database connection failed",
          message: "Service temporarily unavailable. Please try again later.",
          diagnostic: {
            hasConnectionString,
            isNeon,
            healthCheck: "/api/health",
            suggestion: "Check the /api/health endpoint for detailed database connection diagnostics"
          }
        },
        { status: 503 }
      );
    }
    // Parse request body (supports both JSON and form data)
    let body: any;
    const contentType = request.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      body = await request.json();
    } else {
      const formData = await request.formData();
      body = {
        username: formData.get("username"),
        password: formData.get("password"),
        redirectTo: formData.get("redirectTo"),
      };
    }

    const { username, password, redirectTo } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Capture device information
    const userAgent = request.headers.get("user-agent") || undefined;
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      request.ip ||
      undefined;

    // Extract device info from user agent
    const deviceInfo = userAgent
      ? JSON.stringify({
          userAgent,
          platform: request.headers.get("sec-ch-ua-platform") || undefined,
        })
      : undefined;

    console.log("[Login] Attempting authentication for username:", username);
    const session = await authenticate(username, password, {
      userAgent,
      ipAddress,
      deviceInfo,
    });

    if (!session) {
      console.log("[Login] Authentication failed for username:", username);
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    console.log("[Login] Authentication successful for username:", username);

    // Determine redirect URL
    const callbackUrl = redirectTo || "/dashboard";

    // Return session ID in response body (client will store in localStorage)
    // No cookies - use Authorization header instead
    const response = NextResponse.json({
      success: true,
      redirectTo: callbackUrl,
      sessionId: session.sessionId, // Client will store this in localStorage
      user: {
        id: session.userId,
        username: session.username,
        email: session.email,
        name: session.name,
        role: session.role,
        orgId: session.orgId,
      },
    });

    console.log("[Login] Session created, redirecting to:", callbackUrl);
    console.log("[Login] Session ID:", session.sessionId.substring(0, 8) + "...");

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    console.error("Error details:", {
      message: error?.message,
      code: error?.code,
      stack: error?.stack,
    });
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}

