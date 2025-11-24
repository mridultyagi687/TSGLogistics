import { gatewayFetch } from "./gateway";

export interface PlatformStatus {
  status: "ok" | "degraded" | "down";
  service: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

export async function getPlatformStatus(): Promise<PlatformStatus> {
  try {
    const response = await gatewayFetch("/health");

    if (!response.ok) {
      // Check if response is HTML (404 page)
      const contentType = response.headers.get("content-type") || "";
      const text = await response.text();
      const isHtmlResponse = text.trim().startsWith("<!DOCTYPE html") || text.trim().startsWith("<html");
      
      if (isHtmlResponse || response.status === 404) {
        console.warn("[getPlatformStatus] Gateway health endpoint not available (404 or HTML response)");
        return {
          status: "down",
          service: "API Gateway",
          timestamp: new Date().toISOString(),
          details: {
            error: "Gateway service is not running. Please check if the API Gateway and Orders Service are running.",
            status: response.status
          }
        };
      }
      
      throw new Error(`Gateway responded with ${response.status}`);
    }

    // Verify response is JSON
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await response.text();
      const isHtmlResponse = text.trim().startsWith("<!DOCTYPE html") || text.trim().startsWith("<html");
      if (isHtmlResponse) {
        return {
          status: "down",
          service: "API Gateway",
          timestamp: new Date().toISOString(),
          details: {
            error: "Gateway service returned invalid response format"
          }
        };
      }
    }

    const payload = (await response.json()) as PlatformStatus;
    return {
      status: payload.status ?? "ok",
      service: payload.service ?? "API Gateway",
      timestamp: payload.timestamp ?? new Date().toISOString(),
      details: payload.details
    };
  } catch (error) {
    console.error("[getPlatformStatus] Error checking gateway status:", error);
    return {
      status: "down",
      service: "API Gateway",
      timestamp: new Date().toISOString(),
      details: {
        error:
          error instanceof Error ? error.message : "Unknown error contacting gateway",
        suggestion: "Make sure the API Gateway (port 4000) and Orders Service (port 4001) are running."
      }
    };
  }
}

