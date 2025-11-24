/**
 * Role-Based Access Control (RBAC) System
 * Modern RBAC implementation with roles and permissions
 */

export type Permission =
  | "loads:create"
  | "loads:read"
  | "loads:update"
  | "loads:delete"
  | "loads:publish"
  | "trips:create"
  | "trips:read"
  | "trips:update"
  | "trips:delete"
  | "trips:start"
  | "trips:complete"
  | "trips:cancel"
  | "vendors:create"
  | "vendors:read"
  | "vendors:update"
  | "vendors:delete"
  | "vendors:assign"
  | "wallets:create"
  | "wallets:read"
  | "wallets:update"
  | "wallets:delete"
  | "assignments:read"
  | "assignments:accept"
  | "assignments:decline"
  | "assignments:cancel"
  | "users:read"
  | "users:create"
  | "users:update"
  | "users:delete"
  | "roles:read"
  | "roles:create"
  | "roles:update"
  | "roles:delete"
  | "permissions:read"
  | "permissions:assign";

export type Role = "admin" | "ops_lead" | "fleet_manager" | "vendor" | "viewer";

export interface RoleDefinition {
  name: Role;
  displayName: string;
  description: string;
  permissions: Permission[];
  color: string;
  icon: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // bcrypt hash
  role: Role;
  orgId: string;
  name: string;
  createdAt: Date;
  lastLogin?: Date;
  isActive: boolean;
}

// Role definitions with permissions
export const ROLES: Record<Role, RoleDefinition> = {
  admin: {
    name: "admin",
    displayName: "Administrator",
    description: "Full system access with all permissions",
    permissions: [
      "loads:create",
      "loads:read",
      "loads:update",
      "loads:delete",
      "loads:publish",
      "trips:create",
      "trips:read",
      "trips:update",
      "trips:delete",
      "trips:start",
      "trips:complete",
      "trips:cancel",
      "vendors:create",
      "vendors:read",
      "vendors:update",
      "vendors:delete",
      "vendors:assign",
      "wallets:create",
      "wallets:read",
      "wallets:update",
      "wallets:delete",
      "assignments:read",
      "assignments:accept",
      "assignments:decline",
      "assignments:cancel",
      "users:read",
      "users:create",
      "users:update",
      "users:delete",
      "roles:read",
      "roles:create",
      "roles:update",
      "roles:delete",
      "permissions:read",
      "permissions:assign"
    ],
    color: "red",
    icon: "👑"
  },
  ops_lead: {
    name: "ops_lead",
    displayName: "Operations Lead",
    description: "Manages loads, trips, and assignments",
    permissions: [
      "loads:create",
      "loads:read",
      "loads:update",
      "loads:publish",
      "trips:create",
      "trips:read",
      "trips:update",
      "trips:start",
      "trips:complete",
      "trips:cancel",
      "vendors:read",
      "vendors:assign",
      "wallets:read",
      "assignments:read",
      "assignments:accept",
      "assignments:decline",
      "assignments:cancel",
      "users:read"
    ],
    color: "blue",
    icon: "📊"
  },
  fleet_manager: {
    name: "fleet_manager",
    displayName: "Fleet Manager",
    description: "Manages fleet operations and trips",
    permissions: [
      "loads:read",
      "trips:read",
      "trips:update",
      "trips:start",
      "trips:complete",
      "assignments:read",
      "assignments:accept",
      "assignments:decline"
    ],
    color: "green",
    icon: "🚛"
  },
  vendor: {
    name: "vendor",
    displayName: "Vendor",
    description: "Vendor access for assignments and capabilities",
    permissions: [
      "loads:read",
      "assignments:read",
      "assignments:accept",
      "assignments:decline",
      "vendors:read",
      "vendors:update"
    ],
    color: "orange",
    icon: "🏪"
  },
  viewer: {
    name: "viewer",
    displayName: "Viewer",
    description: "Read-only access to view data",
    permissions: [
      "loads:read",
      "trips:read",
      "vendors:read",
      "wallets:read",
      "assignments:read"
    ],
    color: "gray",
    icon: "👁️"
  }
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLES[role]?.permissions.includes(permission) ?? false;
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLES[role]?.permissions ?? [];
}

/**
 * Get role definition
 */
export function getRole(role: Role): RoleDefinition | undefined {
  return ROLES[role];
}

/**
 * Get all available roles
 */
export function getAllRoles(): RoleDefinition[] {
  return Object.values(ROLES);
}

/**
 * Get all available permissions
 */
export function getAllPermissions(): Permission[] {
  const allPermissions = new Set<Permission>();
  Object.values(ROLES).forEach((role) => {
    role.permissions.forEach((perm) => allPermissions.add(perm));
  });
  return Array.from(allPermissions).sort();
}

