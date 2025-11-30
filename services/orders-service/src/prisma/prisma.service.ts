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
    // Always use DATABASE_URL from config service (which includes schema parameter)
    // Don't use process.env.DATABASE_URL directly as it may not have the schema
    super({
      datasources: {
        db: {
          url: configService.getOrThrow<string>("DATABASE_URL")
        }
      }
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      // Verify Prisma client is properly initialized
      // Note: We don't check for specific models as they're dynamically added by Prisma
      // The connection itself is sufficient proof that Prisma client is working
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[PrismaService] Failed to connect to database:", {
        message: errorMessage,
        databaseUrl: this.configService.get<string>("DATABASE_URL")?.substring(0, 50) + "..."
      });
      throw new Error(
        `Failed to initialize Prisma client: ${errorMessage}. Please check DATABASE_URL and ensure Prisma client was generated during build.`
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

