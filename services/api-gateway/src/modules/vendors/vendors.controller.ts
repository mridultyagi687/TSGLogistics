import { Body, Controller, Get, Param, Post, Put } from "@nestjs/common";
import { VendorsService } from "./vendors.service";

@Controller("/api/vendors")
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  create(@Body() payload: unknown) {
    return this.vendorsService.create(payload);
  }

  @Get()
  findAll() {
    return this.vendorsService.findAll();
  }

  @Put(":vendorId/capabilities")
  upsertCapabilities(
    @Param("vendorId") vendorId: string,
    @Body() payload: unknown
  ) {
    return this.vendorsService.upsertCapabilities(vendorId, payload);
  }

  @Get(":vendorId/capabilities")
  listCapabilities(@Param("vendorId") vendorId: string) {
    return this.vendorsService.listCapabilities(vendorId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.vendorsService.findOne(id);
  }
}

