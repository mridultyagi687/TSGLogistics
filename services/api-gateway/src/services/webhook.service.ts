import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Trip } from "@tsg/shared";
import type { GatewayConfiguration } from "../config/app.config";

interface TripEventPayload {
  type: "trip.completed" | "trip.cancelled";
  trip: Trip;
  emittedAt: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);
  private readonly targetUrl: string;

  constructor(
    private readonly configService: ConfigService<GatewayConfiguration>
  ) {
    this.targetUrl =
      this.configService.get<string>("TRIP_LIFECYCLE_WEBHOOK_URL") ?? "";
  }

  isEnabled(): boolean {
    return Boolean(this.targetUrl);
  }

  async emitTripEvent(type: TripEventPayload["type"], trip: Trip): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const payload: TripEventPayload = {
      type,
      trip,
      emittedAt: new Date().toISOString()
    };

    try {
      const response = await fetch(this.targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to deliver webhook (${type}) to ${this.targetUrl}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}

