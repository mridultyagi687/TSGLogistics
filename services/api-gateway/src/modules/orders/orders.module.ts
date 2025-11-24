import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { OrdersService } from "./orders.service";
import { LoadsController } from "./controllers/loads.controller";
import { TripsController } from "./controllers/trips.controller";
import { ConfigService } from "@nestjs/config";
import type { GatewayConfiguration } from "../../config/app.config";
import { TelemetryService } from "../../services/telemetry.service";
import { WebhookService } from "../../services/webhook.service";

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<GatewayConfiguration>) => ({
        baseURL: configService.get("ORDERS_SERVICE_URL"),
        timeout: 5000
      })
    })
  ],
  controllers: [LoadsController, TripsController],
  providers: [OrdersService, TelemetryService, WebhookService]
})
export class OrdersModule {}

