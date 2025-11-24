import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { OrdersService } from "../orders.service";

class CancelTripRequest {
  reason?: string;
}

@Controller("/api/trips")
export class TripsController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() payload: unknown) {
    return this.ordersService.createTrip(payload);
  }

  @Patch(":id/start")
  start(@Param("id") id: string) {
    return this.ordersService.startTrip(id);
  }

  @Patch(":id/complete")
  complete(@Param("id") id: string) {
    return this.ordersService.completeTrip(id);
  }

  @Patch(":id/cancel")
  cancel(@Param("id") id: string, @Body() payload: CancelTripRequest) {
    return this.ordersService.cancelTrip(id, payload);
  }

  @Get()
  findAll() {
    return this.ordersService.listTrips();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ordersService.getTrip(id);
  }
}

