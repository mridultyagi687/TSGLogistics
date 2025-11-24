import { HttpService } from "@nestjs/axios";
import { Injectable, Logger, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import Redis from "ioredis";
import type { LoadOrder, Trip } from "@tsg/shared";
import type { GatewayConfiguration } from "../config/app.config";

const FALLBACK_CHANNEL = "telemetry:gateway:events";
const FALLBACK_REDIS_URL = "redis://localhost:6379";

@Injectable()
export class TelemetryService implements OnModuleDestroy {
  private readonly logger = new Logger(TelemetryService.name);
  private readonly redis: Redis;
  private readonly channel: string;
  private ready = false;

  constructor(
    private readonly configService: ConfigService<GatewayConfiguration>,
    private readonly httpService: HttpService
  ) {
    const redisUrl =
      this.configService.get<string>("REDIS_URL") ?? FALLBACK_REDIS_URL;
    this.channel =
      this.configService.get<string>("TELEMETRY_CHANNEL") ??
      FALLBACK_CHANNEL;

    this.redis = new Redis(redisUrl, { lazyConnect: true });

    this.redis.on("error", (error) => {
      this.ready = false;
      this.logger.error(`Redis error: ${error.message}`, error.stack);
    });

    void this.redis.connect().then(
      () => {
        this.ready = true;
        this.logger.log(`Connected to Redis at ${redisUrl}`);
      },
      (error) => {
        this.logger.error(
          `Failed to connect to Redis at ${redisUrl}: ${error.message}`
        );
      }
    );
  }

  async broadcastSnapshot(trigger: string): Promise<void> {
    if (!this.ready) {
      return;
    }

    try {
      const ordersServiceUrl =
        this.configService.get<string>("ORDERS_SERVICE_URL") ?? "";
      const [loadsResponse, tripsResponse] = await Promise.all([
        firstValueFrom(
          this.httpService.get<LoadOrder[]>(`${ordersServiceUrl}/loads`)
        ),
        firstValueFrom(
          this.httpService.get<Trip[]>(`${ordersServiceUrl}/trips`)
        )
      ]);

      const payload = {
        loads: loadsResponse.data,
        trips: tripsResponse.data,
        timestamp: new Date().toISOString(),
        trigger
      };

      await this.redis.publish(this.channel, JSON.stringify(payload));
    } catch (error) {
      this.logger.warn(
        `Failed to broadcast telemetry snapshot after '${trigger}': ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  emitSnapshot(trigger: string): void {
    void this.broadcastSnapshot(trigger);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis.status === "end") {
      return;
    }
    await this.redis.quit();
  }
}

