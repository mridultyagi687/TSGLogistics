import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/app.config";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./controllers/health.controller";
import { AppService } from "./services/app.service";
import { LoadsModule } from "./modules/loads/loads.module";
import { TripsModule } from "./modules/trips/trips.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    PrismaModule,
    LoadsModule,
    TripsModule
  ],
  controllers: [HealthController],
  providers: [AppService]
})
export class AppModule {}

