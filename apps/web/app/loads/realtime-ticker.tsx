'use client';

import { useEffect, useMemo, useState } from "react";
import type { LoadOrder, Trip } from "@tsg/shared";
import type { GatewaySnapshot } from "../../lib/snapshot";
import { getLoadProgress } from "../../lib/load-progress";

interface RealtimeTickerProps {
  initialSnapshot: GatewaySnapshot;
  pollIntervalMs?: number;
}

type CountRecord = Record<string, number>;

function buildStatusCounts(loads: LoadOrder[]): CountRecord {
  return loads.reduce<CountRecord>((acc, load) => {
    acc[load.status] = (acc[load.status] ?? 0) + 1;
    return acc;
  }, {});
}

function buildTripCounts(trips: Trip[]): CountRecord {
  return trips.reduce<CountRecord>((acc, trip) => {
    acc[trip.status] = (acc[trip.status] ?? 0) + 1;
    return acc;
  }, {});
}

function describeCounts(title: string, counts: CountRecord) {
  const entries = Object.entries(counts);
  if (entries.length === 0) {
    return `${title}: 0`;
  }
  return `${title}: ` + entries.map(([status, count]) => `${status} (${count})`).join(" · ");
}

export function RealtimeTicker({
  initialSnapshot,
  pollIntervalMs = 15000
}: RealtimeTickerProps) {
  // Use functional initialization to prevent re-initialization on re-renders
  const [snapshot, setSnapshot] = useState(() => initialSnapshot);
  const [error, setError] = useState<string | null>(null);
  const [usePolling, setUsePolling] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("EventSource" in window)) {
      return;
    }

    const source = new EventSource("/api/telemetry/stream");
    let opened = false;

    source.onopen = () => {
      opened = true;
      setUsePolling(false);
      setError(null);
    };

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as GatewaySnapshot;
        setSnapshot(payload);
      } catch {
        // Silently ignore malformed payloads
      }
    };

    source.onerror = () => {
      source.close();
      if (opened) {
        setError("Telemetry channel interrupted, reverting to polling.");
      }
      setUsePolling(true);
    };

    const fallbackHandler = () => {
      setUsePolling(true);
    };

    source.addEventListener("fallback", fallbackHandler);

    return () => {
      source.removeEventListener("fallback", fallbackHandler);
      source.close();
    };
  }, []);

  useEffect(() => {
    if (!usePolling || !mounted) {
      return;
    }

    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    async function tick() {
      // Double-check mount status before async operations
      if (!isMounted) return;
      
      try {
        const response = await fetch("/api/gateway/snapshot", {
          cache: "no-store",
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        if (!response.ok) {
          throw new Error(`Gateway snapshot failed with ${response.status}`);
        }
        const payload = (await response.json()) as GatewaySnapshot;
        // Check mount status again before setting state
        if (isMounted) {
          setSnapshot(payload);
          setError(null);
        }
      } catch (err) {
        // Ignore abort errors (timeout or unmount)
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to refresh snapshot."
          );
        }
      }
    }

    // Initial tick
    tick();

    // Set up interval only if still mounted
    if (isMounted) {
      intervalId = setInterval(tick, pollIntervalMs);
    }

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [pollIntervalMs, usePolling, mounted]);

  const loadCounts = useMemo(
    () => buildStatusCounts(snapshot.loads),
    [snapshot.loads]
  );
  const tripCounts = useMemo(
    () => buildTripCounts(snapshot.trips),
    [snapshot.trips]
  );
  const averageProgress = useMemo(() => {
    if (snapshot.loads.length === 0) {
      return 0;
    }
    const sum = snapshot.loads.reduce((acc, load) => {
      const { percent } = getLoadProgress(load);
      return acc + percent;
    }, 0);
    return Math.round(sum / snapshot.loads.length);
  }, [snapshot.loads]);
  const averageDetention = useMemo(() => {
    if (snapshot.trips.length === 0) {
      return 0;
    }
    const sum = snapshot.trips.reduce(
      (acc, trip) => acc + (trip.totalDetentionMinutes ?? 0),
      0
    );
    return Math.round(sum / snapshot.trips.length);
  }, [snapshot.trips]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 p-4 shadow-inner shadow-slate-200 dark:shadow-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Live status
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {describeCounts("Loads", loadCounts)}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {describeCounts("Trips", tripCounts)}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400">
            Avg load progress: {averageProgress}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Avg detention: {averageDetention} min
          </p>
        </div>
        <div className="text-right text-xs text-slate-500 dark:text-slate-400">
          <p>Last update</p>
          <p className="font-semibold text-slate-700 dark:text-slate-300">
            {mounted
              ? new Date(snapshot.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true
                })
              : "--:--:-- --"}
          </p>
          {error ? (
            <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">Connection issue</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

