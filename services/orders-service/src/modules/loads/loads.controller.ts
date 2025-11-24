import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { LoadsService } from "./loads.service";
import { CreateLoadDto } from "./dto/create-load.dto";
import { LinkAssignmentDto } from "./dto/link-assignment.dto";
import { UpdateLoadAssignmentStatusDto } from "./dto/update-assignment-status.dto";

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

  @Patch(":id/assignment")
  linkAssignment(
    @Param("id") id: string,
    @Body() payload: LinkAssignmentDto
  ) {
    return this.loadsService.linkAssignment(id, payload);
  }

  @Patch(":id/assignment/status")
  updateAssignmentStatus(
    @Param("id") id: string,
    @Body() payload: UpdateLoadAssignmentStatusDto
  ) {
    return this.loadsService.updateAssignmentStatus(id, payload);
  }

  @Delete(":id/assignment")
  clearAssignment(@Param("id") id: string) {
    return this.loadsService.clearAssignment(id);
  }
}

