import { IsArray, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CapabilityDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsObject()
  payload!: Record<string, unknown>;
}

export class UpsertCapabilitiesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CapabilityDto)
  capabilities!: CapabilityDto[];
}

