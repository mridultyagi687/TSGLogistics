import type { Address, LoadOrder } from "@tsg/shared";
import { gatewayJsonFetch } from "./gateway";
export { getLoadProgress } from "./load-progress";

export interface CreateLoadInput {
  orgId: string;
  referenceCode: string;
  pickup: Address;
  drop: Address;
  cargoType: string;
  cargoValue: number;
  slaHours: number;
  vehicleType: string;
}

export async function fetchLoads(): Promise<LoadOrder[]> {
  try {
    const loads = await gatewayJsonFetch<LoadOrder[]>("/api/loads", {
      headers: { Accept: "application/json" }
    });

    return loads.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error("Failed to fetch loads:", error);
    return [];
  }
}

export async function createLoad(input: CreateLoadInput): Promise<LoadOrder> {
  try {
    return await gatewayJsonFetch<LoadOrder>("/api/loads", {
      method: "POST",
      body: JSON.stringify(input)
    });
  } catch (error) {
    console.error("Failed to create load:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create load";
    
    // Provide more helpful error messages
    if (errorMessage.includes("500")) {
      throw new Error("Gateway service error. Please check if the API Gateway and Orders Service are running.");
    }
    if (errorMessage.includes("404")) {
      throw new Error("Load creation endpoint not found. Please check the gateway configuration.");
    }
    if (errorMessage.includes("unavailable") || errorMessage.includes("ECONNREFUSED")) {
      throw new Error("Cannot connect to gateway service. Please ensure the API Gateway is running on port 4000.");
    }
    
    throw error;
  }
}

export async function publishLoad(loadId: string): Promise<LoadOrder> {
  return gatewayJsonFetch<LoadOrder>(`/api/loads/${loadId}/publish`, {
    method: "PATCH"
  });
}

export async function fetchLoad(loadId: string): Promise<LoadOrder> {
  return gatewayJsonFetch<LoadOrder>(`/api/loads/${loadId}`, {
    headers: { Accept: "application/json" }
  });
}

