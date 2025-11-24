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
export declare const serviceTags: {
    readonly MECHANIC: "mechanic";
    readonly SPARES: "spares";
    readonly FUEL: "fuel";
    readonly DHABA: "dhaba";
    readonly PARKING: "parking";
    readonly CRANE: "crane";
    readonly TYRE: "tyre";
    readonly WASH: "wash";
    readonly WEIGH_BRIDGE: "weigh_bridge";
};
export type ServiceTag = (typeof serviceTags)[keyof typeof serviceTags];
export declare const loadStatuses: {
    readonly DRAFT: "draft";
    readonly PUBLISHED: "published";
    readonly BOOKED: "booked";
    readonly IN_TRANSIT: "in_transit";
    readonly COMPLETED: "completed";
    readonly CANCELLED: "cancelled";
};
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
export declare const tripStatuses: {
    readonly SCHEDULED: "scheduled";
    readonly IN_PROGRESS: "in_progress";
    readonly AT_STOP: "at_stop";
    readonly COMPLETED: "completed";
    readonly EXCEPTION: "exception";
};
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
export declare const assignmentStatuses: {
    readonly PENDING: "PENDING";
    readonly OFFERED: "OFFERED";
    readonly ACCEPTED: "ACCEPTED";
    readonly DECLINED: "DECLINED";
    readonly CANCELLED: "CANCELLED";
    readonly EXPIRED: "EXPIRED";
};
export type AssignmentStatus = (typeof assignmentStatuses)[keyof typeof assignmentStatuses];
export declare const assignmentEventTypes: {
    readonly CREATED: "CREATED";
    readonly OFFERED: "OFFERED";
    readonly ACCEPTED: "ACCEPTED";
    readonly DECLINED: "DECLINED";
    readonly CANCELLED: "CANCELLED";
    readonly EXPIRED: "EXPIRED";
    readonly NOTE_ADDED: "NOTE_ADDED";
};
export type AssignmentEventType = (typeof assignmentEventTypes)[keyof typeof assignmentEventTypes];
export declare const loadAssignmentStatuses: {
    readonly UNASSIGNED: "UNASSIGNED";
    readonly SOURCING: "SOURCING";
    readonly OFFERED: "OFFERED";
    readonly ACCEPTED: "ACCEPTED";
    readonly DECLINED: "DECLINED";
    readonly CANCELLED: "CANCELLED";
};
export type LoadAssignmentStatus = (typeof loadAssignmentStatuses)[keyof typeof loadAssignmentStatuses];
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
//# sourceMappingURL=index.d.ts.map