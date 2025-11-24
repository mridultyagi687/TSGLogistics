"use server";

import { revalidatePath } from "next/cache";
import { createWallet } from "../../lib/wallets";

export async function createWalletAction(formData: FormData) {
  const wallet = await createWallet({
    orgId: String(formData.get("orgId")),
    type: String(formData.get("type")) as "ESCROW" | "FLEET" | "VENDOR",
    currency: String(formData.get("currency")) || undefined
  });

  revalidatePath("/wallets");
  return wallet;
}

