import { redirect } from "next/navigation";
import { getCurrentUser, requireAuth as requireAuthNew } from "./auth-new";

/**
 * Require authentication on server-side pages
 * Redirects to sign-in if not authenticated
 * @deprecated Use getCurrentUser() or requireAuth() from auth-new.ts instead
 */
export async function requireAuth() {
  try {
    const user = await requireAuthNew();
    return {
      session: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        orgId: user.orgId,
        role: user.role
      },
      orgId: user.orgId,
      token: process.env.GATEWAY_SERVICE_TOKEN
    };
  } catch {
    redirect("/login");
  }
}

/**
 * Get current user (new way)
 */
export async function getCurrentSession() {
  return getCurrentUser();
}
