import { Injectable, NotFoundException } from "@nestjs/common";
import {
  Prisma,
  LoadOrder as PrismaLoadOrder,
  LoadStatus as PrismaLoadStatus,
  LoadAssignmentStatus as PrismaLoadAssignmentStatus
} from "@prisma/client";
import type {
  Address,
  LoadOrder,
  LoadStatus,
  LoadAssignmentStatus
} from "@tsg/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateLoadDto } from "./dto/create-load.dto";
import { LinkAssignmentDto } from "./dto/link-assignment.dto";
import { UpdateLoadAssignmentStatusDto } from "./dto/update-assignment-status.dto";

type PriceQuoteBand = {
  min: number;
  max: number;
  currency: string;
  confidence: number;
};

const DEFAULT_PRICE_QUOTE: PriceQuoteBand = {
  min: 0,
  max: 0,
  currency: "INR",
  confidence: 0
};

@Injectable()
export class LoadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateLoadDto): Promise<LoadOrder> {
    if (!this.prisma?.loadOrder) {
      throw new Error("Prisma client not available. Please ensure Prisma client is generated and DATABASE_URL is set.");
    }
    const record = await this.prisma.loadOrder.create({
      data: {
        orgId: payload.orgId,
        referenceCode: payload.referenceCode,
        pickup: this.serializeAddress(payload.pickup),
        drop: this.serializeAddress(payload.drop),
        cargoType: payload.cargoType,
        cargoValue: payload.cargoValue,
        slaHours: payload.slaHours,
        vehicleType: payload.vehicleType,
        status: PrismaLoadStatus.DRAFT,
        priceQuoteBand: DEFAULT_PRICE_QUOTE
      }
    });

    return this.mapLoad(record);
  }

  async publish(id: string): Promise<LoadOrder> {
    try {
      const record = await this.prisma.loadOrder.update({
        where: { id },
        data: {
          status: PrismaLoadStatus.PUBLISHED,
          assignmentStatus: PrismaLoadAssignmentStatus.SOURCING,
          assignmentLockedAt: new Date()
        }
      });

      return this.mapLoad(record);
    } catch (error) {
      this.handleNotFound(error, id, "Load");
      throw error;
    }
  }

  async linkAssignment(
    id: string,
    payload: LinkAssignmentDto
  ): Promise<LoadOrder> {
    try {
      const record = await this.prisma.loadOrder.update({
        where: { id },
        data: {
          assignmentId: payload.assignmentId,
          assignmentStatus: this.toPrismaAssignmentStatus(
            payload.status ?? "OFFERED"
          ),
          assignmentMetadata: payload.metadata
            ? (payload.metadata as Prisma.InputJsonValue)
            : undefined,
          assignmentLockedAt: payload.lockedAt ?? new Date()
        }
      });

      return this.mapLoad(record);
    } catch (error) {
      this.handleNotFound(error, id, "Load");
      throw error;
    }
  }

  async updateAssignmentStatus(
    id: string,
    payload: UpdateLoadAssignmentStatusDto
  ): Promise<LoadOrder> {
    try {
      const record = await this.prisma.loadOrder.update({
        where: { id },
        data: {
          assignmentStatus: this.toPrismaAssignmentStatus(payload.status),
          assignmentMetadata: payload.metadata
            ? (payload.metadata as Prisma.InputJsonValue)
            : undefined,
          assignmentLockedAt: payload.lockedAt ?? undefined
        }
      });

      return this.mapLoad(record);
    } catch (error) {
      this.handleNotFound(error, id, "Load");
      throw error;
    }
  }

  async clearAssignment(id: string): Promise<LoadOrder> {
    try {
      const record = await this.prisma.loadOrder.update({
        where: { id },
        data: {
          assignmentId: null,
          assignmentStatus: PrismaLoadAssignmentStatus.UNASSIGNED,
          assignmentMetadata: Prisma.JsonNull,
          assignmentLockedAt: null
        }
      });

      return this.mapLoad(record);
    } catch (error) {
      this.handleNotFound(error, id, "Load");
      throw error;
    }
  }

  async findAll(): Promise<LoadOrder[]> {
    if (!this.prisma?.loadOrder) {
      throw new Error("Prisma client not available. Please ensure Prisma client is generated and DATABASE_URL is set.");
    }
    const records = await this.prisma.loadOrder.findMany({
      orderBy: { createdAt: "desc" }
    });
    return records.map((record) => this.mapLoad(record));
  }

  async findOne(id: string): Promise<LoadOrder> {
    const record = await this.prisma.loadOrder.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Load ${id} not found`);
    }
    return this.mapLoad(record);
  }

  private mapLoad(record: PrismaLoadOrder): LoadOrder {
    return {
      id: record.id,
      orgId: record.orgId,
      referenceCode: record.referenceCode,
      pickup: this.mapAddress(record.pickup),
      drop: this.mapAddress(record.drop),
      cargoType: record.cargoType,
      cargoValue: Number(record.cargoValue),
      slaHours: record.slaHours,
      vehicleType: record.vehicleType,
      status: record.status.toLowerCase() as LoadStatus,
      priceQuoteBand: this.mapPriceQuote(record.priceQuoteBand),
      assignmentId: record.assignmentId ?? undefined,
      assignmentStatus: record.assignmentStatus as LoadAssignmentStatus,
      assignmentMetadata: this.coerceJson(record.assignmentMetadata),
      assignmentLockedAt: record.assignmentLockedAt
        ? record.assignmentLockedAt.toISOString()
        : undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }

  private serializeAddress(
    address: CreateLoadDto["pickup"]
  ): Prisma.InputJsonValue {
    return {
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      latitude: address.latitude,
      longitude: address.longitude
    };
  }

  private mapAddress(value: Prisma.JsonValue): Address {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Load address is stored in an unexpected format.");
    }

    const obj = value as Prisma.JsonObject;
    return {
      line1: String(obj.line1 ?? ""),
      line2: obj.line2 ? String(obj.line2) : undefined,
      city: String(obj.city ?? ""),
      state: String(obj.state ?? ""),
      postalCode: String(obj.postalCode ?? ""),
      country: String(obj.country ?? ""),
      latitude:
        typeof obj.latitude === "number"
          ? obj.latitude
          : obj.latitude !== undefined
            ? Number(obj.latitude)
            : undefined,
      longitude:
        typeof obj.longitude === "number"
          ? obj.longitude
          : obj.longitude !== undefined
            ? Number(obj.longitude)
            : undefined
    };
  }

  private mapPriceQuote(value: Prisma.JsonValue | null): PriceQuoteBand {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ...DEFAULT_PRICE_QUOTE };
    }
    const candidate = value as Record<string, unknown>;

    return {
      min: Number(candidate.min ?? DEFAULT_PRICE_QUOTE.min),
      max: Number(candidate.max ?? DEFAULT_PRICE_QUOTE.max),
      currency:
        typeof candidate.currency === "string"
          ? candidate.currency
          : DEFAULT_PRICE_QUOTE.currency,
      confidence: Number(candidate.confidence ?? DEFAULT_PRICE_QUOTE.confidence)
    };
  }

  private handleNotFound(
    error: unknown,
    id: string,
    entity: string
  ): never | void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundException(`${entity} ${id} not found`);
    }
  }

  private toPrismaAssignmentStatus(
    status: LoadAssignmentStatus
  ): PrismaLoadAssignmentStatus {
    return status as PrismaLoadAssignmentStatus;
  }

  private coerceJson(
    value: Prisma.JsonValue | null
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

