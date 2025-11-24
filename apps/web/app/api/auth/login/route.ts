import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "../../../../lib/auth-simple";
import { testConnection } from "../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    // Test database connection first
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error("[Login] Database connection test failed");
      return NextResponse.json(
        { 
          error: "Database connection failed",
          message: process.env.NODE_ENV === "development" 
            ? "Unable to connect to the database. Check WEB_DATABASE_URL or DATABASE_URL environment variable and ensure the database is accessible."
            : "Service temporarily unavailable. Please try again later.",
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

    const session = await authenticate(username, password, {
      userAgent,
      ipAddress,
      deviceInfo,
    });

    if (!session) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Determine redirect URL
    const callbackUrl = redirectTo || "/dashboard";

    // Create JSON response with cookie set
    const response = NextResponse.json({
      success: true,
      redirectTo: callbackUrl,
      user: {
        id: session.userId,
        username: session.username,
        email: session.email,
        name: session.name,
        role: session.role,
        orgId: session.orgId,
      },
    });
    
    // Set session cookie in the response
    response.cookies.set("session_id", session.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
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

