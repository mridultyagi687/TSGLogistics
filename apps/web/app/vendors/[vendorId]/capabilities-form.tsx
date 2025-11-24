import { updateVendorCapabilitiesAction } from "../actions";
import { CapabilitiesFormClient } from "./capabilities-form-client";
import type { VendorCapability } from "@tsg/shared";

export function VendorCapabilitiesForm({
  vendorId,
  initialCapabilities
}: {
  vendorId: string;
  initialCapabilities: VendorCapability[];
}) {
  async function handleSubmit(formData: FormData) {
    "use server";
    const capabilitiesJson = String(formData.get("capabilities"));
    await updateVendorCapabilitiesAction(vendorId, capabilitiesJson);
  }

  const initialJson =
    initialCapabilities.length > 0
      ? JSON.stringify(initialCapabilities[0].payload, null, 2)
      : "{\n  \"capacity\": \"\",\n  \"availability\": \"\",\n  \"notes\": \"\"\n}";

  return <CapabilitiesFormClient action={handleSubmit} initialJson={initialJson} />;
}


