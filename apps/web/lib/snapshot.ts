import type { LoadOrder, Trip } from "@tsg/shared";

export interface GatewaySnapshot {
  loads: LoadOrder[];
  trips: Trip[];
  timestamp: string;
  trigger?: string;
}

