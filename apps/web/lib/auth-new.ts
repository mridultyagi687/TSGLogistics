/**
 * New Authentication Helpers
 * Replaces NextAuth with simple session-based auth
 */

"use server";

import { headers } from "next/headers";
import { getSession } from "./auth-simple";
import type { Role } from "./rbac";
import { hasPermission } from "./rbac";
import { redirect } from "next/navigation";

export interface SessionUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: Role;
  orgId: string;
}

/**
 * Get current session user
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    // Get session ID from Authorization header (no cookies)
    const headersList = await headers();
    const authHeader = headersList.get("authorization");
    const sessionId = authHeader?.startsWith("Bearer ") 
      ? authHeader.substring(7) 
      : null;

    if (!sessionId) {
      if (process.env.NODE_ENV === "development") {
        console.log("[getCurrentUser] No Authorization header with session ID");
      }
      return null;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[getCurrentUser] Found session_id:", sessionId.substring(0, 8) + "...");
    }

    const session = await getSession(sessionId);
    if (!session) {
      if (process.env.NODE_ENV === "development") {
        console.log("[getCurrentUser] Session not found or invalid for sessionId:", sessionId.substring(0, 8) + "...");
      }
      return null;
    }

    if (process.env.NODE_ENV === "development") {
      console.log("[getCurrentUser] Session valid for user:", session.username);
    }

    return {
      id: session.userId,
      username: session.username,
      email: session.email,
      name: session.name,
      role: session.role,
      orgId: session.orgId
    };
  } catch (error) {
    console.error("[getCurrentUser] Error:", error);
    return null;
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Check if user has a specific permission
 */
export async function checkPermission(permission: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }

  return hasPermission(user.role, permission as any);
}

/**
 * Require a specific permission - redirects if not authorized
 */
export async function requirePermission(permission: string): Promise<SessionUser> {
  const user = await requireAuth();

  if (!hasPermission(user.role, permission as any)) {
    redirect("/unauthorized");
  }

  return user;
}

/**
 * Get gateway session for API calls
 */
export async function getGatewaySession(): Promise<{
  token?: string;
  orgId?: string;
}> {
  const user = await getCurrentUser();

  // For now, use service token if available
  const token = process.env.GATEWAY_SERVICE_TOKEN?.trim();
  const orgId = user?.orgId || process.env.GATEWAY_ORG_ID || process.env.DEFAULT_GATEWAY_ORG_ID;

  return {
    token,
    orgId
  };
}

