import { IsIn, IsObject, IsOptional, IsString } from "class-validator";
import { assignmentEventTypes } from "@tsg/shared";

const validEventTypes = Object.values(assignmentEventTypes);

export class CreateAssignmentEventDto {
  @IsString()
  @IsIn(validEventTypes)
  type!: (typeof validEventTypes)[number];

  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}

