import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { LoadsService } from "./loads.service";
import { CreateLoadDto } from "./dto/create-load.dto";

@Controller("/loads")
export class LoadsController {
  constructor(private readonly loadsService: LoadsService) {}

  @Post()
  create(@Body() payload: CreateLoadDto) {
    return this.loadsService.create(payload);
  }

  @Patch(":id/publish")
  publish(@Param("id") id: string) {
    return this.loadsService.publish(id);
  }

  @Get()
  findAll() {
    return this.loadsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.loadsService.findOne(id);
  }
}

