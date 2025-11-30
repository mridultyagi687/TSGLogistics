import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth-simple";
import { testConnection } from "../../../../lib/db";

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    const connectionResult = await testConnection();
    if (!connectionResult.success) {
      console.error("[Session API] Database connection test failed");
      return NextResponse.json({ 
        user: null, 
        error: "Database connection failed",
        message: "Unable to connect to the database"
      });
    }

    // Read session ID from Authorization header (no cookies)
    const authHeader = request.headers.get("authorization");
    const sessionId = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : null;

    if (!sessionId) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Session API] No Authorization header with session ID");
      }
      return NextResponse.json({ user: null });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[Session API] Found session_id:", sessionId.substring(0, 8) + "...");
    }

    const session = await getSession(sessionId);

    if (!session) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Session API] Session not found or invalid");
      }
      return NextResponse.json({ user: null });
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[Session API] Session valid for user:", session.username);
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        username: session.username,
        email: session.email,
        name: session.name,
        role: session.role,
        orgId: session.orgId
      }
    });
  } catch (error) {
    console.error("[Session API] Error:", error);
    return NextResponse.json({ 
      user: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
}

