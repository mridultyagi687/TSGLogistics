import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "../../../lib/require-permission";
import { getAllUsers } from "../../../lib/auth-simple";
import { getAllRoles, getRole } from "../../../lib/rbac";
import { SwiggyCard, SwiggyButton, SwiggyBadge } from "../../components/swiggy-ui";
import { RoleManagementClient } from "./role-management-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Role Management | TSG Logistics"
};

export default async function RoleManagementPage() {
  // Require admin role
  await requireAdmin();

  let users, roles;
  try {
    [users, roles] = await Promise.all([getAllUsers(), Promise.resolve(getAllRoles())]);
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <Link
                href="/users"
                className="text-sm font-semibold text-[#6366F1] dark:text-indigo-400 transition hover:text-[#4F46E5] dark:hover:text-indigo-300"
              >
                ← Back to users
              </Link>
              <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">Role Management</h1>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <SwiggyCard>
            <div className="py-8 text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                Error Loading Users
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {error instanceof Error ? error.message : "Unable to load users"}
              </p>
            </div>
          </SwiggyCard>
        </div>
      </div>
    );
  }

  // Map users with their roles
  const usersWithRoles = users.map((user) => ({
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    enabled: user.isActive,
    roles: [user.role] // Single role per user in new system
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Link
              href="/users"
              className="text-sm font-semibold text-[#6366F1] dark:text-indigo-400 transition hover:text-[#4F46E5] dark:hover:text-indigo-300"
            >
              ← Back to users
            </Link>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Role Management</h1>
                <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
                  Assign and manage user roles and permissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Users List */}
          <div className="lg:col-span-2">
            <SwiggyCard>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {users.length} total users in the system
                </p>
              </div>
              {users.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="text-6xl mb-4">👥</div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">No users found</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Users will appear here once they are created in the system.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {usersWithRoles.map((user) => (
                    <RoleManagementClient
                      key={user.id}
                      user={user}
                      availableRoles={roles}
                    />
                  ))}
                </div>
              )}
            </SwiggyCard>
          </div>

          {/* Available Roles */}
          <div>
            <SwiggyCard>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Available Roles</h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {roles.length} roles defined
                </p>
              </div>
              {roles.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No roles defined</p>
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    Roles are defined in the RBAC system
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {roles.map((role) => (
                    <div
                      key={role.name}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{role.icon}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {role.displayName}
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{role.description}</p>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {role.permissions.length} permissions
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </SwiggyCard>

            <SwiggyCard className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">About Roles</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <p>
                  Roles define what users can do in the system. Only users with admin privileges
                  can assign roles.
                </p>
                <p>
                  The RBAC (Role-Based Access Control) system manages permissions automatically based on user roles.
                </p>
                <div className="mt-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1">
                    Role Permissions
                  </p>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">
                    Each role has specific permissions that control access to features like loads, trips, assignments, vendors, and wallets.
                  </p>
                </div>
              </div>
            </SwiggyCard>
          </div>
        </div>
      </div>
    </div>
  );
}
