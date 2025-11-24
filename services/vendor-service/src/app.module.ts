import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/app.config";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./controllers/health.controller";
import { AppService } from "./services/app.service";
import { VendorsModule } from "./modules/vendors/vendors.module";
import { AssignmentsModule } from "./modules/assignments/assignments.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    PrismaModule,
    VendorsModule,
    AssignmentsModule
  ],
  controllers: [HealthController],
  providers: [AppService]
})
export class AppModule {}

