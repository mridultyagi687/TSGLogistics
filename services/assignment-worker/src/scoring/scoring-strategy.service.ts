import { Injectable } from "@nestjs/common";
import type {
  LoadOrder,
  VendorCapability,
  VendorSummary
} from "@tsg/shared";

export interface ScoredVendor {
  vendor: VendorSummary;
  capabilities: VendorCapability[];
  score: number;
  metadata: Record<string, unknown>;
}

@Injectable()
export class ScoringStrategyService {
  scoreCandidates(
    load: LoadOrder,
    candidates: Array<{ vendor: VendorSummary; capabilities: VendorCapability[] }>
  ): ScoredVendor[] {
    return candidates
      .map(({ vendor, capabilities }) => {
        const supportsVehicle = this.supportsVehicleType(
          capabilities,
          load.vehicleType
        );
        const routeScore = this.routeCoverage(capabilities, load);
        const ratingScore = vendor.rating ? vendor.rating / 5 : 0.5;

        const score = Number(
          (supportsVehicle ? 0.4 : 0) + routeScore * 0.4 + ratingScore * 0.2
        );

        return {
          vendor,
          capabilities,
          score,
          metadata: {
            supportsVehicle,
            routeScore,
            ratingScore
          }
        } as ScoredVendor;
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  private supportsVehicleType(
    capabilities: VendorCapability[],
    vehicleType: string
  ): boolean {
    return capabilities.some((capability) => {
      const fleetTypes = (capability.payload?.fleetTypes ?? []) as string[];
      return fleetTypes.includes(vehicleType);
    });
  }

  private routeCoverage(
    capabilities: VendorCapability[],
    load: LoadOrder
  ): number {
    const pickupCity = load.pickup.city.toUpperCase();
    const dropCity = load.drop.city.toUpperCase();
    const targetRoute = `${pickupCity}-${dropCity}`;

    const matches = capabilities.some((capability) => {
      const routes = (capability.payload?.routeCoverage ?? []) as string[];
      return routes.map((route) => route.toUpperCase()).includes(targetRoute);
    });

    return matches ? 1 : 0.5;
  }
}
