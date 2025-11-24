import { Type } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested
} from "class-validator";

class AddressDto {
  @IsString()
  @IsNotEmpty()
  line1!: string;

  @IsOptional()
  @IsString()
  line2?: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  postalCode!: string;

  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;
}

export class CreateLoadDto {
  @IsString()
  @IsNotEmpty()
  orgId!: string;

  @IsString()
  @IsNotEmpty()
  referenceCode!: string;

  @ValidateNested()
  @Type(() => AddressDto)
  pickup!: AddressDto;

  @ValidateNested()
  @Type(() => AddressDto)
  drop!: AddressDto;

  @IsString()
  @IsNotEmpty()
  cargoType!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  cargoValue!: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  slaHours!: number;

  @IsString()
  @IsNotEmpty()
  vehicleType!: string;
}

