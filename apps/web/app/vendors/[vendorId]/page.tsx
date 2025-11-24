import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchVendor, fetchVendorCapabilities } from "../../../lib/vendors";
import { requireAuth } from "../../../lib/require-auth";
import { SwiggyCard, SwiggyBadge } from "../../components/swiggy-ui";
import { VendorCapabilitiesForm } from "./capabilities-form";

function formatAddress(address: { city: string; state: string; line1: string }) {
  return `${address.line1}, ${address.city}, ${address.state}`;
}

export async function generateMetadata({
  params
}: {
  params: { vendorId: string };
}): Promise<Metadata> {
  return {
    title: `Vendor ${params.vendorId} | TSG Logistics`
  };
}

export default async function VendorDetailPage({
  params
}: {
  params: { vendorId: string };
}) {
  // Require authentication
  await requireAuth();

  let vendor;
  let capabilities;
  try {
    [vendor, capabilities] = await Promise.all([
      fetchVendor(params.vendorId),
      fetchVendorCapabilities(params.vendorId)
    ]);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      notFound();
    }
    throw error;
  }

  if (!vendor) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Link
              href="/vendors"
              className="text-sm font-semibold text-[#6366F1] transition hover:text-[#4F46E5]"
            >
              ← Back to vendors
            </Link>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{vendor.name}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Org {vendor.orgId} • Created {new Date(vendor.createdAt).toLocaleDateString()}
                </p>
              </div>
              {vendor.rating && (
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#6366F1]">
                    {vendor.rating.toFixed(1)} ⭐
                  </div>
                  <p className="text-sm text-gray-500">Rating</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Vendor Info */}
          <div className="lg:col-span-2 space-y-6">
            <SwiggyCard>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Vendor Details</h2>
              </div>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-semibold text-gray-500">Organization</dt>
                  <dd className="mt-1 text-base text-gray-900">{vendor.orgId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500">Contact</dt>
                  <dd className="mt-1 text-base text-gray-900">
                    {vendor.contactPhone || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500">Address</dt>
                  <dd className="mt-1 text-base text-gray-900">{formatAddress(vendor.address)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500">Services</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {vendor.services.map((service) => (
                      <SwiggyBadge key={service} variant="info">
                        {service.replace(/_/g, " ")}
                      </SwiggyBadge>
                    ))}
                  </dd>
                </div>
              </dl>
            </SwiggyCard>

            {/* Capabilities */}
            <SwiggyCard>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Capabilities</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Manage vendor-specific capabilities and metadata
                </p>
              </div>
              <VendorCapabilitiesForm vendorId={vendor.id} initialCapabilities={capabilities} />
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
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-gray-900">
                    {new Date(vendor.updatedAt).toLocaleDateString()}
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

