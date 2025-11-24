import type { VendorSummary, VendorCapability, Address } from "@tsg/shared";
import { gatewayJsonFetch } from "./gateway";

export async function fetchVendors(): Promise<VendorSummary[]> {
  return gatewayJsonFetch<VendorSummary[]>("/api/vendors");
}

export async function fetchVendor(id: string): Promise<VendorSummary> {
  return gatewayJsonFetch<VendorSummary>(`/api/vendors/${id}`);
}

export async function createVendor(payload: {
  orgId: string;
  name: string;
  services: string[];
  address: Address;
  contactPhone?: string;
}): Promise<VendorSummary> {
  return gatewayJsonFetch<VendorSummary>("/api/vendors", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function fetchVendorCapabilities(
  vendorId: string
): Promise<VendorCapability[]> {
  return gatewayJsonFetch<VendorCapability[]>(
    `/api/vendors/${vendorId}/capabilities`
  );
}

export async function upsertVendorCapabilities(
  vendorId: string,
  payload: Record<string, unknown>
): Promise<VendorCapability[]> {
  return gatewayJsonFetch<VendorCapability[]>(
    `/api/vendors/${vendorId}/capabilities`,
    {
      method: "PUT",
      body: JSON.stringify(payload)
    }
  );
}

