"use server";

import { revalidatePath } from "next/cache";
import {
  appendAssignmentEvent,
  clearLoadAssignment,
  updateAssignment,
  updateLoadAssignmentStatus
} from "../../lib/assignments";

function getRequired(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing ${key}`);
  }
  return value;
}

export async function acceptAssignmentAction(formData: FormData) {
  const assignmentId = getRequired(formData, "assignmentId");
  const loadId = getRequired(formData, "loadId");

  const now = new Date().toISOString();
  await updateAssignment(assignmentId, {
    status: "ACCEPTED",
    metadata: {
      ...(formData.get("metadata") ? JSON.parse(String(formData.get("metadata"))) : {}),
      acceptedAt: now
    }
  });

  await updateLoadAssignmentStatus(loadId, {
    status: "ACCEPTED",
    metadata: {
      latestAction: "Assignment accepted",
      acceptedAt: now
    },
    lockedAt: now
  });

  await appendAssignmentEvent(assignmentId, {
    type: "ACCEPTED",
    payload: { acceptedAt: now }
  });

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath("/loads");
}

export async function declineAssignmentAction(formData: FormData) {
  const assignmentId = getRequired(formData, "assignmentId");
  const loadId = getRequired(formData, "loadId");
  const reason = String(formData.get("reason") ?? "Declined via control tower UI");

  const metadata = {
    reason,
    declinedAt: new Date().toISOString()
  };

  await updateAssignment(assignmentId, {
    status: "DECLINED",
    metadata
  });

  await clearLoadAssignment(loadId);
  await updateLoadAssignmentStatus(loadId, {
    status: "SOURCING",
    metadata: {
      latestAction: "Assignment declined",
      ...metadata
    }
  });

  await appendAssignmentEvent(assignmentId, {
    type: "DECLINED",
    payload: metadata
  });

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath("/loads");
}

export async function cancelAssignmentAction(formData: FormData) {
  const assignmentId = getRequired(formData, "assignmentId");
  const loadId = getRequired(formData, "loadId");
  const reason = String(formData.get("reason") ?? "Cancelled manually");

  const metadata = {
    reason,
    cancelledAt: new Date().toISOString()
  };

  await updateAssignment(assignmentId, {
    status: "CANCELLED",
    metadata
  });

  await clearLoadAssignment(loadId);
  await updateLoadAssignmentStatus(loadId, {
    status: "SOURCING",
    metadata: {
      latestAction: "Assignment cancelled",
      ...metadata
    }
  });

  await appendAssignmentEvent(assignmentId, {
    type: "CANCELLED",
    payload: metadata
  });

  revalidatePath("/assignments");
  revalidatePath(`/assignments/${assignmentId}`);
  revalidatePath("/loads");
}
