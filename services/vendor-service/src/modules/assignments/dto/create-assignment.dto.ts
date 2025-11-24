import { IsNumber, IsObject, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class CreateAssignmentDto {
  @IsString()
  orgId!: string;

  @IsString()
  vendorId!: string;

  @IsString()
  loadId!: string;

  @IsOptional()
  @IsString()
  tripId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  score?: number;

  @IsOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

