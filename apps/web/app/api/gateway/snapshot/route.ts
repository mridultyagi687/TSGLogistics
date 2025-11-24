import { NextResponse } from "next/server";
import { fetchLoads } from "../../../../lib/loads";
import { fetchTrips } from "../../../../lib/trips";
import type { GatewaySnapshot } from "../../../../lib/snapshot";

export async function GET() {
  try {
    const [loads, trips] = await Promise.all([fetchLoads(), fetchTrips()]);
    const payload: GatewaySnapshot = {
      loads,
      trips,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load gateway snapshot."
      },
      { status: 502 }
    );
  }
}

