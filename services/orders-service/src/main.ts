import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    origin: "*"
  });

  const configService = app.get(ConfigService);
  // Explicitly use ORDERS_PORT - never use Render's PORT variable
  const port = process.env.ORDERS_PORT 
    ? parseInt(process.env.ORDERS_PORT, 10) 
    : configService.get<number>("PORT", 4001);

  await app.listen(port, "0.0.0.0");
  Logger.log(`Orders Service listening on http://0.0.0.0:${port}`, "Bootstrap");
}

bootstrap().catch((error) => {
  Logger.error("Failed to start Orders Service", error);
  process.exit(1);
});

