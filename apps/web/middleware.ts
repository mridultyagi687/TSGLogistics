import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/", "/login", "/api/auth/login", "/api/auth/logout", "/api/auth/session"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Redirect backend URL to UI URL if configured
  // Only redirect if NEXT_PUBLIC_UI_URL is set (indicating separate UI service)
  const uiUrl = process.env.NEXT_PUBLIC_UI_URL;
  const backendHostname = process.env.BACKEND_HOSTNAME || "tsglogistics.onrender.com";
  
  // Check if this is the backend URL and redirect to UI URL
  if (uiUrl && (hostname === backendHostname || hostname.includes(backendHostname))) {
    // Only redirect if we're not already on the UI URL
    if (!hostname.includes("tsglogistics-ui.onrender.com")) {
      try {
        const uiUrlObj = new URL(uiUrl);
        const redirectUrl = new URL(pathname + request.nextUrl.search, uiUrlObj.origin);
        return NextResponse.redirect(redirectUrl, 308); // 308 Permanent Redirect
      } catch (e) {
        // If URL parsing fails, continue with normal flow
        console.error("Failed to parse UI URL for redirect:", e);
      }
    }
  }

  // Allow public paths
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Check for Authorization header (no cookies)
  const authHeader = request.headers.get("authorization");
  const sessionId = authHeader?.startsWith("Bearer ") 
    ? authHeader.substring(7) 
    : null;

  if (!sessionId) {
    // No session - redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`
    );
    return NextResponse.redirect(loginUrl);
  }

  // Session ID exists in header - allow request
  // Session validation happens in server components via requireAuth()
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth (auth endpoints)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
};
