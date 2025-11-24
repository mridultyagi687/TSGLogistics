import type { Trip } from "@tsg/shared";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { fetchTrips } from "../../lib/trips";
import { fetchLoads } from "../../lib/loads";
import { getPlatformStatus } from "../../lib/status";
import { requireAuth } from "../../lib/require-auth";
import {
  SwiggyCard,
  SwiggyBadge,
  SwiggyStatCard
} from "../components/swiggy-ui";

function formatAddress(address: { city: string; state: string }) {
  return `${address.city}, ${address.state}`;
}

function tripStatusBadge(status: Trip["status"]) {
  const statusConfig: Record<
    Trip["status"],
    { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
  > = {
    scheduled: { label: "Scheduled", variant: "default" },
    in_progress: { label: "In Progress", variant: "info" },
    at_stop: { label: "At Stop", variant: "warning" },
    completed: { label: "Completed", variant: "success" },
    exception: { label: "Exception", variant: "danger" }
  };

  const config = statusConfig[status] || statusConfig.scheduled;
  return <SwiggyBadge variant={config.variant}>{config.label}</SwiggyBadge>;
}

export default async function TripsPage() {
  // Require authentication
  await requireAuth();

  const [status, trips, loads] = await Promise.all([
    getPlatformStatus(),
    fetchTrips(),
    fetchLoads()
  ]);

  const loadMap = new Map(loads.map((load) => [load.id, load]));

  const scheduled = trips.filter((t) => t.status === "scheduled").length;
  const inProgress = trips.filter((t) => t.status === "in_progress").length;
  const completed = trips.filter((t) => t.status === "completed").length;
  const exception = trips.filter((t) => t.status === "exception").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Trips</h1>
              <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
                Track and manage vehicle trips for your loads
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 shadow-sm">
                <span
                  className={`h-3 w-3 rounded-full ${
                    status.status === "ok" ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                  }`}
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {status.status === "ok" ? "Operational" : "Degraded"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <SwiggyStatCard label="Scheduled" value={scheduled} icon="📅" />
            <SwiggyStatCard label="In Progress" value={inProgress} icon="🚛" />
            <SwiggyStatCard label="Completed" value={completed} icon="✅" />
            <SwiggyStatCard label="Exception" value={exception} icon="⚠️" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <SwiggyCard>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Trips</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{trips.length} total trips</p>
            </div>
            <Link href="/loads">
              <button className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-700">
                View Loads →
              </button>
            </Link>
          </div>
          {trips.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-6xl mb-4">🚛</div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">No trips yet</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Schedule a trip from a load to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Trip ID
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Load
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Route
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Stops
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Scheduled
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {trips.map((trip) => {
                    const load = loadMap.get(trip.loadId);
                    const pickup = trip.stops[0]?.address;
                    const drop = trip.stops[trip.stops.length - 1]?.address;
                    return (
                      <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <td className="whitespace-nowrap px-4 py-4">
                          <Link
                            href={`/trips/${trip.id}`}
                            className="text-sm font-bold text-[#6366F1] hover:text-[#4F46E5] transition"
                          >
                            {trip.id.slice(0, 12)}...
                          </Link>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(trip.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {tripStatusBadge(trip.status)}
                        </td>
                        <td className="px-4 py-4">
                          {load ? (
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {load.referenceCode}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {load.orgId}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {trip.loadId.slice(0, 12)}...
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {pickup && drop ? (
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatAddress(pickup)} → {formatAddress(drop)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {trip.stops.length} stops
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {trip.stops.length}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {trip.scheduledAt
                            ? formatDistanceToNow(new Date(trip.scheduledAt), {
                                addSuffix: true
                              })
                            : "—"}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(trip.updatedAt), {
                            addSuffix: true
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SwiggyCard>
      </div>
    </div>
  );
}

