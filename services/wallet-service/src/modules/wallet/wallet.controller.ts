import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { CreateWalletDto } from "./dto/create-wallet.dto";

@Controller("/wallets")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  create(@Body() payload: CreateWalletDto) {
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

