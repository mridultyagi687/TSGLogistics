/**
 * Helper to get cookies in different Next.js contexts
 * Works in both API routes and server components
 */

import { cookies } from "next/headers";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

/**
 * Get cookie value - works in server components and API routes
 */
export async function getCookie(name: string): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
  } catch (error) {
    console.error(`[getCookie] Error reading cookie ${name}:`, error);
    return undefined;
  }
}

/**
 * Get cookie from request (for API routes)
 */
export function getCookieFromRequest(
  request: { cookies: { get: (name: string) => { value: string } | undefined } },
  name: string
): string | undefined {
  try {
    return request.cookies.get(name)?.value;
  } catch (error) {
    console.error(`[getCookieFromRequest] Error reading cookie ${name}:`, error);
    return undefined;
  }
}

