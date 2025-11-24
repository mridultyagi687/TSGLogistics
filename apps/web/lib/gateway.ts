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
  const isGetRequest = !init.method || init.method === "GET";
  const isListEndpoint = path.includes("/api/") && !path.match(/\/api\/[^/]+\/[^/]+$/);
  
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
      
      // Check if response is HTML (Next.js 404 page) instead of JSON
      const isHtmlResponse = text.trim().startsWith("<!DOCTYPE html") || text.trim().startsWith("<html");
      
      if (isHtmlResponse) {
        console.error(`[gatewayJsonFetch] Received HTML response (404 page) instead of JSON for ${path}`, {
          status: response.status,
          contentType: response.headers.get("content-type")
        });
        
        // If gateway returned HTML, it means the service isn't running
        // Return empty array for list endpoints to allow graceful degradation
        if (isGetRequest && isListEndpoint) {
          console.warn(`[gatewayJsonFetch] Gateway service not available (returned HTML), returning empty array for ${path}`);
          return [] as T;
        }
        
        throw new Error("Gateway service is not running. Please check if the API Gateway and Orders Service are running.");
      }
      
      const errorMessage = `Gateway request failed (${response.status}): ${text.substring(0, 100) || response.statusText}`;
      console.error(`[gatewayJsonFetch] ${errorMessage}`, { path, status: response.status });
      
      // For 404 or 500 errors on GET requests to list endpoints, return empty array
      // This allows the UI to render gracefully when the gateway is down
      if ((response.status === 404 || response.status >= 500) && isGetRequest && isListEndpoint) {
        console.warn(`[gatewayJsonFetch] Gateway returned ${response.status} for list endpoint ${path}, returning empty array`);
        return [] as T;
      }
      
      throw new Error(errorMessage);
    }

    // Check if response is actually JSON before parsing
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      const isHtmlResponse = text.trim().startsWith("<!DOCTYPE html") || text.trim().startsWith("<html");
      
      if (isHtmlResponse) {
        console.error(`[gatewayJsonFetch] Response is HTML, not JSON for ${path}`);
        if (isGetRequest && isListEndpoint) {
          return [] as T;
        }
        throw new Error("Gateway service returned invalid response format. Please check if the API Gateway is running.");
      }
    }

    return (await response.json()) as T;
  } catch (error) {
    // Re-throw if it's already our formatted error
    if (error instanceof Error && error.message.includes("Gateway service")) {
      // For list endpoints, still return empty array even if error message is set
      if (isGetRequest && isListEndpoint) {
        console.warn(`[gatewayJsonFetch] Gateway unavailable for ${path}, returning empty array`);
        return [] as T;
      }
      throw error;
    }
    
    if (error instanceof Error && error.message.includes("Gateway request failed")) {
      // For 404 errors on list endpoints, return empty array
      if (isGetRequest && isListEndpoint && error.message.includes("404")) {
        console.warn(`[gatewayJsonFetch] Gateway returned 404 for ${path}, returning empty array`);
        return [] as T;
      }
      throw error;
    }
    
    // Handle network errors, connection refused, etc.
    // For GET requests to list endpoints, return empty array
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

