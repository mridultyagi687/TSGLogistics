import { Type } from "class-transformer";
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from "class-validator";

class TripStopDto {
  @IsString()
  plannedArrival!: string;

  @IsString()
  plannedDeparture!: string;

  @IsString()
  addressLine1!: string;

  @IsOptional()
  @IsString()
  addressLine2?: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  country!: string;

  @IsString()
  postalCode!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;
}

export class CreateTripDto {
  @IsString()
  loadId!: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TripStopDto)
  stops!: TripStopDto[];
}

