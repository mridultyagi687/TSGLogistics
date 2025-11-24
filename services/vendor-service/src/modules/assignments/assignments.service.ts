import { Injectable, NotFoundException } from "@nestjs/common";
import {
  Assignment as PrismaAssignment,
  AssignmentEvent as PrismaAssignmentEvent,
  AssignmentEventType as PrismaAssignmentEventType,
  AssignmentStatus as PrismaAssignmentStatus,
  Prisma,
  VendorCapability as PrismaVendorCapability
} from "@prisma/client";
import type {
  AssignmentEvent,
  AssignmentStatus,
  AssignmentSummary,
  VendorCapability
} from "@tsg/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateAssignmentDto } from "./dto/create-assignment.dto";
import { UpdateAssignmentStatusDto } from "./dto/update-assignment-status.dto";
import { CreateAssignmentEventDto } from "./dto/create-assignment-event.dto";
import { QueryAssignmentsDto } from "./dto/query-assignments.dto";
import { UpsertCapabilitiesDto } from "./dto/upsert-capability.dto";

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createAssignment(payload: CreateAssignmentDto): Promise<AssignmentSummary> {
    const assignment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.assignment.create({
        data: {
          orgId: payload.orgId,
          vendorId: payload.vendorId,
          loadId: payload.loadId,
          tripId: payload.tripId,
          score: payload.score,
          metadata: this.toJsonInput(payload.metadata)
        }
      });

      await tx.assignmentEvent.create({
        data: {
          assignmentId: created.id,
          type: PrismaAssignmentEventType.CREATED,
          payload: this.toJsonInput(payload.metadata)
        }
      });

      return created;
    });

    return this.mapAssignment(assignment);
  }

  async listAssignments(query: QueryAssignmentsDto): Promise<AssignmentSummary[]> {
    const { orgId, vendorId, loadId, statuses } = query;
    const assignments = await this.prisma.assignment.findMany({
      where: {
        orgId: orgId ?? undefined,
        vendorId: vendorId ?? undefined,
        loadId: loadId ?? undefined,
        status: statuses && statuses.length > 0
          ? {
              in: statuses.map((status) =>
                this.toPrismaStatus(status)
              )
            }
          : undefined
      },
      orderBy: { createdAt: "desc" }
    });

    return assignments.map((assignment) => this.mapAssignment(assignment));
  }

  async getAssignment(id: string): Promise<AssignmentSummary & { events: AssignmentEvent[] }> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      include: { events: { orderBy: { occurredAt: "desc" } } }
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment ${id} not found`);
    }

    return {
      ...this.mapAssignment(assignment),
      events: assignment.events.map((event) => this.mapAssignmentEvent(event))
    };
  }

  async updateAssignmentStatus(
    id: string,
    payload: UpdateAssignmentStatusDto
  ): Promise<AssignmentSummary> {
    const eventType = this.toEventType(payload.status);

    const assignment = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.assignment.update({
        where: { id },
        data: {
          status: this.toPrismaStatus(payload.status),
          metadata: this.toJsonInput(payload.metadata),
          updatedAt: new Date()
        }
      });

      await tx.assignmentEvent.create({
        data: {
          assignmentId: updated.id,
          type: eventType,
          payload: this.toJsonInput(payload.metadata)
        }
      });

      return updated;
    });

    return this.mapAssignment(assignment);
  }

  async recordEvent(
    id: string,
    payload: CreateAssignmentEventDto
  ): Promise<AssignmentEvent> {
    const exists = await this.prisma.assignment.findUnique({
      where: { id },
      select: { id: true }
    });
    if (!exists) {
      throw new NotFoundException(`Assignment ${id} not found`);
    }

    const event = await this.prisma.assignmentEvent.create({
      data: {
        assignmentId: id,
        type: payload.type as PrismaAssignmentEventType,
        payload: this.toJsonInput(payload.payload)
      }
    });

    return this.mapAssignmentEvent(event);
  }

  async listEvents(id: string): Promise<AssignmentEvent[]> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id },
      select: { id: true }
    });
    if (!assignment) {
      throw new NotFoundException(`Assignment ${id} not found`);
    }

    const events = await this.prisma.assignmentEvent.findMany({
      where: { assignmentId: id },
      orderBy: { occurredAt: "desc" }
    });

    return events.map((event) => this.mapAssignmentEvent(event));
  }

  async upsertCapabilities(
    vendorId: string,
    payload: UpsertCapabilitiesDto
  ): Promise<VendorCapability[]> {
    await this.ensureVendorExists(vendorId);

    await this.prisma.vendorCapability.deleteMany({
      where: { vendorId }
    });

    if (payload.capabilities.length === 0) {
      return [];
    }

    const created = await Promise.all(
      payload.capabilities.map((capability) =>
        this.prisma.vendorCapability.create({
          data: {
            vendorId,
            payload: capability.payload as Prisma.InputJsonValue
          }
        })
      )
    );

    return created.map((capability) => this.mapCapability(capability));
  }

  async listCapabilities(vendorId: string): Promise<VendorCapability[]> {
    await this.ensureVendorExists(vendorId);

    const capabilities = await this.prisma.vendorCapability.findMany({
      where: { vendorId },
      orderBy: { createdAt: "desc" }
    });

    return capabilities.map((capability) => this.mapCapability(capability));
  }

  private mapAssignment(record: PrismaAssignment): AssignmentSummary {
    return {
      id: record.id,
      orgId: record.orgId,
      vendorId: record.vendorId,
      loadId: record.loadId,
      tripId: record.tripId ?? undefined,
      status: record.status as AssignmentStatus,
      score: record.score ?? undefined,
      metadata: this.coerceJson(record.metadata),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }

  private mapAssignmentEvent(
    record: PrismaAssignmentEvent
  ): AssignmentEvent {
    return {
      id: record.id,
      assignmentId: record.assignmentId,
      type: record.type as AssignmentEvent["type"],
      occurredAt: record.occurredAt.toISOString(),
      payload: this.coerceJson(record.payload),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }

  private mapCapability(
    record: PrismaVendorCapability
  ): VendorCapability {
    return {
      id: record.id,
      vendorId: record.vendorId,
      payload: this.coerceJson(record.payload) ?? {},
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }

  private toJsonInput(
    value: unknown
  ): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
    if (value === undefined) {
      return undefined;
    }
    if (value === null) {
      return Prisma.JsonNull;
    }
    return value as Prisma.InputJsonValue;
  }

  private toPrismaStatus(status: AssignmentStatus): PrismaAssignmentStatus {
    return status as PrismaAssignmentStatus;
  }

  private toEventType(status: AssignmentStatus): PrismaAssignmentEventType {
    switch (status) {
      case "OFFERED":
        return PrismaAssignmentEventType.OFFERED;
      case "ACCEPTED":
        return PrismaAssignmentEventType.ACCEPTED;
      case "DECLINED":
        return PrismaAssignmentEventType.DECLINED;
      case "CANCELLED":
        return PrismaAssignmentEventType.CANCELLED;
      case "EXPIRED":
        return PrismaAssignmentEventType.EXPIRED;
      case "PENDING":
      default:
        return PrismaAssignmentEventType.NOTE_ADDED;
    }
  }

  private async ensureVendorExists(vendorId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
      select: { id: true }
    });
    if (!vendor) {
      throw new NotFoundException(`Vendor ${vendorId} not found`);
    }
  }

  private coerceJson(
    value: Prisma.JsonValue | null | undefined
  ): Record<string, unknown> | undefined {
    if (
      value === null ||
      value === undefined ||
      typeof value !== "object" ||
      Array.isArray(value)
    ) {
      return undefined;
    }
    return value as Record<string, unknown>;
  }
}

