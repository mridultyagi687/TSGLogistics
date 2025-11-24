import { Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  ValidateNested
} from "class-validator";
import type { ServiceTag } from "@tsg/shared";

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
}

export class CreateVendorDto {
  @IsString()
  @IsNotEmpty()
  orgId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @IsString({ each: true })
  services!: ServiceTag[];

  @IsOptional()
  @IsPhoneNumber("IN")
  contactPhone?: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;
}

