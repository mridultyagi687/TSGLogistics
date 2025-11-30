import { NextRequest, NextResponse } from "next/server";
import { deleteSession } from "../../../../lib/auth-simple";

export async function POST(request: NextRequest) {
  try {
    // Read session ID from Authorization header (no cookies)
    const authHeader = request.headers.get("authorization");
    const sessionId = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : null;

    if (sessionId) {
      await deleteSession(sessionId);
    }

    // No cookie to clear - client will clear localStorage
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

