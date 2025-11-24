import { Type } from "class-transformer";
import { IsIn, IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";
import { loadAssignmentStatuses } from "@tsg/shared";

const validStatuses = Object.values(loadAssignmentStatuses);

export class LinkAssignmentDto {
  @IsString()
  @IsNotEmpty()
  assignmentId!: string;

  @IsOptional()
  @IsString()
  @IsIn(validStatuses)
  status?: (typeof validStatuses)[number];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Date)
  lockedAt?: Date;
}

