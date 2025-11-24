import { NextRequest, NextResponse } from "next/server";
import { getSession } from "../../../../lib/auth-simple";

export async function GET(request: NextRequest) {
  try {
    // Read cookie from request (works in API routes)
    const sessionId = request.cookies.get("session_id")?.value;

    if (!sessionId) {
      if (process.env.NODE_ENV === "development") {
        console.log("[Session API] No session_id cookie in request");
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
      // Clear invalid session cookie
      const response = NextResponse.json({ user: null });
      response.cookies.delete("session_id");
      return response;
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
    return NextResponse.json({ user: null, error: error instanceof Error ? error.message : "Unknown error" });
  }
}

