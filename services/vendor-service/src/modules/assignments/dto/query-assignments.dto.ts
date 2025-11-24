import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString } from "class-validator";
import { assignmentStatuses } from "@tsg/shared";

const validStatuses = Object.values(assignmentStatuses);

export class QueryAssignmentsDto {
  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsString()
  vendorId?: string;

  @IsOptional()
  @IsString()
  loadId?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === "string" && value.length > 0) {
      return value.split(",").map((item) => item.trim());
    }
    return undefined;
  })
  @IsIn(validStatuses, { each: true })
  statuses?: (typeof validStatuses)[number][];
}

