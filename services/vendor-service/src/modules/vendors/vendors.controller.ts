import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { VendorsService } from "./vendors.service";
import { CreateVendorDto } from "./dto/create-vendor.dto";

@Controller("/vendors")
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  create(@Body() payload: CreateVendorDto) {
    return this.vendorsService.create(payload);
  }

  @Get()
  findAll() {
    return this.vendorsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.vendorsService.findOne(id);
  }
}

