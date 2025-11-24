import type {
  AssignmentEvent,
  AssignmentSummary,
  LoadAssignmentStatus
} from "@tsg/shared";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "../components/cards";

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function renderValue(value: unknown, level: number): ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-500">—</span>;
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return (
          <span className="flex flex-wrap items-baseline gap-2">
            <span>{parsed.toLocaleString()}</span>
            <span className="text-gray-500">
              {formatDistanceToNow(parsed, { addSuffix: true })}
            </span>
          </span>
        );
      }
    }

    return value;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-gray-500">—</span>;
    }

    return (
      <ul className="space-y-1 text-gray-700">
        {value.map((item, index) => (
          <li
            key={index}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2"
          >
            {renderValue(item, level + 1)}
          </li>
        ))}
      </ul>
    );
  }

  if (isPlainObject(value)) {
    return (
      <MetadataList
        data={value as Record<string, unknown>}
        level={level + 1}
      />
    );
  }

  return String(value);
}

export function MetadataList({
  data,
  level = 0
}: {
  data: Record<string, unknown>;
  level?: number;
}) {
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <p className="text-xs text-gray-500">No data available.</p>;
  }

  const spacing = level === 0 ? "space-y-3" : "space-y-2";

  return (
    <dl className={`${spacing}`}>
      {entries.map(([key, value]) => {
        const complex = Array.isArray(value) || isPlainObject(value);
        return (
          <div key={key} className="grid gap-1">
            <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gray-500">
              {formatLabel(key)}
            </dt>
            <dd
              className={`text-xs leading-relaxed text-gray-700 ${
                complex ? "space-y-2" : ""
              }`}
            >
              {renderValue(value, level)}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

const assignmentStatusMap: Record<
  AssignmentSummary["status"],
  "default" | "success" | "warning" | "danger" | "info"
> = {
  PENDING: "default",
  OFFERED: "warning",
  ACCEPTED: "success",
  DECLINED: "danger",
  CANCELLED: "danger",
  EXPIRED: "default"
};

const loadAssignmentMap: Record<
  LoadAssignmentStatus,
  "default" | "success" | "warning" | "danger" | "info"
> = {
  UNASSIGNED: "default",
  SOURCING: "info",
  OFFERED: "warning",
  ACCEPTED: "success",
  DECLINED: "danger",
  CANCELLED: "danger"
};

export function AssignmentStatusBadge({
  status
}: {
  status: AssignmentSummary["status"];
}) {
  return (
    <Badge variant={assignmentStatusMap[status]}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export function LoadAssignmentStatusBadge({
  status
}: {
  status: LoadAssignmentStatus;
}) {
  return (
    <Badge variant={loadAssignmentMap[status]}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

export function AssignmentScore({ score }: { score?: number | null }) {
  if (score === null || score === undefined) {
    return <span className="text-xs text-gray-500">—</span>;
  }

  const formatted = (score * 100).toFixed(0);
  const color =
    score >= 0.75
      ? "text-green-600"
      : score >= 0.5
        ? "text-yellow-600"
        : "text-gray-600";

  return (
    <span className={`text-sm font-semibold ${color}`}>
      {formatted}%
    </span>
  );
}

export function AssignmentTimeline({
  events
}: {
  events: AssignmentEvent[];
}) {
  if (events.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-500">
        No events recorded yet.
      </p>
    );
  }

  return (
    <ol className="space-y-4">
      {events
        .slice()
        .sort((a, b) =>
          new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
        )
        .map((event) => (
          <li key={event.id} className="flex gap-4">
            <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">
                {event.type.replace(/_/g, " ")}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(event.occurredAt).toLocaleString()} ·
                {" "}
                {formatDistanceToNow(new Date(event.occurredAt), {
                  addSuffix: true
                })}
              </p>
              {event.payload ? (
                <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <MetadataList data={event.payload} level={1} />
                </div>
              ) : null}
            </div>
          </li>
        ))}
    </ol>
  );
}

export function LoadReference({
  loadId,
  referenceCode,
  orgId
}: {
  loadId: string;
  referenceCode?: string;
  orgId?: string;
}) {
  return (
    <Link
      href={`/loads#${loadId}`}
      className="text-sm font-semibold text-blue-600 transition hover:text-blue-800"
    >
      {referenceCode ?? loadId}
      {orgId ? <span className="ml-2 text-xs text-gray-500">({orgId})</span> : null}
    </Link>
  );
}
