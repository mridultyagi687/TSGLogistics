import type { Address, Trip } from "@tsg/shared";
import { gatewayJsonFetch } from "./gateway";

const HOUR = 60 * 60 * 1000;

export interface LoadForTrip {
  id: string;
  pickup: Address;
  drop: Address;
  slaHours: number;
}

function toTripStop(address: Address, offsetHours = 0) {
  const now = Date.now();
  const arrival = new Date(now + offsetHours * HOUR);
  const departure = new Date(now + (offsetHours + 1) * HOUR);

  return {
    plannedArrival: arrival.toISOString(),
    plannedDeparture: departure.toISOString(),
    addressLine1: address.line1,
    addressLine2: address.line2,
    city: address.city,
    state: address.state,
    country: address.country,
    postalCode: address.postalCode,
    latitude: address.latitude,
    longitude: address.longitude
  };
}

export async function fetchTrips(): Promise<Trip[]> {
  try {
    const trips = await gatewayJsonFetch<Trip[]>("/api/trips", {
      headers: { Accept: "application/json" }
    });

    return trips.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.error("Failed to fetch trips:", error);
    return [];
  }
}

export async function scheduleTripFromLoad(load: LoadForTrip): Promise<Trip> {
  const stops = [
    toTripStop(load.pickup, 0),
    toTripStop(load.drop, Math.max(load.slaHours - 2, 2))
  ];

  return gatewayJsonFetch<Trip>("/api/trips", {
    method: "POST",
    body: JSON.stringify({
      loadId: load.id,
      stops
    })
  });
}

export async function startTrip(tripId: string): Promise<Trip> {
  return gatewayJsonFetch<Trip>(`/api/trips/${tripId}/start`, {
    method: "PATCH"
  });
}

export async function completeTrip(tripId: string): Promise<Trip> {
  return gatewayJsonFetch<Trip>(`/api/trips/${tripId}/complete`, {
    method: "PATCH"
  });
}

export async function cancelTrip(
  tripId: string,
  reason?: string
): Promise<Trip> {
  return gatewayJsonFetch<Trip>(`/api/trips/${tripId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify(
      reason ? { reason } : {}
    )
  });
}

