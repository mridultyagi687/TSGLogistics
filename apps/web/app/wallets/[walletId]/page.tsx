import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchWallet } from "../../../lib/wallets";
import { requireAuth } from "../../../lib/require-auth";
import { SwiggyCard, SwiggyBadge } from "../../components/swiggy-ui";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR"
  }).format(amount);
}

export async function generateMetadata({
  params
}: {
  params: { walletId: string };
}): Promise<Metadata> {
  return {
    title: `Wallet ${params.walletId} | TSG Logistics`
  };
}

export default async function WalletDetailPage({
  params
}: {
  params: { walletId: string };
}) {
  // Require authentication
  await requireAuth();

  let wallet;
  try {
    wallet = await fetchWallet(params.walletId);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      notFound();
    }
    throw error;
  }

  if (!wallet) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Link
              href="/wallets"
              className="text-sm font-semibold text-[#6366F1] transition hover:text-[#4F46E5]"
            >
              ← Back to wallets
            </Link>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Wallet {wallet.id.slice(0, 12)}...
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Org {wallet.orgId} • Created {new Date(wallet.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-[#6366F1]">
                  {formatCurrency(wallet.balance, wallet.currency)}
                </div>
                <p className="text-sm text-gray-500">Current Balance</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Wallet Info */}
          <div className="lg:col-span-2">
            <SwiggyCard>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Wallet Details</h2>
              </div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-semibold text-gray-500">Organization</dt>
                  <dd className="mt-1 text-base text-gray-900">{wallet.orgId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500">Type</dt>
                  <dd className="mt-2">
                    <SwiggyBadge
                      variant={
                        wallet.type === "ESCROW"
                          ? "info"
                          : wallet.type === "FLEET"
                            ? "success"
                            : "warning"
                      }
                    >
                      {wallet.type}
                    </SwiggyBadge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500">Status</dt>
                  <dd className="mt-2">
                    <SwiggyBadge
                      variant={wallet.status === "ACTIVE" ? "success" : "danger"}
                    >
                      {wallet.status}
                    </SwiggyBadge>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500">Currency</dt>
                  <dd className="mt-1 text-base text-gray-900">{wallet.currency}</dd>
                </div>
              </dl>
            </SwiggyCard>

            {/* Transactions Placeholder */}
            <SwiggyCard className="mt-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Transactions</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Transaction history will be displayed here
                </p>
              </div>
              <div className="py-8 text-center text-sm text-gray-500">
                No transactions yet
              </div>
            </SwiggyCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SwiggyCard>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">Quick Info</h3>
              </div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-gray-500">Created</dt>
                  <dd className="mt-1 text-gray-900">
                    {new Date(wallet.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-gray-900">
                    {new Date(wallet.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </SwiggyCard>
          </div>
        </div>
      </div>
    </div>
  );
}

