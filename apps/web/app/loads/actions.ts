"use server";

import { revalidatePath } from "next/cache";
import type { Address } from "@tsg/shared";
import { createLoad, publishLoad } from "../../lib/loads";
import {
  scheduleTripFromLoad,
  startTrip,
  completeTrip,
  cancelTrip,
  type LoadForTrip
} from "../../lib/trips";
import { getGatewaySession } from "../../lib/auth";

export type CreateLoadFormState =
  | { status: "idle" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const REQUIRED_FIELDS = [
  "orgId",
  "referenceCode",
  "pickup_line1",
  "pickup_city",
  "pickup_state",
  "pickup_postalCode",
  "pickup_country",
  "drop_line1",
  "drop_city",
  "drop_state",
  "drop_postalCode",
  "drop_country",
  "cargoType",
  "cargoValue",
  "slaHours",
  "vehicleType"
] as const;

function toAddress(prefix: "pickup" | "drop", formData: FormData): Address {
  const base = {
    line1: String(formData.get(`${prefix}_line1`) ?? "").trim(),
    line2: String(formData.get(`${prefix}_line2`) ?? "").trim(),
    city: String(formData.get(`${prefix}_city`) ?? "").trim(),
    state: String(formData.get(`${prefix}_state`) ?? "").trim(),
    postalCode: String(formData.get(`${prefix}_postalCode`) ?? "").trim(),
    country: String(formData.get(`${prefix}_country`) ?? "").trim()
  };

  const latitude = formData.get(`${prefix}_latitude`);
  const longitude = formData.get(`${prefix}_longitude`);

  return {
    ...base,
    line2: base.line2.length > 0 ? base.line2 : undefined,
    latitude:
      latitude !== null && latitude !== ""
        ? Number.parseFloat(String(latitude))
        : undefined,
    longitude:
      longitude !== null && longitude !== ""
        ? Number.parseFloat(String(longitude))
        : undefined
  };
}

export async function createLoadAction(
  _prevState: CreateLoadFormState,
  formData: FormData
): Promise<CreateLoadFormState> {
  for (const field of REQUIRED_FIELDS) {
    const value = formData.get(field);
    if (!value || String(value).trim().length === 0) {
      return {
        status: "error",
        message: "Please fill in all required fields before submitting."
      };
    }
  }

  const cargoValue = Number.parseFloat(String(formData.get("cargoValue")));
  const slaHours = Number.parseInt(String(formData.get("slaHours")), 10);

  if (!Number.isFinite(cargoValue) || cargoValue <= 0) {
    return { status: "error", message: "Cargo value must be a positive number." };
  }

  if (!Number.isFinite(slaHours) || slaHours <= 0) {
    return { status: "error", message: "SLA hours must be a positive integer." };
  }

  try {
    await createLoad({
      orgId: String(formData.get("orgId")).trim(),
      referenceCode: String(formData.get("referenceCode")).trim(),
      pickup: toAddress("pickup", formData),
      drop: toAddress("drop", formData),
      cargoType: String(formData.get("cargoType")).trim(),
      cargoValue,
      slaHours,
      vehicleType: String(formData.get("vehicleType")).trim()
    });

    revalidatePath("/loads");

    return {
      status: "success",
      message: "Load draft created via gateway."
    };
  } catch (error) {
    console.error("[createLoadAction] Error creating load:", error);
    const errorMessage = error instanceof Error ? error.message : "Unexpected error creating load.";
    
    // Provide more helpful error messages
    let friendlyMessage = errorMessage;
    if (errorMessage.includes("404") || errorMessage.includes("not found")) {
      friendlyMessage = "Gateway service endpoint not found. Please check if the API Gateway is running.";
    } else if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("connection refused")) {
      friendlyMessage = "Cannot connect to gateway service. Please ensure the API Gateway (port 4000) is running.";
    } else if (errorMessage.includes("unavailable") || errorMessage.includes("Gateway service")) {
      friendlyMessage = "Gateway service is not available. Please check if the API Gateway and Orders Service are running.";
    }
    
    return {
      status: "error",
      message: friendlyMessage
    };
  }
}

export async function publishLoadCommand(formData: FormData): Promise<void> {
  const loadId = String(formData.get("loadId") ?? "").trim();
  if (!loadId) {
    throw new Error("Missing load identifier.");
  }

  await publishLoad(loadId);
  revalidatePath("/loads");
}

export async function scheduleTripCommand(formData: FormData): Promise<void> {
  const rawLoad = formData.get("load");
  if (!rawLoad || typeof rawLoad !== "string") {
    throw new Error("Missing load payload.");
  }

  const load = JSON.parse(rawLoad) as LoadForTrip;
  await scheduleTripFromLoad(load);
  revalidatePath("/loads");
}

export async function startTripCommand(formData: FormData): Promise<void> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  if (!tripId) {
    throw new Error("Missing trip identifier.");
  }

  await startTrip(tripId);
  revalidatePath("/loads");
}

export async function completeTripCommand(formData: FormData): Promise<void> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  if (!tripId) {
    throw new Error("Missing trip identifier.");
  }

  await completeTrip(tripId);
  revalidatePath("/loads");
}

export async function cancelTripCommand(formData: FormData): Promise<void> {
  const tripId = String(formData.get("tripId") ?? "").trim();
  if (!tripId) {
    throw new Error("Missing trip identifier.");
  }

  const reason = formData.get("reason");

  await cancelTrip(
    tripId,
    reason && typeof reason === "string" && reason.trim().length > 0
      ? reason.trim()
      : undefined
  );
  revalidatePath("/loads");
}

export async function currentGatewaySession() {
  return getGatewaySession();
}

