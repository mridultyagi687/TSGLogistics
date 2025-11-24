import { Injectable, NotFoundException } from "@nestjs/common";
import { Vendor as PrismaVendor } from "@prisma/client";
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
        address: payload.address
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
      address: record.address as Address,
      contactPhone: record.contactPhone ?? undefined,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }
}

