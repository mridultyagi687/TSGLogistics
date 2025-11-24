import { IsIn, IsObject, IsOptional, IsString } from "class-validator";
import { assignmentStatuses } from "@tsg/shared";

const validStatuses = Object.values(assignmentStatuses);

export class UpdateAssignmentStatusDto {
  @IsString()
  @IsIn(validStatuses)
  status!: (typeof validStatuses)[number];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

