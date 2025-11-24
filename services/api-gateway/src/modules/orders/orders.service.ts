import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import type { LoadOrder, Trip } from "@tsg/shared";
import type { AxiosResponse } from "axios";
import { TelemetryService } from "../../services/telemetry.service";
import { WebhookService } from "../../services/webhook.service";

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly http: HttpService,
    private readonly telemetry: TelemetryService,
    private readonly webhook: WebhookService
  ) {}

  private notify(trigger: string) {
    try {
      this.telemetry.emitSnapshot(trigger);
    } catch (error) {
      this.logger.warn(
        `Failed to queue telemetry snapshot after '${trigger}': ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  async createLoad(payload: unknown) {
    try {
      const response = await firstValueFrom<AxiosResponse<LoadOrder>>(
        this.http.post("/loads", payload)
      );
      const data = response.data;
      this.notify("load.created");
      return data;
    } catch (error) {
      this.logger.error("Failed to create load", error);
      if (error && typeof error === "object" && "code" in error) {
        if (error.code === "ECONNREFUSED" || error.code === "ETIMEDOUT") {
          throw new Error(
            "Orders service is unavailable. Please ensure the orders service is running on port 4001."
          );
        }
      }
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown } };
        if (axiosError.response) {
          this.logger.error(
            `Orders service returned ${axiosError.response.status}`,
            axiosError.response.data
          );
          throw new Error(
            `Orders service error: ${JSON.stringify(axiosError.response.data)}`
          );
        }
      }
      throw error;
    }
  }

  async publishLoad(id: string) {
    const response = await firstValueFrom<AxiosResponse<LoadOrder>>(
      this.http.patch(`/loads/${id}/publish`, {})
    );
    const data = response.data;
    this.notify("load.published");
    return data;
  }

  async listLoads() {
    const response = await firstValueFrom<AxiosResponse<LoadOrder[]>>(
      this.http.get("/loads")
    );
    return response.data;
  }

  async getLoad(id: string) {
    const response = await firstValueFrom<AxiosResponse<LoadOrder>>(
      this.http.get(`/loads/${id}`)
    );
    return response.data;
  }

  async linkLoadAssignment(id: string, payload: unknown) {
    const response = await firstValueFrom<AxiosResponse<LoadOrder>>(
      this.http.patch(`/loads/${id}/assignment`, payload)
    );
    const data = response.data;
    this.notify("load.assignment.linked");
    return data;
  }

  async updateLoadAssignmentStatus(id: string, payload: unknown) {
    const response = await firstValueFrom<AxiosResponse<LoadOrder>>(
      this.http.patch(`/loads/${id}/assignment/status`, payload)
    );
    const data = response.data;
    this.notify("load.assignment.updated");
    return data;
  }

  async clearLoadAssignment(id: string) {
    const response = await firstValueFrom<AxiosResponse<LoadOrder>>(
      this.http.delete(`/loads/${id}/assignment`)
    );
    const data = response.data;
    this.notify("load.assignment.cleared");
    return data;
  }

  async createTrip(payload: unknown) {
    const response = await firstValueFrom<AxiosResponse<Trip>>(
      this.http.post("/trips", payload)
    );
    const data = response.data;
    this.notify("trip.created");
    return data;
  }

  async startTrip(id: string) {
    const response = await firstValueFrom<AxiosResponse<Trip>>(
      this.http.patch(`/trips/${id}/start`, {})
    );
    const data = response.data;
    this.notify("trip.started");
    return data;
  }

  async completeTrip(id: string) {
    const response = await firstValueFrom<AxiosResponse<Trip>>(
      this.http.patch(`/trips/${id}/complete`, {})
    );
    const data = response.data;
    this.notify("trip.completed");
    void this.webhook.emitTripEvent("trip.completed", data);
    return data;
  }

  async cancelTrip(id: string, payload?: { reason?: string }) {
    const response = await firstValueFrom<AxiosResponse<Trip>>(
      this.http.patch(`/trips/${id}/cancel`, payload ?? {})
    );
    const data = response.data;
    this.notify("trip.cancelled");
    void this.webhook.emitTripEvent("trip.cancelled", data);
    return data;
  }

  async listTrips() {
    const response = await firstValueFrom<AxiosResponse<Trip[]>>(
      this.http.get("/trips")
    );
    return response.data;
  }

  async getTrip(id: string) {
    const response = await firstValueFrom<AxiosResponse<Trip>>(
      this.http.get(`/trips/${id}`)
    );
    return response.data;
  }
}

