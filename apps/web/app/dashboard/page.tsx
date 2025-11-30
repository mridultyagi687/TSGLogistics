import Link from "next/link";
import { fetchLoads } from "../../lib/loads";
import { fetchTrips } from "../../lib/trips";
import { fetchAssignments } from "../../lib/assignments";
import { getPlatformStatus } from "../../lib/status";
import { requireAuth } from "../../lib/require-auth";
import {
  SwiggyCard,
  SwiggyStatCard,
  SwiggyBadge
} from "../components/swiggy-ui";
import { formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Dashboard | TSG Logistics"
};

function formatAddress(address: { city: string; state: string }) {
  return `${address.city}, ${address.state}`;
}

export default async function DashboardPage() {
  // Require authentication
  await requireAuth();

  const [status, loads, trips, assignments] = await Promise.all([
    getPlatformStatus(),
    fetchLoads(),
    fetchTrips(),
    fetchAssignments()
  ]);

  const activeLoads = loads.filter((l) => !["completed", "cancelled"].includes(l.status)).length;
  const inTransit = loads.filter((l) => l.status === "in_transit").length;
  const completedLoads = loads.filter((l) => l.status === "completed").length;
  const assignmentsCount = assignments.length;
  const pendingAssignments = assignments.filter((a) => a.status === "OFFERED" || a.status === "PENDING").length;
  const acceptedAssignments = assignments.filter((a) => a.status === "ACCEPTED").length;
  const activeTrips = trips.filter((t) => t.status === "in_progress" || t.status === "at_stop").length;

  const recentLoads = loads.slice(0, 5);
  const recentAssignments = assignments.slice(0, 5);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
              Overview of your logistics operations
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <SwiggyStatCard label="Active Loads" value={activeLoads} icon="📦" />
          <SwiggyStatCard label="In Transit" value={inTransit} icon="🚛" />
          <SwiggyStatCard label="Active Trips" value={activeTrips} icon="🗺️" />
          <SwiggyStatCard label="Assignments" value={assignmentsCount} icon="🤝" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <SwiggyStatCard label="Completed Loads" value={completedLoads} icon="✅" />
          <SwiggyStatCard label="Pending Assignments" value={pendingAssignments} icon="⏳" />
          <SwiggyStatCard label="Accepted Assignments" value={acceptedAssignments} icon="👍" />
          <SwiggyCard className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Platform Status</p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-3 w-3 rounded-full ${
                    status.status === "ok" ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                  }`}
                />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {status.status === "ok" ? "Operational" : "Degraded"}
                </span>
              </div>
            </div>
          </SwiggyCard>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Loads */}
          <SwiggyCard>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Loads</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{loads.length} total loads</p>
              </div>
              <Link href="/loads">
                <button className="text-sm font-semibold text-[#6366F1] dark:text-indigo-400 hover:text-[#4F46E5] dark:hover:text-indigo-300 transition">
                  View All →
                </button>
              </Link>
            </div>
            {recentLoads.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No loads yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentLoads.map((load) => {
                  const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
                    draft: { label: "Draft", variant: "default" },
                    published: { label: "Published", variant: "info" },
                    booked: { label: "Booked", variant: "info" },
                    in_transit: { label: "In Transit", variant: "warning" },
                    completed: { label: "Completed", variant: "success" },
                    cancelled: { label: "Cancelled", variant: "danger" }
                  };
                  const statusInfo = statusMap[load.status] || { label: load.status, variant: "default" as const };

                  return (
                    <Link
                      key={load.id}
                      href={`/loads#${load.id}`}
                      className="block rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 transition hover:border-[#6366F1] dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-gray-900 dark:text-white">{load.referenceCode}</span>
                            <SwiggyBadge variant={statusInfo.variant}>{statusInfo.label}</SwiggyBadge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {formatAddress(load.pickup)} → {formatAddress(load.drop)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {load.cargoType} · {load.vehicleType}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(load.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </SwiggyCard>

          {/* Recent Assignments */}
          <SwiggyCard>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Assignments</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{assignments.length} total assignments</p>
              </div>
              <Link href="/assignments">
                <button className="text-sm font-semibold text-[#6366F1] dark:text-indigo-400 hover:text-[#4F46E5] dark:hover:text-indigo-300 transition">
                  View All →
                </button>
              </Link>
            </div>
            {recentAssignments.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No assignments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentAssignments.map((assignment) => {
                  const statusMap: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }> = {
                    PENDING: { label: "Pending", variant: "default" },
                    OFFERED: { label: "Offered", variant: "warning" },
                    ACCEPTED: { label: "Accepted", variant: "success" },
                    DECLINED: { label: "Declined", variant: "danger" },
                    CANCELLED: { label: "Cancelled", variant: "danger" },
                    EXPIRED: { label: "Expired", variant: "default" }
                  };
                  const statusInfo = statusMap[assignment.status] || { label: assignment.status, variant: "default" as const };
                  const load = loads.find((l) => l.id === assignment.loadId);

                  return (
                    <Link
                      key={assignment.id}
                      href={`/assignments/${assignment.id}`}
                      className="block rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 transition hover:border-[#6366F1] dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {assignment.id.slice(0, 12)}...
                            </span>
                            <SwiggyBadge variant={statusInfo.variant}>{statusInfo.label}</SwiggyBadge>
                          </div>
                          {load && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {load.referenceCode}
                            </p>
                          )}
                          {assignment.score !== null && assignment.score !== undefined && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Score: {(assignment.score * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(assignment.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </SwiggyCard>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <SwiggyCard>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <Link href="/loads">
                <button className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 text-left transition hover:border-[#6366F1] dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                  <div className="text-2xl mb-2">📦</div>
                  <div className="font-semibold text-gray-900 dark:text-white">Manage Loads</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">View and manage all loads</div>
                </button>
              </Link>
              <Link href="/assignments">
                <button className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 text-left transition hover:border-[#6366F1] dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                  <div className="text-2xl mb-2">🤝</div>
                  <div className="font-semibold text-gray-900 dark:text-white">View Assignments</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Review vendor assignments</div>
                </button>
              </Link>
              <Link href="/loads">
                <button className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 text-left transition hover:border-[#6366F1] dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                  <div className="text-2xl mb-2">➕</div>
                  <div className="font-semibold text-gray-900 dark:text-white">Create Load</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Add a new load draft</div>
                </button>
              </Link>
              <Link href="/vendors">
                <button className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 text-left transition hover:border-[#6366F1] dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                  <div className="text-2xl mb-2">🏪</div>
                  <div className="font-semibold text-gray-900 dark:text-white">Manage Vendors</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Roadside partners</div>
                </button>
              </Link>
              <Link href="/wallets">
                <button className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 text-left transition hover:border-[#6366F1] dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                  <div className="text-2xl mb-2">💰</div>
                  <div className="font-semibold text-gray-900 dark:text-white">Manage Wallets</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Escrow and payments</div>
                </button>
              </Link>
              <Link href="/users">
                <button className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 text-left transition hover:border-[#6366F1] dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
                  <div className="text-2xl mb-2">👥</div>
                  <div className="font-semibold text-gray-900 dark:text-white">User Management</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Authentication & access</div>
                </button>
              </Link>
            </div>
          </SwiggyCard>
        </div>
      </div>
    </div>
  );
}

