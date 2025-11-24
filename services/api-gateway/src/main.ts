import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  const configService = app.get(ConfigService);
  const origins =
    configService
      .get<string>("CORS_ORIGINS", "http://localhost:3000")
      ?.split(",")
      .map((origin) => origin.trim()) ?? [];

  app.enableCors({
    origin: origins,
    credentials: true
  });

  const port = configService.get<number>("PORT", 4000);

  await app.listen(port);
  Logger.log(`API Gateway listening on http://localhost:${port}`, "Bootstrap");
}

bootstrap().catch((error) => {
  Logger.error("Failed to start API Gateway", error);
  process.exit(1);
});

