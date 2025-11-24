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
        status: PrismaTripStatus.SCHEDULED,
        stops: {
          create: payload.stops.map((stop, index) => ({
            sequence: index,
            plannedArrival: new Date(stop.plannedArrival),
            plannedDeparture: new Date(stop.plannedDeparture),
            address: {
              line1: stop.addressLine1,
              line2: stop.addressLine2,
              city: stop.city,
              state: stop.state,
              country: stop.country,
              postalCode: stop.postalCode,
              latitude: stop.latitude,
              longitude: stop.longitude
            }
          }))
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

  async findAll(): Promise<Trip[]> {
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
    status: PrismaTripStatus
  ): Promise<Trip> {
    try {
      const trip = await this.prisma.trip.update({
        where: { id },
        data: { status },
        include: { stops: true }
      });
      return this.mapTrip(trip);
    } catch (error) {
      this.handleNotFound(error, id);
      throw error;
    }
  }

  private mapTrip(record: PrismaTrip & { stops: PrismaTripStop[] }): Trip {
    return {
      id: record.id,
      loadId: record.loadId,
      vehicleId: record.vehicleId ?? undefined,
      driverId: record.driverId ?? undefined,
      status: record.status.toLowerCase() as TripStatus,
      stops: record.stops
        .sort((a, b) => a.sequence - b.sequence)
        .map((stop) => ({
          id: stop.id,
          sequence: stop.sequence,
          plannedArrival: stop.plannedArrival.toISOString(),
          plannedDeparture: stop.plannedDeparture.toISOString(),
          actualArrival: stop.actualArrival?.toISOString(),
          actualDeparture: stop.actualDeparture?.toISOString(),
          detentionMinutes: stop.detentionMinutes ?? undefined,
          address: stop.address as Address,
          createdAt: stop.createdAt.toISOString(),
          updatedAt: stop.updatedAt.toISOString()
        })),
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
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

