import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors({ origin: "*" });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 4003);

  await app.listen(port, "0.0.0.0");
  Logger.log(`Wallet Service listening on http://0.0.0.0:${port}`, "Bootstrap");
}

bootstrap().catch((error) => {
  Logger.error("Failed to start Wallet Service", error);
  process.exit(1);
});

