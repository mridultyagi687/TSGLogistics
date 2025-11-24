import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: ["http://localhost:3000"],
    credentials: true
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>("PORT", 4000);

  await app.listen(port);
  Logger.log(`API listening on http://localhost:${port}`, "Bootstrap");
}

bootstrap().catch((error) => {
  Logger.error("Failed to start API", error);
  process.exit(1);
});

