import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaClient } from "@prisma/client";
import type { AppConfiguration } from "../config/app.config";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private readonly configService: ConfigService<AppConfiguration>) {
    super({
      datasources: {
        db: {
          url:
            process.env.DATABASE_URL ??
            configService.getOrThrow<string>("DATABASE_URL")
        }
      }
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      // Verify Prisma client is properly initialized by checking if models exist
      // Note: Prisma models are added dynamically, so we check after connection
      if (typeof (this as any).loadOrder === "undefined" || typeof (this as any).trip === "undefined") {
        throw new Error(
          "Prisma client models not available. Please run 'npm run prisma:generate' in the orders-service directory."
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("models not available")) {
        throw error;
      }
      throw new Error(
        `Failed to initialize Prisma client: ${errorMessage}. Please check DATABASE_URL and run 'npm run prisma:generate'.`
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

