import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { WalletService } from "./wallet.service";

@Controller("/api/wallets")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  create(@Body() payload: unknown) {
    return this.walletService.create(payload);
  }

  @Get()
  findAll() {
    return this.walletService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.walletService.findOne(id);
  }
}

