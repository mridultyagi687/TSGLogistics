import { Type } from "class-transformer";
import { IsIn, IsObject, IsOptional, IsString } from "class-validator";
import { loadAssignmentStatuses } from "@tsg/shared";

const validStatuses = Object.values(loadAssignmentStatuses);

export class UpdateLoadAssignmentStatusDto {
  @IsString()
  @IsIn(validStatuses)
  status!: (typeof validStatuses)[number];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Date)
  lockedAt?: Date;
}

