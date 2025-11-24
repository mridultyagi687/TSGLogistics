import { Injectable, NotFoundException } from "@nestjs/common";
import {
  Prisma,
  Trip as PrismaTrip,
  TripStatus as PrismaTripStatus,
  TripStop as PrismaTripStop
} from "@prisma/client";
import type { Address, Trip, TripStatus } from "@tsg/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateTripDto } from "./dto/create-trip.dto";

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateTripDto): Promise<Trip> {
    const trip = await this.prisma.trip.create({
      data: {
        loadId: payload.loadId,
        vehicleId: payload.vehicleId,
        driverId: payload.driverId,
        assignmentId: payload.assignmentId,
        status: PrismaTripStatus.SCHEDULED,
        scheduledAt: new Date(),
        stops: {
          create: payload.stops.map((stop, index) =>
            this.serializeStop(stop, index)
          )
        }
      },
      include: { stops: true }
    });

    return this.mapTrip(trip);
  }

  async startTrip(id: string): Promise<Trip> {
    return this.updateStatus(id, PrismaTripStatus.IN_PROGRESS);
  }

  async completeTrip(id: string): Promise<Trip> {
    return this.updateStatus(id, PrismaTripStatus.COMPLETED);
  }

  async cancelTrip(id: string, payload: { reason?: string }): Promise<Trip> {
    return this.updateStatus(id, PrismaTripStatus.EXCEPTION, payload);
  }

  async findAll(): Promise<Trip[]> {
    if (!this.prisma?.trip) {
      throw new Error("Prisma client not available. Please ensure Prisma client is generated and DATABASE_URL is set.");
    }
    const trips = await this.prisma.trip.findMany({
      include: { stops: true },
      orderBy: { createdAt: "desc" }
    });
    return trips.map((trip) => this.mapTrip(trip));
  }

  async findOne(id: string): Promise<Trip> {
    const trip = await this.prisma.trip.findUnique({
      where: { id },
      include: { stops: true }
    });
    if (!trip) {
      throw new NotFoundException(`Trip ${id} not found`);
    }
    return this.mapTrip(trip);
  }

  private async updateStatus(
    id: string,
    status: PrismaTripStatus,
    metadata?: { reason?: string }
  ): Promise<Trip> {
    const data: Prisma.TripUpdateInput = {
      status
    };

    if (status === PrismaTripStatus.IN_PROGRESS) {
      data.startedAt = new Date();
    }

    if (status === PrismaTripStatus.COMPLETED) {
      data.completedAt = new Date();
      data.totalDetentionMinutes = await this.calculateDetentionMinutes(id);
    }

    if (status === PrismaTripStatus.EXCEPTION) {
      data.cancelledAt = new Date();
      data.exceptionReason = metadata?.reason ?? null;
      data.totalDetentionMinutes = await this.calculateDetentionMinutes(id);
    }

    try {
      const trip = await this.prisma.trip.update({
        where: { id },
        data,
        include: { stops: true }
      });
      return this.mapTrip(trip);
    } catch (error) {
      this.handleNotFound(error, id);
      throw error;
    }
  }

  private async calculateDetentionMinutes(tripId: string): Promise<number> {
    const result = await this.prisma.tripStop.aggregate({
      where: { tripId },
      _sum: { detentionMinutes: true }
    });
    return result._sum.detentionMinutes ?? 0;
  }

  private mapTrip(record: PrismaTrip & { stops: PrismaTripStop[] }): Trip {
    return {
      id: record.id,
      loadId: record.loadId,
      vehicleId: record.vehicleId ?? undefined,
      driverId: record.driverId ?? undefined,
      assignmentId: record.assignmentId ?? undefined,
      status: record.status.toLowerCase() as TripStatus,
      scheduledAt: record.scheduledAt.toISOString(),
      startedAt: record.startedAt?.toISOString(),
      completedAt: record.completedAt?.toISOString(),
      cancelledAt: record.cancelledAt?.toISOString(),
      exceptionReason: record.exceptionReason ?? undefined,
      totalDetentionMinutes: record.totalDetentionMinutes ?? 0,
      stops: record.stops
        .sort((a, b) => a.sequence - b.sequence)
        .map((stop) => this.mapStop(stop)),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }

  private serializeStop(
    stop: CreateTripDto["stops"][number],
    index: number
  ): Prisma.TripStopCreateWithoutTripInput {
    return {
      sequence: index,
      plannedArrival: new Date(stop.plannedArrival),
      plannedDeparture: new Date(stop.plannedDeparture),
      address: this.serializeAddress(stop)
    };
  }

  private serializeAddress(
    stop: CreateTripDto["stops"][number]
  ): Prisma.InputJsonValue {
    return {
      line1: stop.addressLine1,
      line2: stop.addressLine2,
      city: stop.city,
      state: stop.state,
      country: stop.country,
      postalCode: stop.postalCode,
      latitude: stop.latitude,
      longitude: stop.longitude
    };
  }

  private mapStop(stop: PrismaTripStop) {
    return {
      id: stop.id,
      sequence: stop.sequence,
      plannedArrival: stop.plannedArrival.toISOString(),
      plannedDeparture: stop.plannedDeparture.toISOString(),
      actualArrival: stop.actualArrival?.toISOString(),
      actualDeparture: stop.actualDeparture?.toISOString(),
      detentionMinutes: stop.detentionMinutes ?? undefined,
      address: this.mapAddress(stop.address),
      createdAt: stop.createdAt.toISOString(),
      updatedAt: stop.updatedAt.toISOString()
    };
  }

  private mapAddress(value: Prisma.JsonValue): Address {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error("Trip stop address is stored in an unexpected format.");
    }

    const obj = value as Prisma.JsonObject;
    return {
      line1: String(obj.line1 ?? ""),
      line2: obj.line2 ? String(obj.line2) : undefined,
      city: String(obj.city ?? ""),
      state: String(obj.state ?? ""),
      country: String(obj.country ?? ""),
      postalCode: String(obj.postalCode ?? ""),
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

  private handleNotFound(error: unknown, id: string): never | void {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new NotFoundException(`Trip ${id} not found`);
    }
  }
}

