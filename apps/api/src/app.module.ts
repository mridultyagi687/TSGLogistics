import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/app.config";
import { HealthController } from "./controllers/health.controller";
import { AppService } from "./services/app.service";
import { LoadsModule } from "./modules/loads/loads.module";
import { TripsModule } from "./modules/trips/trips.module";
import { VendorsModule } from "./modules/vendors/vendors.module";
import { WalletModule } from "./modules/wallet/wallet.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    PrismaModule,
    LoadsModule,
    TripsModule,
    VendorsModule,
    WalletModule
  ],
  controllers: [HealthController],
  providers: [AppService]
})
export class AppModule {}

