import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { TripsService } from "./trips.service";
import { CreateTripDto } from "./dto/create-trip.dto";
import { CancelTripDto } from "./dto/cancel-trip.dto";

@Controller("/trips")
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post()
  create(@Body() payload: CreateTripDto) {
    return this.tripsService.create(payload);
  }

  @Patch(":id/start")
  start(@Param("id") id: string) {
    return this.tripsService.startTrip(id);
  }

  @Patch(":id/complete")
  complete(@Param("id") id: string) {
    return this.tripsService.completeTrip(id);
  }

  @Patch(":id/cancel")
  cancel(@Param("id") id: string, @Body() payload: CancelTripDto) {
    return this.tripsService.cancelTrip(id, payload);
  }

  @Get()
  findAll() {
    return this.tripsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.tripsService.findOne(id);
  }
}

