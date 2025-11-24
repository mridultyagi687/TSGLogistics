import type { LoadOrder, LoadStatus } from "@tsg/shared";

const loadProgressMap: Record<
  LoadStatus,
  { percent: number; stage: string; descriptor: string }
> = {
  draft: { percent: 10, stage: "Draft", descriptor: "Awaiting publish" },
  published: {
    percent: 35,
    stage: "Published",
    descriptor: "Visible to marketplace"
  },
  booked: { percent: 55, stage: "Booked", descriptor: "Carrier confirmed" },
  in_transit: {
    percent: 80,
    stage: "In transit",
    descriptor: "Trip in progress"
  },
  completed: {
    percent: 100,
    stage: "Completed",
    descriptor: "Proof of delivery captured"
  },
  cancelled: {
    percent: 0,
    stage: "Cancelled",
    descriptor: "Workflow stopped"
  }
};

export function getLoadProgress(load: LoadOrder) {
  const details = loadProgressMap[load.status] ?? {
    percent: 0,
    stage: "Unknown",
    descriptor: "Status not mapped"
  };

  return {
    percent: details.percent,
    stage: details.stage,
    descriptor: details.descriptor
  };
}

