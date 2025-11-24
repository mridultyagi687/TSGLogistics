import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchAssignment } from "../../../lib/assignments";
import { fetchLoads } from "../../../lib/loads";
import { requireAuth } from "../../../lib/require-auth";
import {
  AssignmentScore,
  AssignmentStatusBadge,
  AssignmentTimeline,
  LoadAssignmentStatusBadge,
  MetadataList
} from "../components";
import {
  acceptAssignmentAction,
  cancelAssignmentAction,
  declineAssignmentAction
} from "../actions";
import {
  SwiggyCard,
  SwiggyButton,
  SwiggyTextarea
} from "../../components/swiggy-ui";

interface AssignmentDetailPageProps {
  params: { assignmentId: string };
}

export async function generateMetadata({
  params
}: AssignmentDetailPageProps): Promise<Metadata> {
  return {
    title: `Assignment ${params.assignmentId} | TSG Logistics`
  };
}

export default async function AssignmentDetailPage({
  params
}: AssignmentDetailPageProps) {
  // Require authentication
  await requireAuth();

  let assignment;
  let loads;
  try {
    [assignment, loads] = await Promise.all([
      fetchAssignment(params.assignmentId),
      fetchLoads()
    ]);
  } catch (error) {
    if (error instanceof Error && error.message.includes("404")) {
      notFound();
    }
    throw error;
  }

  if (!assignment) {
    notFound();
  }

  const load = loads.find((item) => item.id === assignment.loadId);
  const actionDisabled =
    assignment.status === "ACCEPTED" || assignment.status === "CANCELLED";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Link
              href="/assignments"
              className="text-sm font-semibold text-[#6366F1] transition hover:text-[#4F46E5]"
            >
              ← Back to assignments
            </Link>
            <div className="mt-4 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Assignment {assignment.id.slice(0, 12)}...
                </h1>
                <div className="mt-2 flex items-center gap-3">
                  <AssignmentStatusBadge status={assignment.status} />
                  <span className="text-sm text-gray-500">
                    Created {new Date(assignment.createdAt).toLocaleDateString()} • Updated{" "}
                    {new Date(assignment.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <SwiggyCard className="w-64">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Scoring
                </p>
                <div className="mt-2">
                  <AssignmentScore score={assignment.score ?? undefined} />
                </div>
                {assignment.metadata && (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <MetadataList data={assignment.metadata} />
                  </div>
                )}
              </SwiggyCard>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Timeline */}
          <div className="lg:col-span-2">
            <SwiggyCard>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Timeline</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Status changes and events from the vendor service
                </p>
              </div>
              <div className="mt-6">
                <AssignmentTimeline events={assignment.events} />
              </div>
            </SwiggyCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Load Info */}
            <SwiggyCard>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">Load Information</h3>
              </div>
              {load ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      {load.referenceCode}
                    </span>
                    <LoadAssignmentStatusBadge status={load.assignmentStatus} />
                  </div>
                  <p className="text-sm text-gray-600">
                    {load.pickup.city} → {load.drop.city}
                  </p>
                  <p className="text-xs text-gray-500">
                    Org {load.orgId} • SLA {load.slaHours}h
                  </p>
                  <Link href="/loads">
                    <SwiggyButton variant="outline" size="sm" className="w-full">
                      View Load →
                    </SwiggyButton>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Load {assignment.loadId.slice(0, 12)}...
                </p>
              )}
            </SwiggyCard>

            {/* Actions */}
            <SwiggyCard>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">Vendor Response</h3>
              </div>
              <p className="mb-4 text-sm text-gray-600">
                Manage the assignment status. Actions will update both vendor and orders services.
              </p>
              <div className="space-y-3">
                <form action={acceptAssignmentAction}>
                  <input type="hidden" name="assignmentId" value={assignment.id} />
                  <input type="hidden" name="loadId" value={assignment.loadId} />
                  <SwiggyButton
                    type="submit"
                    disabled={assignment.status === "ACCEPTED"}
                    className="w-full"
                  >
                    Accept Assignment
                  </SwiggyButton>
                </form>

                <form action={declineAssignmentAction} className="space-y-2">
                  <input type="hidden" name="assignmentId" value={assignment.id} />
                  <input type="hidden" name="loadId" value={assignment.loadId} />
                  <SwiggyTextarea
                    label="Decline Reason"
                    name="reason"
                    rows={2}
                    placeholder="Optional note"
                    defaultValue="Vendor declined the offer"
                  />
                  <SwiggyButton
                    type="submit"
                    variant="outline"
                    disabled={actionDisabled}
                    className="w-full"
                  >
                    Decline Assignment
                  </SwiggyButton>
                </form>

                <form action={cancelAssignmentAction} className="space-y-2">
                  <input type="hidden" name="assignmentId" value={assignment.id} />
                  <input type="hidden" name="loadId" value={assignment.loadId} />
                  <SwiggyTextarea
                    label="Cancel Reason"
                    name="reason"
                    rows={2}
                    placeholder="Optional note"
                    defaultValue="Assignment cancelled manually"
                  />
                  <SwiggyButton
                    type="submit"
                    variant="danger"
                    disabled={assignment.status === "CANCELLED"}
                    className="w-full"
                  >
                    Cancel Assignment
                  </SwiggyButton>
                </form>
              </div>
            </SwiggyCard>
          </div>
        </div>
      </div>
    </div>
  );
}
