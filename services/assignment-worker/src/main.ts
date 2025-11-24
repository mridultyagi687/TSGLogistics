import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn']
  });
  const logger = new Logger("AssignmentWorkerBootstrap");
  logger.log("Assignment worker started");

  process.on("SIGTERM", async () => {
    logger.log("SIGTERM received, closing assignment worker context");
    await app.close();
    process.exit(0);
  });

  process.on("SIGINT", async () => {
    logger.log("SIGINT received, closing assignment worker context");
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start assignment worker", error);
  process.exit(1);
});
