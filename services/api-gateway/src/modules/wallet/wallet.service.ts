import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import type { WalletAccount } from "@tsg/shared";
import type { AxiosResponse } from "axios";

@Injectable()
export class WalletService {
  constructor(private readonly http: HttpService) {}

  async create(payload: unknown) {
    const response = await firstValueFrom<AxiosResponse<WalletAccount>>(
      this.http.post("/wallets", payload)
    );
    return response.data;
  }

  async findAll() {
    const response = await firstValueFrom<AxiosResponse<WalletAccount[]>>(
      this.http.get("/wallets")
    );
    return response.data;
  }

  async findOne(id: string) {
    const response = await firstValueFrom<AxiosResponse<WalletAccount>>(
      this.http.get(`/wallets/${id}`)
    );
    return response.data;
  }
}

