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
      throw new Error(`Gateway responded with ${response.status}`);
    }

    const payload = (await response.json()) as PlatformStatus;
    return {
      status: payload.status ?? "ok",
      service: payload.service ?? "API Gateway",
      timestamp: payload.timestamp ?? new Date().toISOString(),
      details: payload.details
    };
  } catch (error) {
    return {
      status: "degraded",
      service: "API Gateway",
      timestamp: new Date().toISOString(),
      details: {
        error:
          error instanceof Error ? error.message : "Unknown error contacting gateway"
      }
    };
  }
}

