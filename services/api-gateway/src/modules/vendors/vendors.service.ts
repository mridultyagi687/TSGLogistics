import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import type {
  AssignmentEvent,
  AssignmentSummary,
  VendorCapability,
  VendorSummary
} from "@tsg/shared";
import type { AxiosResponse } from "axios";

@Injectable()
export class VendorsService {
  constructor(private readonly http: HttpService) {}

  async create(payload: unknown) {
    const response = await firstValueFrom<AxiosResponse<VendorSummary>>(
      this.http.post("/vendors", payload)
    );
    return response.data;
  }

  async findAll() {
    const response = await firstValueFrom<AxiosResponse<VendorSummary[]>>(
      this.http.get("/vendors")
    );
    return response.data;
  }

  async findOne(id: string) {
    const response = await firstValueFrom<AxiosResponse<VendorSummary>>(
      this.http.get(`/vendors/${id}`)
    );
    return response.data;
  }

  async createAssignment(payload: unknown) {
    const response = await firstValueFrom<AxiosResponse<AssignmentSummary>>(
      this.http.post("/assignments", payload)
    );
    return response.data;
  }

  async listAssignments(query: Record<string, string | string[] | undefined>) {
    const response = await firstValueFrom<
      AxiosResponse<AssignmentSummary[]>
    >(
      this.http.get("/assignments", {
        params: query
      })
    );
    return response.data;
  }

  async getAssignment(id: string) {
    const response = await firstValueFrom<
      AxiosResponse<AssignmentSummary & { events: AssignmentEvent[] }>
    >(this.http.get(`/assignments/${id}`));
    return response.data;
  }

  async updateAssignmentStatus(id: string, payload: unknown) {
    const response = await firstValueFrom<AxiosResponse<AssignmentSummary>>(
      this.http.patch(`/assignments/${id}/status`, payload)
    );
    return response.data;
  }

  async createAssignmentEvent(id: string, payload: unknown) {
    const response = await firstValueFrom<AxiosResponse<AssignmentEvent>>(
      this.http.post(`/assignments/${id}/events`, payload)
    );
    return response.data;
  }

  async listAssignmentEvents(id: string) {
    const response = await firstValueFrom<AxiosResponse<AssignmentEvent[]>>(
      this.http.get(`/assignments/${id}/events`)
    );
    return response.data;
  }

  async upsertCapabilities(vendorId: string, payload: unknown) {
    const response = await firstValueFrom<AxiosResponse<VendorCapability[]>>(
      this.http.put(`/vendors/${vendorId}/capabilities`, payload)
    );
    return response.data;
  }

  async listCapabilities(vendorId: string) {
    const response = await firstValueFrom<AxiosResponse<VendorCapability[]>>(
      this.http.get(`/vendors/${vendorId}/capabilities`)
    );
    return response.data;
  }
}

