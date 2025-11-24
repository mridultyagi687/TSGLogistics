import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { GatewayConfiguration } from "../../config/app.config";
import { VendorsService } from "./vendors.service";
import { VendorsController } from "./vendors.controller";
import { VendorAssignmentsController } from "./assignments.controller";

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<GatewayConfiguration>) => ({
        baseURL: configService.get("VENDOR_SERVICE_URL"),
        timeout: 5000
      })
    })
  ],
  controllers: [VendorsController, VendorAssignmentsController],
  providers: [VendorsService]
})
export class VendorsModule {}

