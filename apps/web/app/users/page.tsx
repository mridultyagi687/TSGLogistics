"use client";

import Link from "next/link";
import { useAuth } from "../../lib/use-auth";
import { SwiggyCard, SwiggyButton } from "../components/swiggy-ui";

export default function UsersPage() {
  const { data: session, status, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSignIn = () => {
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
              Manage user accounts and authentication
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Current User */}
          <SwiggyCard>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current User</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Your authentication status and session information
              </p>
            </div>
            {status === "loading" ? (
              <div className="py-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
              </div>
            ) : session?.user ? (
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-semibold text-gray-500 dark:text-gray-400">Name</dt>
                  <dd className="mt-1 text-base text-gray-900 dark:text-white">
                    {session.user.name || session.user.username || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500 dark:text-gray-400">Email</dt>
                  <dd className="mt-1 text-base text-gray-900 dark:text-white">
                    {session.user.email || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500 dark:text-gray-400">Username</dt>
                  <dd className="mt-1 text-base text-gray-900 dark:text-white">
                    {session.user.username || "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500 dark:text-gray-400">Organization ID</dt>
                  <dd className="mt-1 text-base text-gray-900 dark:text-white">
                    {session.user.orgId || "Not assigned"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-semibold text-gray-500 dark:text-gray-400">Role</dt>
                  <dd className="mt-1">
                    <span className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-300">
                      {session.user.role}
                    </span>
                  </dd>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <SwiggyButton
                    variant="danger"
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </SwiggyButton>
                </div>
              </dl>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Not signed in</p>
                <SwiggyButton onClick={handleSignIn}>
                  Sign In
                </SwiggyButton>
              </div>
            )}
          </SwiggyCard>

          {/* RBAC Information */}
          <SwiggyCard>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Role-Based Access</h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Current RBAC system information
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Available Roles</h3>
                <div className="space-y-2">
                  {["admin", "ops_lead", "fleet_manager", "vendor", "viewer"].map((role) => (
                    <div key={role} className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
                      <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{role.replace("_", " ")}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">RBAC</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link href="/users/roles">
                  <SwiggyButton className="w-full" variant="outline">
                    Manage Roles
                  </SwiggyButton>
                </Link>
              </div>
            </div>
          </SwiggyCard>
        </div>
      </div>
    </div>
  );
}
