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
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

