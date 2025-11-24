import { Injectable, NotFoundException } from "@nestjs/common";
import {
  LoadOrder as PrismaLoadOrder,
  LoadStatus as PrismaLoadStatus,
  Prisma
} from "@prisma/client";
import type { Address, LoadOrder, LoadStatus } from "@tsg/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateLoadDto } from "./dto/create-load.dto";

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
    const record = await this.prisma.loadOrder.create({
      data: {
        orgId: payload.orgId,
        referenceCode: payload.referenceCode,
        pickup: payload.pickup,
        drop: payload.drop,
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
        data: { status: PrismaLoadStatus.PUBLISHED }
      });

      return this.mapLoad(record);
    } catch (error) {
      this.handleNotFound(error, id, "Load");
      throw error;
    }
  }

  async findAll(): Promise<LoadOrder[]> {
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
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }

  private mapAddress(value: Prisma.JsonValue): Address {
    return value as Address;
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
}

