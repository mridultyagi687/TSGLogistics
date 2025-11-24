import Link from "next/link";
import type { Metadata } from "next";
import { fetchVendors } from "../../lib/vendors";
import { requireAuth } from "../../lib/require-auth";
import { SwiggyCard, SwiggyButton, SwiggyBadge } from "../components/swiggy-ui";
import { serviceTags } from "@tsg/shared";

export const metadata: Metadata = {
  title: "Vendors | TSG Logistics"
};

function formatAddress(address: { city: string; state: string }) {
  return `${address.city}, ${address.state}`;
}

export default async function VendorsPage() {
  // Require authentication
  await requireAuth();

  const vendors = await fetchVendors();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendors</h1>
              <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
                Manage roadside partners and service providers
              </p>
            </div>
            <Link href="/vendors/create">
              <SwiggyButton>Create Vendor</SwiggyButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Vendors List */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <SwiggyCard>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">All Vendors</h2>
              <p className="mt-1 text-sm text-gray-600">{vendors.length} total vendors</p>
            </div>
          </div>
          {vendors.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-6xl mb-4">🏪</div>
              <p className="text-lg font-semibold text-gray-900">No vendors yet</p>
              <p className="mt-2 text-sm text-gray-500">
                Create your first vendor to get started.
              </p>
              <Link href="/vendors/create" className="mt-4 inline-block">
                <SwiggyButton>Create Vendor</SwiggyButton>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vendors.map((vendor) => (
                <Link
                  key={vendor.id}
                  href={`/vendors/${vendor.id}`}
                  className="block"
                >
                  <SwiggyCard className="transition-all hover:scale-105">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{vendor.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{vendor.orgId}</p>
                      </div>
                      {vendor.rating && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-[#6366F1]">
                            {vendor.rating.toFixed(1)} ⭐
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        📍 {formatAddress(vendor.address)}
                      </p>
                      {vendor.contactPhone && (
                        <p className="text-sm text-gray-600">
                          📞 {vendor.contactPhone}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {vendor.services.map((service) => (
                        <SwiggyBadge key={service} variant="info">
                          {service}
                        </SwiggyBadge>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">
                        Created {new Date(vendor.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </SwiggyCard>
                </Link>
              ))}
            </div>
          )}
        </SwiggyCard>
      </div>
    </div>
  );
}

