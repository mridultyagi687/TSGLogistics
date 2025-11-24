import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import type { GatewayConfiguration } from "../../config/app.config";
import { WalletService } from "./wallet.service";
import { WalletController } from "./wallet.controller";

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<GatewayConfiguration>) => ({
        baseURL: configService.get("WALLET_SERVICE_URL"),
        timeout: 5000
      })
    })
  ],
  controllers: [WalletController],
  providers: [WalletService]
})
export class WalletModule {}

