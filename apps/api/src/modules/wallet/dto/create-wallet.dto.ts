import { Type } from "class-transformer";
import { IsIn, IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  orgId!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  openingBalance!: number;

  @IsString()
  @IsNotEmpty()
  currency!: string;

  @IsString()
  @IsIn(["ESCROW", "FLEET", "VENDOR"])
  type!: "ESCROW" | "FLEET" | "VENDOR";
}

