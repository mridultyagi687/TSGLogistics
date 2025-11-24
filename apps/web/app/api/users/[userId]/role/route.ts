import { NextRequest, NextResponse } from "next/server";
import { updateUser } from "../../../../../lib/auth-simple";
import { requireAdmin } from "../../../../../lib/require-permission";
import type { Role } from "../../../../../lib/rbac";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    await requireAdmin();
    
    const body = await request.json();
    const { role } = body;

    if (!role || !["admin", "ops_lead", "fleet_manager", "vendor", "viewer"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    const updated = await updateUser(params.userId, { role: role as Role });

    if (!updated) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

