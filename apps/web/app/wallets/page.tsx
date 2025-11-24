import Link from "next/link";
import type { Metadata } from "next";
import { fetchWallets } from "../../lib/wallets";
import { requireAuth } from "../../lib/require-auth";
import { SwiggyCard, SwiggyButton, SwiggyBadge, SwiggyStatCard } from "../components/swiggy-ui";

export const metadata: Metadata = {
  title: "Wallets | TSG Logistics"
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR"
  }).format(amount);
}

export default async function WalletsPage() {
  // Require authentication
  await requireAuth();

  const wallets = await fetchWallets();

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const activeWallets = wallets.filter((w) => w.status === "ACTIVE").length;
  const escrowWallets = wallets.filter((w) => w.type === "ESCROW").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallets</h1>
              <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
                Manage escrow, fleet, and vendor wallets
              </p>
            </div>
            <Link href="/wallets/create">
              <SwiggyButton>Create Wallet</SwiggyButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SwiggyStatCard
              label="Total Balance"
              value={formatCurrency(totalBalance, "INR")}
              icon="💰"
            />
            <SwiggyStatCard label="Active Wallets" value={activeWallets} icon="✅" />
            <SwiggyStatCard label="Escrow Wallets" value={escrowWallets} icon="🔒" />
          </div>
        </div>
      </div>

      {/* Wallets List */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <SwiggyCard>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Wallets</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{wallets.length} total wallets</p>
            </div>
          </div>
          {wallets.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-6xl mb-4">💰</div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">No wallets yet</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Create your first wallet to get started.
              </p>
              <Link href="/wallets/create" className="mt-4 inline-block">
                <SwiggyButton>Create Wallet</SwiggyButton>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Wallet ID
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Organization
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Type
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Balance
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Created
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {wallets.map((wallet) => (
                    <tr key={wallet.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="whitespace-nowrap px-4 py-4">
                        <Link
                          href={`/wallets/${wallet.id}`}
                          className="text-sm font-bold text-[#6366F1] hover:text-[#4F46E5] transition"
                        >
                          {wallet.id.slice(0, 12)}...
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{wallet.orgId}</td>
                      <td className="px-4 py-4">
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
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(wallet.balance, wallet.currency)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <SwiggyBadge
                          variant={wallet.status === "ACTIVE" ? "success" : "danger"}
                        >
                          {wallet.status}
                        </SwiggyBadge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {new Date(wallet.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <Link href={`/wallets/${wallet.id}`}>
                          <SwiggyButton variant="ghost" size="sm">
                            View →
                          </SwiggyButton>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SwiggyCard>
      </div>
    </div>
  );
}

