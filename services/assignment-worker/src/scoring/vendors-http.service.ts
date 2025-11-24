import { HttpService } from "@nestjs/axios";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import type { AxiosResponse } from "axios";
import type {
  AssignmentEvent,
  AssignmentStatus,
  AssignmentSummary,
  VendorCapability,
  VendorSummary
} from "@tsg/shared";
import type { AssignmentWorkerConfiguration } from "../config/app.config";

@Injectable()
export class VendorsHttpService {
  private readonly logger = new Logger(VendorsHttpService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly configService: ConfigService<AssignmentWorkerConfiguration>
  ) {
    this.baseUrl =
      this.configService.get<string>("VENDOR_SERVICE_URL") ??
      "http://localhost:4002";
  }

  async listVendors(): Promise<VendorSummary[]> {
    const response = (await firstValueFrom(
      this.http.get<VendorSummary[]>(`${this.baseUrl}/vendors`)
    )) as AxiosResponse<VendorSummary[]>;
    return response.data;
  }

  async listCapabilities(vendorId: string): Promise<VendorCapability[]> {
    const response = (await firstValueFrom(
      this.http.get<VendorCapability[]>(
        `${this.baseUrl}/vendors/${vendorId}/capabilities`
      )
    )) as AxiosResponse<VendorCapability[]>;
    return response.data;
  }

  async createAssignment(payload: {
    orgId: string;
    vendorId: string;
    loadId: string;
    tripId?: string;
    score?: number;
    metadata?: Record<string, unknown>;
  }): Promise<AssignmentSummary> {
    const response = (await firstValueFrom(
      this.http.post<AssignmentSummary>(`${this.baseUrl}/assignments`, payload)
    )) as AxiosResponse<AssignmentSummary>;
    return response.data;
  }

  async updateAssignmentStatus(
    assignmentId: string,
    status: AssignmentStatus,
    metadata?: Record<string, unknown>
  ): Promise<AssignmentSummary> {
    const response = (await firstValueFrom(
      this.http.patch<AssignmentSummary>(
        `${this.baseUrl}/assignments/${assignmentId}/status`,
        {
          status,
          metadata
        }
      )
    )) as AxiosResponse<AssignmentSummary>;
    return response.data;
  }

  async appendAssignmentEvent(
    assignmentId: string,
    type: AssignmentEvent["type"],
    payload?: Record<string, unknown>
  ): Promise<AssignmentEvent> {
    const response = (await firstValueFrom(
      this.http.post<AssignmentEvent>(
        `${this.baseUrl}/assignments/${assignmentId}/events`,
        {
          type,
          payload
        }
      )
    )) as AxiosResponse<AssignmentEvent>;
    return response.data;
  }
}
