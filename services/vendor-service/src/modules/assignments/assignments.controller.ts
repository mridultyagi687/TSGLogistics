import { Body, Controller, Get, Param, Patch, Post, Put, Query } from "@nestjs/common";
import { AssignmentsService } from "./assignments.service";
import { CreateAssignmentDto } from "./dto/create-assignment.dto";
import { QueryAssignmentsDto } from "./dto/query-assignments.dto";
import { UpdateAssignmentStatusDto } from "./dto/update-assignment-status.dto";
import { CreateAssignmentEventDto } from "./dto/create-assignment-event.dto";
import { UpsertCapabilitiesDto } from "./dto/upsert-capability.dto";

@Controller()
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post("/assignments")
  createAssignment(@Body() payload: CreateAssignmentDto) {
    return this.assignmentsService.createAssignment(payload);
  }

  @Get("/assignments")
  listAssignments(@Query() query: QueryAssignmentsDto) {
    return this.assignmentsService.listAssignments(query);
  }

  @Get("/assignments/:id")
  getAssignment(@Param("id") id: string) {
    return this.assignmentsService.getAssignment(id);
  }

  @Patch("/assignments/:id/status")
  updateStatus(
    @Param("id") id: string,
    @Body() payload: UpdateAssignmentStatusDto
  ) {
    return this.assignmentsService.updateAssignmentStatus(id, payload);
  }

  @Post("/assignments/:id/events")
  createEvent(
    @Param("id") id: string,
    @Body() payload: CreateAssignmentEventDto
  ) {
    return this.assignmentsService.recordEvent(id, payload);
  }

  @Get("/assignments/:id/events")
  listEvents(@Param("id") id: string) {
    return this.assignmentsService.listEvents(id);
  }

  @Put("/vendors/:vendorId/capabilities")
  upsertCapabilities(
    @Param("vendorId") vendorId: string,
    @Body() payload: UpsertCapabilitiesDto
  ) {
    return this.assignmentsService.upsertCapabilities(vendorId, payload);
  }

  @Get("/vendors/:vendorId/capabilities")
  listCapabilities(@Param("vendorId") vendorId: string) {
    return this.assignmentsService.listCapabilities(vendorId);
  }
}

