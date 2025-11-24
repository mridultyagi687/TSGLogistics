import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Vendor as PrismaVendor } from "@prisma/client";
import type { Address, ServiceTag, VendorSummary } from "@tsg/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateVendorDto } from "./dto/create-vendor.dto";

@Injectable()
export class VendorsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateVendorDto): Promise<VendorSummary> {
    const vendor = await this.prisma.vendor.create({
      data: {
        orgId: payload.orgId,
        name: payload.name,
        services: payload.services,
        contactPhone: payload.contactPhone,
        address: this.serializeAddress(payload.address)
      }
    });

    return this.mapVendor(vendor);
  }

  async findAll(): Promise<VendorSummary[]> {
    const vendors = await this.prisma.vendor.findMany({
      orderBy: { createdAt: "desc" }
    });
    return vendors.map((vendor) => this.mapVendor(vendor));
  }

  async findOne(id: string): Promise<VendorSummary> {
    const vendor = await this.prisma.vendor.findUnique({ where: { id } });
    if (!vendor) {
      throw new NotFoundException(`Vendor ${id} not found`);
    }
    return this.mapVendor(vendor);
  }

  private mapVendor(record: PrismaVendor): VendorSummary {
    return {
      id: record.id,
      orgId: record.orgId,
      name: record.name,
      services: record.services as ServiceTag[],
      rating: record.rating ?? undefined,
      geoHash: record.geoHash ?? undefined,
      address: this.mapAddress(record.address),
      contactPhone: record.contactPhone ?? undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }

  private serializeAddress(
    address: CreateVendorDto["address"]
  ): Prisma.InputJsonValue {
    return {
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country
    };
  }

  private mapAddress(value: Prisma.JsonValue): Address {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Vendor address is stored in an unexpected format.");
    }

    const obj = value as Prisma.JsonObject;
    return {
      line1: String(obj.line1 ?? ""),
      line2: obj.line2 ? String(obj.line2) : undefined,
      city: String(obj.city ?? ""),
      state: String(obj.state ?? ""),
      postalCode: String(obj.postalCode ?? ""),
      country: String(obj.country ?? "")
    };
  }
}

