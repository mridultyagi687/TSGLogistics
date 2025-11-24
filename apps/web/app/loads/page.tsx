import type { LoadOrder, Trip } from "@tsg/shared";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { fetchLoads } from "../../lib/loads";
import { fetchTrips } from "../../lib/trips";
import { getPlatformStatus } from "../../lib/status";
import { getLoadProgress } from "../../lib/load-progress";
import { requireAuth } from "../../lib/require-auth";
import {
  currentGatewaySession,
  publishLoadCommand,
  scheduleTripCommand,
  startTripCommand,
  completeTripCommand,
  cancelTripCommand
} from "./actions";
import { ActionButton } from "./action-button";
import { CreateLoadForm } from "./create-load-form";
import { RealtimeTicker } from "./realtime-ticker";
import { SessionPanel } from "./session-panel";
import {
  SwiggyCard,
  SwiggyButton,
  SwiggyBadge,
  SwiggyStatCard
} from "../components/swiggy-ui";

function formatAddress(address: LoadOrder["pickup"]) {
  return `${address.city}, ${address.state}`;
}

function statusBadge(status: LoadOrder["status"]) {
  const statusMap: Record<
    LoadOrder["status"],
    { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
  > = {
    draft: { label: "Draft", variant: "default" },
    published: { label: "Published", variant: "info" },
    booked: { label: "Booked", variant: "info" },
    in_transit: { label: "In Transit", variant: "warning" },
    completed: { label: "Completed", variant: "success" },
    cancelled: { label: "Cancelled", variant: "danger" }
  };
  return statusMap[status];
}

function assignmentStatusBadge(status: LoadOrder["assignmentStatus"]) {
  const statusMap: Record<
    LoadOrder["assignmentStatus"],
    { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
  > = {
    UNASSIGNED: { label: "Unassigned", variant: "default" },
    SOURCING: { label: "Sourcing", variant: "info" },
    OFFERED: { label: "Offered", variant: "warning" },
    ACCEPTED: { label: "Accepted", variant: "success" },
    DECLINED: { label: "Declined", variant: "danger" },
    CANCELLED: { label: "Cancelled", variant: "danger" }
  };
  return statusMap[status];
}

function tripBadge(status: Trip["status"]) {
  const statusMap: Record<
    Trip["status"],
    { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
  > = {
    scheduled: { label: "Scheduled", variant: "default" },
    in_progress: { label: "In Progress", variant: "info" },
    at_stop: { label: "At Stop", variant: "warning" },
    completed: { label: "Completed", variant: "success" },
    exception: { label: "Exception", variant: "danger" }
  };
  return statusMap[status];
}

export const metadata = {
  title: "Loads Dashboard | TSG Logistics"
};

export default async function LoadsPage() {
  // Require authentication
  await requireAuth();

  const [status, loads, trips, gatewaySession] = await Promise.all([
    getPlatformStatus(),
    fetchLoads(),
    fetchTrips(),
    currentGatewaySession()
  ]);

  const activeLoads = loads.filter((l) => !["completed", "cancelled"].includes(l.status)).length;
  const inTransit = loads.filter((l) => l.status === "in_transit").length;
  const assignments = loads.filter((l) => l.assignmentStatus !== "UNASSIGNED").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Loads Dashboard</h1>
              <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
                Manage and track all your logistics operations
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SwiggyStatCard label="Active Loads" value={activeLoads} icon="📦" />
            <SwiggyStatCard label="In Transit" value={inTransit} icon="🚛" />
            <SwiggyStatCard label="Assignments" value={assignments} icon="🤝" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Loads Table */}
          <div className="lg:col-span-2">
            <SwiggyCard>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Loads</h2>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{loads.length} total loads</p>
                </div>
                <SwiggyButton variant="ghost" size="sm">
                  View All
                </SwiggyButton>
              </div>
              {loads.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">No loads found</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Create your first load to get started.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Reference
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Route
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Assignment
                        </th>
                        <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Progress
                        </th>
                        <th className="px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                      {loads.slice(0, 10).map((load) => {
                        const statusInfo = statusBadge(load.status);
                        const assignmentInfo = assignmentStatusBadge(load.assignmentStatus);
                        const trip = trips.find((t) => t.loadId === load.id);
                        const tripInfo = trip ? tripBadge(trip.status) : null;
                        const progress = getLoadProgress(load);
                        const canStartTrip = trip && trip.status === "scheduled";
                        const canCompleteTrip = trip && trip.status === "in_progress";
                        const canCancelTrip =
                          trip &&
                          trip.status !== "completed" &&
                          trip.status !== "exception";
                        const loadPayload = JSON.stringify({
                          id: load.id,
                          orgId: load.orgId,
                          pickup: load.pickup,
                          drop: load.drop,
                          slaHours: load.slaHours
                        });

                        return (
                          <tr key={load.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <td className="whitespace-nowrap px-4 py-4">
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {load.referenceCode}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{load.orgId}</div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatAddress(load.pickup)} → {formatAddress(load.drop)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {load.cargoType} · {load.vehicleType}
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4">
                              <SwiggyBadge variant={statusInfo.variant}>{statusInfo.label}</SwiggyBadge>
                            </td>
                            <td className="px-4 py-4">
                              <div className="space-y-1">
                                <SwiggyBadge variant={assignmentInfo.variant}>
                                  {assignmentInfo.label}
                                </SwiggyBadge>
                                {load.assignmentId && (
                                  <Link
                                    href={`/assignments/${load.assignmentId}`}
                                    className="block text-xs font-semibold text-[#6366F1] hover:text-[#4F46E5] transition"
                                  >
                                    View →
                                  </Link>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="w-32">
                                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                                  <span className="font-semibold">{progress.stage}</span>
                                  <span className="font-bold">{progress.percent}%</span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all"
                                    style={{ width: `${progress.percent}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-2">
                                {load.status === "draft" && (
                                  <form action={publishLoadCommand}>
                                    <input type="hidden" name="loadId" value={load.id} />
                                    <ActionButton
                                      label="Publish"
                                      pendingLabel="Publishing..."
                                      variant="primary"
                                    />
                                  </form>
                                )}
                                {!trip && load.status === "published" && (
                                  <form action={scheduleTripCommand}>
                                    <input type="hidden" name="load" value={loadPayload} />
                                    <ActionButton
                                      label="Schedule"
                                      pendingLabel="Scheduling..."
                                      variant="ghost"
                                    />
                                  </form>
                                )}
                                {canStartTrip && (
                                  <form action={startTripCommand}>
                                    <input type="hidden" name="tripId" value={trip!.id} />
                                    <ActionButton
                                      label="Start"
                                      pendingLabel="Starting..."
                                      variant="ghost"
                                    />
                                  </form>
                                )}
                                {canCompleteTrip && (
                                  <form action={completeTripCommand}>
                                    <input type="hidden" name="tripId" value={trip!.id} />
                                    <ActionButton
                                      label="Complete"
                                      pendingLabel="Completing..."
                                      variant="primary"
                                    />
                                  </form>
                                )}
                                {canCancelTrip && (
                                  <form action={cancelTripCommand}>
                                    <input type="hidden" name="tripId" value={trip!.id} />
                                    <input type="hidden" name="reason" value="Cancelled via dashboard" />
                                    <ActionButton
                                      label="Cancel"
                                      pendingLabel="Cancelling..."
                                      variant="danger"
                                    />
                                  </form>
                                )}
                              </div>
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

          {/* Sidebar */}
          <div className="space-y-6">
            <SessionPanel
              hasGatewayToken={Boolean(gatewaySession.token)}
              fallbackOrgId={gatewaySession.orgId}
            />
            <CreateLoadForm />
            <RealtimeTicker
              initialSnapshot={{
                loads,
                trips,
                timestamp: new Date().toISOString()
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
