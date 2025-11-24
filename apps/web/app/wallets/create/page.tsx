import { redirect } from "next/navigation";
import { createWalletAction } from "../actions";
import { requireAuth } from "../../../lib/require-auth";
import { SwiggyCard, SwiggyButton, SwiggyInput } from "../../components/swiggy-ui";
import { CreateWalletForm } from "./create-form";

export default async function CreateWalletPage() {
  // Require authentication
  await requireAuth();

  async function handleSubmit(formData: FormData) {
    "use server";
    await createWalletAction(formData);
    redirect("/wallets");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <a
              href="/wallets"
              className="text-sm font-semibold text-[#6366F1] dark:text-indigo-400 transition hover:text-[#4F46E5] dark:hover:text-indigo-300"
            >
              ← Back to wallets
            </a>
            <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Create Wallet</h1>
            <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
              Create a new wallet account for escrow, fleet, or vendor payments
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <SwiggyCard>
          <CreateWalletForm action={handleSubmit} />
        </SwiggyCard>
      </div>
    </div>
  );
}

