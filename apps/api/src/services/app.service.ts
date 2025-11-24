import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AppConfiguration } from "../config/app.config";

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService<AppConfiguration>) {}

  getHealth() {
    return {
      status: "ok",
      service: this.configService.get<string>("APP_NAME"),
      timestamp: new Date().toISOString()
    };
  }
}

