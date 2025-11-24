"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { RoleDefinition } from "../../../lib/rbac";
import { SwiggyBadge, SwiggyButton } from "../../components/swiggy-ui";

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  enabled: boolean;
  roles: string[];
}

interface RoleManagementClientProps {
  user: User;
  availableRoles: RoleDefinition[];
}

export function RoleManagementClient({
  user,
  availableRoles
}: RoleManagementClientProps) {
  const router = useRouter();
  const [userRole, setUserRole] = useState(user.roles[0] || "");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleUpdateRole(newRole: string) {
    if (newRole === userRole) return;
    
    setError(null);
    startTransition(async () => {
      try {
        // In a real app, this would call an API to update the user's role
        // For now, we'll just update the local state
        const response = await fetch(`/api/users/${user.id}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole })
        });

        if (!response.ok) {
          throw new Error("Failed to update role");
        }

        setUserRole(newRole);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update role");
      }
    });
  }

  const currentRole = availableRoles.find(r => r.name === userRole);
  const otherRoles = availableRoles.filter(r => r.name !== userRole);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            {user.name || user.username}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email || user.username}</p>
          {!user.enabled && (
            <div className="mt-1">
              <SwiggyBadge variant="danger">
                Disabled
              </SwiggyBadge>
            </div>
          )}
        </div>
      </div>

      {/* Current Role */}
      <div className="mb-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Current Role
        </p>
        {currentRole ? (
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2">
            <span className="text-lg">{currentRole.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentRole.displayName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{currentRole.description}</p>
            </div>
            <SwiggyBadge variant="info">{currentRole.permissions.length} permissions</SwiggyBadge>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No role assigned</p>
        )}
      </div>

      {/* Change Role */}
      {otherRoles.length > 0 && (
        <div className="mb-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Change Role
          </p>
          <div className="space-y-2">
            {otherRoles.map((role) => (
              <button
                key={role.name}
                onClick={() => handleUpdateRole(role.name)}
                disabled={isPending}
                className="w-full flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              >
                <span className="text-lg">{role.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{role.displayName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-2">
          <p className="text-xs text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}
    </div>
  );
}
