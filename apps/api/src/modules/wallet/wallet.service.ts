import { Injectable, NotFoundException } from "@nestjs/common";
import {
  WalletAccount as PrismaWalletAccount,
  WalletStatus as PrismaWalletStatus,
  WalletType as PrismaWalletType
} from "@prisma/client";
import type { WalletAccount } from "@tsg/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateWalletDto } from "./dto/create-wallet.dto";

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateWalletDto): Promise<WalletAccount> {
    const account = await this.prisma.walletAccount.create({
      data: {
        orgId: payload.orgId,
        balance: payload.openingBalance,
        currency: payload.currency,
        type: payload.type as PrismaWalletType,
        status: PrismaWalletStatus.ACTIVE
      }
    });

    return this.mapAccount(account);
  }

  async findAll(): Promise<WalletAccount[]> {
    const accounts = await this.prisma.walletAccount.findMany({
      orderBy: { createdAt: "desc" }
    });
    return accounts.map((account) => this.mapAccount(account));
  }

  async findOne(id: string): Promise<WalletAccount> {
    const account = await this.prisma.walletAccount.findUnique({
      where: { id }
    });
    if (!account) {
      throw new NotFoundException(`Wallet ${id} not found`);
    }
    return this.mapAccount(account);
  }

  private mapAccount(record: PrismaWalletAccount): WalletAccount {
    return {
      id: record.id,
      orgId: record.orgId,
      balance: Number(record.balance),
      currency: record.currency,
      type: record.type,
      status: record.status,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    };
  }
}

