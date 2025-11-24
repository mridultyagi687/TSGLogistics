import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import type { AxiosResponse } from "axios";
import type { LoadAssignmentStatus, LoadOrder } from "@tsg/shared";
import type { AssignmentWorkerConfiguration } from "../config/app.config";

@Injectable()
export class OrdersHttpService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService<AssignmentWorkerConfiguration>
  ) {
    this.baseUrl =
      this.configService.get<string>("ORDERS_SERVICE_URL") ??
      "http://localhost:4001";
  }

  async listLoads(): Promise<LoadOrder[]> {
    const response = (await firstValueFrom(
      this.http.get<LoadOrder[]>(`${this.baseUrl}/loads`)
    )) as AxiosResponse<LoadOrder[]>;
    return response.data;
  }

  async linkAssignment(
    loadId: string,
    payload: {
      assignmentId: string;
      metadata?: Record<string, unknown>;
      status?: LoadAssignmentStatus;
      lockedAt?: Date;
    }
  ): Promise<LoadOrder> {
    const response = (await firstValueFrom(
      this.http.patch<LoadOrder>(
        `${this.baseUrl}/loads/${loadId}/assignment`,
        payload
      )
    )) as AxiosResponse<LoadOrder>;
    return response.data;
  }

  async updateAssignmentStatus(
    loadId: string,
    payload: {
      status: LoadAssignmentStatus;
      metadata?: Record<string, unknown>;
      lockedAt?: Date;
    }
  ): Promise<LoadOrder> {
    const response = (await firstValueFrom(
      this.http.patch<LoadOrder>(
        `${this.baseUrl}/loads/${loadId}/assignment/status`,
        payload
      )
    )) as AxiosResponse<LoadOrder>;
    return response.data;
  }
}
