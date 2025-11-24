'use client';

import { useAuth } from "../../lib/use-auth";

interface SessionPanelProps {
  hasGatewayToken: boolean;
  fallbackOrgId?: string;
}

export function SessionPanel({
  hasGatewayToken,
  fallbackOrgId
}: SessionPanelProps) {
  const { data: session, status, signOut } = useAuth();
  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";
  const effectiveOrg =
    session?.user?.orgId ?? fallbackOrgId ?? session?.user?.email ?? "n/a";

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSignIn = () => {
    window.location.href = "/login";
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Gateway Access</h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to authenticate and access the API gateway.
        </p>
      </div>

      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-gray-500 dark:text-gray-400">Identity</dt>
          <dd className="font-medium text-gray-900 dark:text-white">
            {isLoading
              ? "Loading..."
              : isAuthenticated
                ? session?.user?.name ?? session?.user?.username ?? "Signed in"
                : "Signed out"}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500 dark:text-gray-400">Gateway Token</dt>
          <dd
            className={`font-semibold ${
              hasGatewayToken ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            }`}
          >
            {hasGatewayToken ? "Active" : "Missing"}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500 dark:text-gray-400">Org Scope</dt>
          <dd className="font-medium text-gray-900 dark:text-white">{effectiveOrg}</dd>
        </div>
        {isAuthenticated && session?.user?.role && (
          <div className="flex items-center justify-between">
            <dt className="text-gray-500 dark:text-gray-400">Role</dt>
            <dd className="font-medium text-gray-900 dark:text-white">{session.user.role}</dd>
          </div>
        )}
      </dl>

      <div className="mt-4">
        {isAuthenticated ? (
          <button
            onClick={handleSignOut}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={handleSignIn}
            className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700"
          >
            Sign In
          </button>
        )}
      </div>
    </div>
  );
}
