import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { GatewayConfiguration } from "../config/app.config";

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService<GatewayConfiguration>) {}

  getHealth() {
    return {
      status: "ok",
      services: {
        orders: this.configService.get("ORDERS_SERVICE_URL"),
        vendor: this.configService.get("VENDOR_SERVICE_URL"),
        wallet: this.configService.get("WALLET_SERVICE_URL")
      },
      timestamp: new Date().toISOString()
    };
  }
}

