import Link from "next/link";
import type { Metadata } from "next";
import React from "react";
import { requireAdmin } from "../../../lib/require-permission";
import { PERMISSIONS, ROLE_PERMISSIONS } from "../../../lib/permissions";
import { SwiggyCard, SwiggyBadge } from "../../components/swiggy-ui";

export const metadata: Metadata = {
  title: "Permission Management | TSG Logistics"
};

const PERMISSION_CATEGORIES = {
  Loads: [
    PERMISSIONS.LOADS_VIEW,
    PERMISSIONS.LOADS_CREATE,
    PERMISSIONS.LOADS_EDIT,
    PERMISSIONS.LOADS_DELETE,
    PERMISSIONS.LOADS_PUBLISH
  ],
  Trips: [
    PERMISSIONS.TRIPS_VIEW,
    PERMISSIONS.TRIPS_CREATE,
    PERMISSIONS.TRIPS_EDIT,
    PERMISSIONS.TRIPS_START,
    PERMISSIONS.TRIPS_COMPLETE,
    PERMISSIONS.TRIPS_CANCEL
  ],
  Assignments: [
    PERMISSIONS.ASSIGNMENTS_VIEW,
    PERMISSIONS.ASSIGNMENTS_CREATE,
    PERMISSIONS.ASSIGNMENTS_ACCEPT,
    PERMISSIONS.ASSIGNMENTS_DECLINE,
    PERMISSIONS.ASSIGNMENTS_CANCEL
  ],
  Vendors: [
    PERMISSIONS.VENDORS_VIEW,
    PERMISSIONS.VENDORS_CREATE,
    PERMISSIONS.VENDORS_EDIT,
    PERMISSIONS.VENDORS_DELETE,
    PERMISSIONS.VENDORS_MANAGE_CAPABILITIES
  ],
  Wallets: [
    PERMISSIONS.WALLETS_VIEW,
    PERMISSIONS.WALLETS_CREATE,
    PERMISSIONS.WALLETS_EDIT,
    PERMISSIONS.WALLETS_TRANSACTIONS
  ],
  "Users & Roles": [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.ROLES_MANAGE,
    PERMISSIONS.PERMISSIONS_MANAGE
  ]
};

function formatPermission(permission: string): string {
  return permission
    .replace(/:/g, " → ")
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function PermissionManagementPage() {
  // Require admin role
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Link
              href="/users"
              className="text-sm font-semibold text-[#6366F1] transition hover:text-[#4F46E5]"
            >
              ← Back to users
            </Link>
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-gray-900">Permission Management</h1>
              <p className="mt-1 text-base text-gray-600">
                View role permissions and manage access controls
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Role Permissions Matrix */}
        <SwiggyCard className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Role Permissions Matrix</h2>
            <p className="mt-1 text-sm text-gray-600">
              Overview of permissions assigned to each role
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">
                    Permission
                  </th>
                  {Object.keys(ROLE_PERMISSIONS).map((role) => (
                    <th
                      key={role}
                      className="px-4 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-700"
                    >
                      {role.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {Object.entries(PERMISSION_CATEGORIES).map(([category, perms]) => (
                  <React.Fragment key={category}>
                    <tr className="bg-gray-100">
                      <td
                        colSpan={Object.keys(ROLE_PERMISSIONS).length + 1}
                        className="px-4 py-3 text-sm font-bold text-gray-900"
                      >
                        {category}
                      </td>
                    </tr>
                    {perms.map((permission) => (
                      <tr key={permission} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatPermission(permission)}
                        </td>
                        {Object.entries(ROLE_PERMISSIONS).map(([role, rolePerms]) => (
                          <td key={role} className="px-4 py-3 text-center">
                            {rolePerms.includes(permission) ? (
                              <SwiggyBadge variant="success">
                                ✓
                              </SwiggyBadge>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </SwiggyCard>

        {/* Permission Categories */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(PERMISSION_CATEGORIES).map(([category, permissions]) => (
            <SwiggyCard key={category}>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">{category}</h3>
                <p className="text-sm text-gray-600">{permissions.length} permissions</p>
              </div>
              <div className="space-y-2">
                {permissions.map((permission) => (
                  <div
                    key={permission}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {formatPermission(permission)}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-1">{permission}</p>
                  </div>
                ))}
              </div>
            </SwiggyCard>
          ))}
        </div>

        {/* Info Card */}
        <SwiggyCard className="mt-8">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900">About Permissions</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Permissions define granular access controls for different features in the system.
              Roles are collections of permissions that can be assigned to users.
            </p>
            <p>
              <strong>Admin role</strong> automatically has all permissions and can manage roles
              and permissions for other users.
            </p>
            <p>
              To modify permissions for a role, update the role definition in the codebase and
              redeploy, or use the Keycloak Admin Console for advanced role management.
            </p>
          </div>
        </SwiggyCard>
      </div>
    </div>
  );
}

