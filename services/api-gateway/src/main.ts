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

  // Use GATEWAY_PORT if set, otherwise fall back to PORT, otherwise default to 4000
  // But if PORT is set by Render/hosting, use GATEWAY_PORT explicitly to avoid conflicts
  const gatewayPort = process.env.GATEWAY_PORT 
    ? parseInt(process.env.GATEWAY_PORT, 10)
    : configService.get<number>("PORT", 4000);
  
  // Ensure we're not using Render's PORT environment variable
  const port = process.env.GATEWAY_PORT ? parseInt(process.env.GATEWAY_PORT, 10) : gatewayPort;

  try {
    await app.listen(port, "0.0.0.0");
    Logger.log(`API Gateway listening on http://0.0.0.0:${port}`, "Bootstrap");
  } catch (error: any) {
    if (error?.code === "EADDRINUSE") {
      Logger.error(`Port ${port} is already in use. Please check if another service is using this port.`, "Bootstrap");
      Logger.error("If running on Render, ensure GATEWAY_PORT is set to 4000 and PORT is used by Next.js only", "Bootstrap");
    }
    throw error;
  }
}

bootstrap().catch((error) => {
  Logger.error("Failed to start API Gateway", error);
  Logger.error("Error details:", {
    message: error?.message,
    code: error?.code,
    port: process.env.GATEWAY_PORT || process.env.PORT || 4000
  });
  process.exit(1);
});

