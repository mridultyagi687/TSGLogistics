import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import configuration from "./config/app.config";
import { HealthController } from "./controllers/health.controller";
import { HealthService } from "./services/health.service";
import { OrdersModule } from "./modules/orders/orders.module";
import { VendorsModule } from "./modules/vendors/vendors.module";
import { WalletModule } from "./modules/wallet/wallet.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    HttpModule.register({}),
    OrdersModule,
    VendorsModule,
    WalletModule
  ],
  controllers: [HealthController],
  providers: [HealthService]
})
export class AppModule {}

