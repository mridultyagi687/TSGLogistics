"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadAssignmentStatuses = exports.assignmentEventTypes = exports.assignmentStatuses = exports.tripStatuses = exports.loadStatuses = exports.serviceTags = void 0;
exports.serviceTags = {
    MECHANIC: "mechanic",
    SPARES: "spares",
    FUEL: "fuel",
    DHABA: "dhaba",
    PARKING: "parking",
    CRANE: "crane",
    TYRE: "tyre",
    WASH: "wash",
    WEIGH_BRIDGE: "weigh_bridge"
};
exports.loadStatuses = {
    DRAFT: "draft",
    PUBLISHED: "published",
    BOOKED: "booked",
    IN_TRANSIT: "in_transit",
    COMPLETED: "completed",
    CANCELLED: "cancelled"
};
exports.tripStatuses = {
    SCHEDULED: "scheduled",
    IN_PROGRESS: "in_progress",
    AT_STOP: "at_stop",
    COMPLETED: "completed",
    EXCEPTION: "exception"
};
exports.assignmentStatuses = {
    PENDING: "PENDING",
    OFFERED: "OFFERED",
    ACCEPTED: "ACCEPTED",
    DECLINED: "DECLINED",
    CANCELLED: "CANCELLED",
    EXPIRED: "EXPIRED"
};
exports.assignmentEventTypes = {
    CREATED: "CREATED",
    OFFERED: "OFFERED",
    ACCEPTED: "ACCEPTED",
    DECLINED: "DECLINED",
    CANCELLED: "CANCELLED",
    EXPIRED: "EXPIRED",
    NOTE_ADDED: "NOTE_ADDED"
};
exports.loadAssignmentStatuses = {
    UNASSIGNED: "UNASSIGNED",
    SOURCING: "SOURCING",
    OFFERED: "OFFERED",
    ACCEPTED: "ACCEPTED",
    DECLINED: "DECLINED",
    CANCELLED: "CANCELLED"
};
//# sourceMappingURL=index.js.map