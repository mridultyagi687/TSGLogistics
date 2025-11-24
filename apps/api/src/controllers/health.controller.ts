import { Controller, Get } from "@nestjs/common";
import { AppService } from "../services/app.service";

@Controller()
export class HealthController {
  constructor(private readonly appService: AppService) {}

  @Get("/health")
  health() {
    return this.appService.getHealth();
  }
}

