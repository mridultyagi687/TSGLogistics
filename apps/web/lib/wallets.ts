import type { WalletAccount } from "@tsg/shared";
import { gatewayJsonFetch } from "./gateway";

export async function fetchWallets(): Promise<WalletAccount[]> {
  return gatewayJsonFetch<WalletAccount[]>("/api/wallets");
}

export async function fetchWallet(id: string): Promise<WalletAccount> {
  return gatewayJsonFetch<WalletAccount>(`/api/wallets/${id}`);
}

export async function createWallet(payload: {
  orgId: string;
  type: "ESCROW" | "FLEET" | "VENDOR";
  currency?: string;
}): Promise<WalletAccount> {
  return gatewayJsonFetch<WalletAccount>("/api/wallets", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      currency: payload.currency ?? "INR"
    })
  });
}

