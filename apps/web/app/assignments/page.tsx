import Link from "next/link";
import type { Metadata } from "next";
import { fetchAssignments } from "../../lib/assignments";
import { fetchLoads } from "../../lib/loads";
import { requireAuth } from "../../lib/require-auth";
import {
  AssignmentScore,
  AssignmentStatusBadge,
  LoadAssignmentStatusBadge
} from "./components";
import {
  SwiggyCard,
  SwiggyStatCard,
  SwiggyBadge
} from "../components/swiggy-ui";

export const metadata: Metadata = {
  title: "Assignments | TSG Logistics"
};

function summarize(assignments: Awaited<ReturnType<typeof fetchAssignments>>) {
  return assignments.reduce<Record<string, number>>((acc, assignment) => {
    acc[assignment.status] = (acc[assignment.status] ?? 0) + 1;
    return acc;
  }, {});
}

export default async function AssignmentsPage() {
  // Require authentication
  await requireAuth();

  const [assignments, loads] = await Promise.all([
    fetchAssignments(),
    fetchLoads()
  ]);

  const loadMap = new Map(loads.map((load) => [load.id, load]));
  const summary = summarize(assignments);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
              <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
                Review and manage vendor assignments for your loads
              </p>
            </div>
            <Link href="/loads">
              <button className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm transition hover:bg-gray-50 dark:hover:bg-gray-700">
                View Loads →
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <SwiggyStatCard
              label="Awaiting Response"
              value={summary.OFFERED ?? 0}
              icon="⏳"
            />
            <SwiggyStatCard
              label="Accepted"
              value={summary.ACCEPTED ?? 0}
              icon="✅"
            />
            <SwiggyStatCard
              label="Declined"
              value={summary.DECLINED ?? 0}
              icon="❌"
            />
            <SwiggyStatCard
              label="Pending"
              value={summary.PENDING ?? 0}
              icon="📋"
            />
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <SwiggyCard>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Assignments</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{assignments.length} total</p>
            </div>
          </div>
          {assignments.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-6xl mb-4">🤝</div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">No assignments yet</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Publish a load to trigger vendor assignments.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Assignment ID
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Score
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Load
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Vendor
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Load Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {assignments.map((assignment) => {
                    const load = loadMap.get(assignment.loadId);
                    return (
                      <tr key={assignment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <td className="whitespace-nowrap px-4 py-4">
                          <Link
                            href={`/assignments/${assignment.id}`}
                            className="text-sm font-bold text-[#6366F1] hover:text-[#4F46E5] transition"
                          >
                            {assignment.id.slice(0, 12)}...
                          </Link>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(assignment.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <AssignmentStatusBadge status={assignment.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          <AssignmentScore score={assignment.score ?? undefined} />
                        </td>
                        <td className="px-4 py-4">
                          {load ? (
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {load.referenceCode}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {load.pickup.city} → {load.drop.city}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {assignment.loadId.slice(0, 12)}...
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {assignment.vendorId.slice(0, 12)}...
                          </div>
                          {(() => {
                            const pricing = assignment.metadata?.pricing as
                              | { quote?: number | string; currency?: string }
                              | undefined;
                            if (pricing?.quote) {
                              const formattedQuote =
                                typeof pricing.quote === "number"
                                  ? pricing.quote.toLocaleString()
                                  : pricing.quote;
                              return (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ₹{formattedQuote}
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4">
                          {load ? (
                            <LoadAssignmentStatusBadge status={load.assignmentStatus} />
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(assignment.updatedAt).toLocaleString()}
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
