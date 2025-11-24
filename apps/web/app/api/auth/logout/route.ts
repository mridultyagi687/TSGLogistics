import { NextResponse } from "next/server";
import { deleteSession } from "../../../../lib/auth-simple";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_id")?.value;

    if (sessionId) {
      await deleteSession(sessionId);
    }

    // Clear session cookie
    cookieStore.delete("session_id");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

