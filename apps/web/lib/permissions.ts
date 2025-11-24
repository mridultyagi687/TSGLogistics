/**
 * Permission and role management utilities
 */

export const PERMISSIONS = {
  // Loads
  LOADS_VIEW: "loads:view",
  LOADS_CREATE: "loads:create",
  LOADS_EDIT: "loads:edit",
  LOADS_DELETE: "loads:delete",
  LOADS_PUBLISH: "loads:publish",

  // Trips
  TRIPS_VIEW: "trips:view",
  TRIPS_CREATE: "trips:create",
  TRIPS_EDIT: "trips:edit",
  TRIPS_START: "trips:start",
  TRIPS_COMPLETE: "trips:complete",
  TRIPS_CANCEL: "trips:cancel",

  // Assignments
  ASSIGNMENTS_VIEW: "assignments:view",
  ASSIGNMENTS_CREATE: "assignments:create",
  ASSIGNMENTS_ACCEPT: "assignments:accept",
  ASSIGNMENTS_DECLINE: "assignments:decline",
  ASSIGNMENTS_CANCEL: "assignments:cancel",

  // Vendors
  VENDORS_VIEW: "vendors:view",
  VENDORS_CREATE: "vendors:create",
  VENDORS_EDIT: "vendors:edit",
  VENDORS_DELETE: "vendors:delete",
  VENDORS_MANAGE_CAPABILITIES: "vendors:manage_capabilities",

  // Wallets
  WALLETS_VIEW: "wallets:view",
  WALLETS_CREATE: "wallets:create",
  WALLETS_EDIT: "wallets:edit",
  WALLETS_TRANSACTIONS: "wallets:transactions",

  // Users & Roles
  USERS_VIEW: "users:view",
  USERS_CREATE: "users:create",
  USERS_EDIT: "users:edit",
  USERS_DELETE: "users:delete",
  ROLES_MANAGE: "roles:manage",
  PERMISSIONS_MANAGE: "permissions:manage"
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: Object.values(PERMISSIONS), // Admin has all permissions
  ops_manager: [
    PERMISSIONS.LOADS_VIEW,
    PERMISSIONS.LOADS_CREATE,
    PERMISSIONS.LOADS_EDIT,
    PERMISSIONS.LOADS_PUBLISH,
    PERMISSIONS.TRIPS_VIEW,
    PERMISSIONS.TRIPS_CREATE,
    PERMISSIONS.TRIPS_EDIT,
    PERMISSIONS.TRIPS_START,
    PERMISSIONS.TRIPS_COMPLETE,
    PERMISSIONS.TRIPS_CANCEL,
    PERMISSIONS.ASSIGNMENTS_VIEW,
    PERMISSIONS.ASSIGNMENTS_ACCEPT,
    PERMISSIONS.ASSIGNMENTS_DECLINE,
    PERMISSIONS.ASSIGNMENTS_CANCEL,
    PERMISSIONS.VENDORS_VIEW,
    PERMISSIONS.WALLETS_VIEW
  ],
  vendor_manager: [
    PERMISSIONS.VENDORS_VIEW,
    PERMISSIONS.VENDORS_CREATE,
    PERMISSIONS.VENDORS_EDIT,
    PERMISSIONS.VENDORS_MANAGE_CAPABILITIES,
    PERMISSIONS.ASSIGNMENTS_VIEW,
    PERMISSIONS.ASSIGNMENTS_ACCEPT,
    PERMISSIONS.ASSIGNMENTS_DECLINE
  ],
  wallet_manager: [
    PERMISSIONS.WALLETS_VIEW,
    PERMISSIONS.WALLETS_CREATE,
    PERMISSIONS.WALLETS_EDIT,
    PERMISSIONS.WALLETS_TRANSACTIONS,
    PERMISSIONS.LOADS_VIEW
  ],
  viewer: [
    PERMISSIONS.LOADS_VIEW,
    PERMISSIONS.TRIPS_VIEW,
    PERMISSIONS.ASSIGNMENTS_VIEW,
    PERMISSIONS.VENDORS_VIEW,
    PERMISSIONS.WALLETS_VIEW,
    PERMISSIONS.USERS_VIEW
  ]
};

export function hasPermission(userRoles: string[], permission: Permission): boolean {
  // Admin always has all permissions
  if (userRoles.includes("admin")) {
    return true;
  }

  // Check if any of the user's roles have this permission
  return userRoles.some((role) => {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    return rolePerms.includes(permission);
  });
}

export function hasAnyPermission(
  userRoles: string[],
  permissions: Permission[]
): boolean {
  return permissions.some((perm) => hasPermission(userRoles, perm));
}

export function hasAllPermissions(
  userRoles: string[],
  permissions: Permission[]
): boolean {
  return permissions.every((perm) => hasPermission(userRoles, perm));
}

export function hasRole(userRoles: string[], role: string): boolean {
  return userRoles.includes(role);
}

export function isAdmin(userRoles: string[]): boolean {
  return hasRole(userRoles, "admin");
}

