import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query
} from "@nestjs/common";
import { VendorsService } from "./vendors.service";

@Controller("/api/vendor-assignments")
export class VendorAssignmentsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post()
  createAssignment(@Body() payload: unknown) {
    return this.vendorsService.createAssignment(payload);
  }

  @Get()
  listAssignments(@Query() query: Record<string, string | string[] | undefined>) {
    return this.vendorsService.listAssignments(query);
  }

  @Get(":id")
  getAssignment(@Param("id") id: string) {
    return this.vendorsService.getAssignment(id);
  }

  @Patch(":id/status")
  updateAssignmentStatus(
    @Param("id") id: string,
    @Body() payload: unknown
  ) {
    return this.vendorsService.updateAssignmentStatus(id, payload);
  }

  @Post(":id/events")
  createAssignmentEvent(
    @Param("id") id: string,
    @Body() payload: unknown
  ) {
    return this.vendorsService.createAssignmentEvent(id, payload);
  }

  @Get(":id/events")
  listAssignmentEvents(@Param("id") id: string) {
    return this.vendorsService.listAssignmentEvents(id);
  }
}

