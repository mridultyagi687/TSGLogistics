import { getGatewaySession } from "./auth-new";

const DEFAULT_GATEWAY_URL = "http://localhost:4000";

type GatewayRequestInit = RequestInit & {
  skipAuth?: boolean;
};

export function getGatewayBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_GATEWAY_URL?.replace(/\/$/, "") ??
    DEFAULT_GATEWAY_URL
  );
}

export function resolveGatewayUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getGatewayBaseUrl()}${normalizedPath}`;
}

export async function gatewayFetch(
  path: string,
  init: GatewayRequestInit = {}
): Promise<Response> {
  const { skipAuth, ...rest } = init;
  const headers = new Headers(rest.headers ?? {});

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (!skipAuth && typeof window === "undefined") {
    const { token, orgId } = await getGatewaySession();
    if (token && !headers.has("Authorization")) {
      headers.set(
        "Authorization",
        token.startsWith("Bearer ") ? token : `Bearer ${token}`
      );
    }
    if (orgId && !headers.has("x-org-id")) {
      headers.set("x-org-id", orgId);
    }
  }

  const response = await fetch(resolveGatewayUrl(path), {
    ...rest,
    cache: "no-store",
    credentials: rest.credentials ?? "include",
    headers,
    next: rest.next
  });

  return response;
}

export async function gatewayJsonFetch<T>(
  path: string,
  init: GatewayRequestInit = {}
): Promise<T> {
  try {
    const response = await gatewayFetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {})
      }
    });

    if (!response.ok) {
      const text = await response.text();
      const errorMessage = `Gateway request failed (${response.status}): ${text || response.statusText}`;
      console.error(`[gatewayJsonFetch] ${errorMessage}`, { path, status: response.status });
      
      // For 500 errors on GET requests to list endpoints, return empty array
      // This allows the UI to render gracefully when the gateway is down
      if (response.status >= 500) {
        const isGetRequest = !init.method || init.method === "GET";
        const isListEndpoint = path.includes("/api/") && !path.match(/\/api\/[^/]+\/[^/]+$/);
        
        if (isGetRequest && isListEndpoint) {
          console.warn(`[gatewayJsonFetch] Gateway returned ${response.status} for list endpoint, returning empty array`);
          return [] as T;
        }
      }
      
      throw new Error(errorMessage);
    }

    return (await response.json()) as T;
  } catch (error) {
    // Re-throw if it's already our formatted error
    if (error instanceof Error && error.message.includes("Gateway request failed")) {
      throw error;
    }
    
    // Handle network errors, connection refused, etc.
    // For GET requests to list endpoints, return empty array
    const isGetRequest = !init.method || init.method === "GET";
    const isListEndpoint = path.includes("/api/") && !path.match(/\/api\/[^/]+\/[^/]+$/);
    
    if (isGetRequest && isListEndpoint) {
      console.error(`[gatewayJsonFetch] Network error for ${path}, returning empty array:`, error);
      return [] as T;
    }
    
    // For other errors, re-throw
    console.error(`[gatewayJsonFetch] Network error for ${path}:`, error);
    throw new Error(
      `Gateway service unavailable: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export { DEFAULT_GATEWAY_URL };

