import type {
  AssignmentEvent,
  AssignmentSummary,
  LoadAssignmentStatus
} from "@tsg/shared";
import { gatewayJsonFetch } from "./gateway";

export interface CreateAssignmentPayload {
  orgId: string;
  vendorId: string;
  loadId: string;
  tripId?: string;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface UpdateAssignmentPayload {
  status: AssignmentSummary["status"];
  metadata?: Record<string, unknown>;
}

export interface LinkLoadAssignmentPayload {
  assignmentId: string;
  status?: LoadAssignmentStatus;
  metadata?: Record<string, unknown>;
  lockedAt?: Date | string;
}

export async function fetchAssignments(params?: {
  orgId?: string;
  vendorId?: string;
  loadId?: string;
  statuses?: string[];
}): Promise<AssignmentSummary[]> {
  const search = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (!value) {
        return;
      }
      if (Array.isArray(value)) {
        search.set(key, value.join(","));
      } else {
        search.set(key, value);
      }
    });
  }

  const query = search.toString();
  const path = `/api/vendor-assignments${query ? `?${query}` : ""}`;
  try {
    return await gatewayJsonFetch<AssignmentSummary[]>(path, {
      headers: { Accept: "application/json" }
    });
  } catch (error) {
    console.error("Failed to fetch assignments:", error);
    return [];
  }
}

export async function fetchAssignment(
  assignmentId: string
): Promise<AssignmentSummary & { events: AssignmentEvent[] }> {
  return gatewayJsonFetch<
    AssignmentSummary & { events: AssignmentEvent[] }
  >(`/api/vendor-assignments/${assignmentId}`, {
    headers: { Accept: "application/json" }
  });
}

export async function createAssignment(
  payload: CreateAssignmentPayload
): Promise<AssignmentSummary> {
  return gatewayJsonFetch<AssignmentSummary>("/api/vendor-assignments", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function updateAssignment(
  assignmentId: string,
  payload: UpdateAssignmentPayload
): Promise<AssignmentSummary> {
  return gatewayJsonFetch<AssignmentSummary>(
    `/api/vendor-assignments/${assignmentId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload)
    }
  );
}

export async function appendAssignmentEvent(
  assignmentId: string,
  event: Pick<AssignmentEvent, "type" | "payload">
): Promise<AssignmentEvent> {
  return gatewayJsonFetch<AssignmentEvent>(
    `/api/vendor-assignments/${assignmentId}/events`,
    {
      method: "POST",
      body: JSON.stringify(event)
    }
  );
}

export async function linkLoadAssignment(
  loadId: string,
  payload: LinkLoadAssignmentPayload
) {
  return gatewayJsonFetch(`/api/loads/${loadId}/assignment`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export async function clearLoadAssignment(loadId: string) {
  return gatewayJsonFetch(`/api/loads/${loadId}/assignment`, {
    method: "DELETE"
  });
}

export async function updateLoadAssignmentStatus(
  loadId: string,
  payload: {
    status: LoadAssignmentStatus;
    metadata?: Record<string, unknown>;
    lockedAt?: Date | string | null;
  }
) {
  const body: Record<string, unknown> = {
    status: payload.status,
    metadata: payload.metadata ?? undefined
  };
  if (payload.lockedAt) {
    body.lockedAt =
      typeof payload.lockedAt === "string"
        ? payload.lockedAt
        : payload.lockedAt.toISOString();
  }

  return gatewayJsonFetch(`/api/loads/${loadId}/assignment/status`, {
    method: "PATCH",
    body: JSON.stringify(body)
  });
}
