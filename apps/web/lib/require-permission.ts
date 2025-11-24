import { redirect } from "next/navigation";
import { getCurrentUser, requireAuth } from "./auth-new";
import { hasPermission as checkPermission, type Permission, type Role } from "./rbac";

/**
 * Require a specific permission on server-side pages
 * Redirects to unauthorized page if user doesn't have permission
 */
export async function requirePermission(permission: Permission) {
  const user = await requireAuth();

  // Admin always has access
  if (user.role === "admin") {
    return { user, role: user.role };
  }

  if (!checkPermission(user.role, permission)) {
    redirect("/unauthorized");
  }

  return { user, role: user.role };
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  const user = await requireAuth();

  if (user.role !== "admin") {
    redirect("/unauthorized");
  }

  return { user, role: user.role };
}

/**
 * Check if user has permission (non-blocking)
 */
export async function hasPermission(permission: Permission): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) {
    return false;
  }
  return checkPermission(user.role, permission);
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "admin";
}
