"use server";

import { revalidatePath } from "next/cache";
import { createVendor, upsertVendorCapabilities } from "../../lib/vendors";
import type { Address } from "@tsg/shared";

export async function createVendorAction(formData: FormData) {
  const address: Address = {
    line1: String(formData.get("address_line1")),
    line2: String(formData.get("address_line2")) || undefined,
    city: String(formData.get("address_city")),
    state: String(formData.get("address_state")),
    postalCode: String(formData.get("address_postalCode")),
    country: String(formData.get("address_country")),
    latitude: formData.get("address_latitude")
      ? Number.parseFloat(String(formData.get("address_latitude")))
      : undefined,
    longitude: formData.get("address_longitude")
      ? Number.parseFloat(String(formData.get("address_longitude")))
      : undefined
  };

  const selectedServices = Array.from(formData.getAll("services")) as string[];

  const vendor = await createVendor({
    orgId: String(formData.get("orgId")),
    name: String(formData.get("name")),
    services: selectedServices,
    address,
    contactPhone: String(formData.get("contactPhone")) || undefined
  });

  revalidatePath("/vendors");
  return vendor;
}

export async function updateVendorCapabilitiesAction(
  vendorId: string,
  capabilitiesJson: string
) {
  const payload = JSON.parse(capabilitiesJson);
  await upsertVendorCapabilities(vendorId, payload);
  revalidatePath(`/vendors/${vendorId}`);
}

