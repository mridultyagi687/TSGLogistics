export type ISODateString = string;

export interface AuditableEntity {
  id: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface VendorSummary extends AuditableEntity {
  orgId: string;
  name: string;
  services: ServiceTag[];
  rating?: number;
  geoHash?: string;
  address: Address;
  contactPhone?: string;
}

export const serviceTags = {
  MECHANIC: "mechanic",
  SPARES: "spares",
  FUEL: "fuel",
  DHABA: "dhaba",
  PARKING: "parking",
  CRANE: "crane",
  TYRE: "tyre",
  WASH: "wash",
  WEIGH_BRIDGE: "weigh_bridge"
} as const;

export type ServiceTag = (typeof serviceTags)[keyof typeof serviceTags];

export const loadStatuses = {
  DRAFT: "draft",
  PUBLISHED: "published",
  BOOKED: "booked",
  IN_TRANSIT: "in_transit",
  COMPLETED: "completed",
  CANCELLED: "cancelled"
} as const;

export type LoadStatus = (typeof loadStatuses)[keyof typeof loadStatuses];

export interface LoadOrder extends AuditableEntity {
  orgId: string;
  referenceCode: string;
  pickup: Address;
  drop: Address;
  cargoType: string;
  cargoValue: number;
  slaHours: number;
  vehicleType: string;
  status: LoadStatus;
  priceQuoteBand: {
    min: number;
    max: number;
    currency: string;
    confidence: number;
  };
  assignmentId?: string;
  assignmentStatus: LoadAssignmentStatus;
  assignmentMetadata?: Record<string, unknown>;
  assignmentLockedAt?: ISODateString;
}

export const tripStatuses = {
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in_progress",
  AT_STOP: "at_stop",
  COMPLETED: "completed",
  EXCEPTION: "exception"
} as const;

export type TripStatus = (typeof tripStatuses)[keyof typeof tripStatuses];

export interface TripStop extends AuditableEntity {
  sequence: number;
  plannedArrival: ISODateString;
  plannedDeparture: ISODateString;
  actualArrival?: ISODateString;
  actualDeparture?: ISODateString;
  detentionMinutes?: number;
  address: Address;
}

export interface Trip extends AuditableEntity {
  loadId: string;
  vehicleId?: string;
  driverId?: string;
  status: TripStatus;
  assignmentId?: string;
  scheduledAt: ISODateString;
  startedAt?: ISODateString;
  completedAt?: ISODateString;
  cancelledAt?: ISODateString;
  exceptionReason?: string;
  totalDetentionMinutes: number;
  stops: TripStop[];
}

export interface WalletAccount extends AuditableEntity {
  orgId: string;
  balance: number;
  currency: string;
  type: "ESCROW" | "FLEET" | "VENDOR";
  status: "ACTIVE" | "SUSPENDED";
}

export type WalletDirection = "CREDIT" | "DEBIT";

export interface WalletTransaction extends AuditableEntity {
  walletId: string;
  direction: WalletDirection;
  amount: number;
  currency: string;
  reference?: string;
  source?: string;
  occurredAt: ISODateString;
  metadata?: Record<string, unknown>;
}

export const assignmentStatuses = {
  PENDING: "PENDING",
  OFFERED: "OFFERED",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED"
} as const;

export type AssignmentStatus =
  (typeof assignmentStatuses)[keyof typeof assignmentStatuses];

export const assignmentEventTypes = {
  CREATED: "CREATED",
  OFFERED: "OFFERED",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
  NOTE_ADDED: "NOTE_ADDED"
} as const;

export type AssignmentEventType =
  (typeof assignmentEventTypes)[keyof typeof assignmentEventTypes];

export const loadAssignmentStatuses = {
  UNASSIGNED: "UNASSIGNED",
  SOURCING: "SOURCING",
  OFFERED: "OFFERED",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  CANCELLED: "CANCELLED"
} as const;

export type LoadAssignmentStatus =
  (typeof loadAssignmentStatuses)[keyof typeof loadAssignmentStatuses];

export interface AssignmentSummary extends AuditableEntity {
  orgId: string;
  vendorId: string;
  loadId: string;
  tripId?: string;
  status: AssignmentStatus;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface AssignmentEvent extends AuditableEntity {
  assignmentId: string;
  type: AssignmentEventType;
  occurredAt: ISODateString;
  payload?: Record<string, unknown>;
}

export interface VendorCapability extends AuditableEntity {
  vendorId: string;
  payload: Record<string, unknown>;
}

