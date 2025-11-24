/**
 * Keycloak Admin API client
 * Uses Next.js API route as proxy to avoid exposing admin credentials to client
 */

const ADMIN_API_BASE = "/api/keycloak-admin";

async function keycloakAdminFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = new URL(`${ADMIN_API_BASE}`, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  url.searchParams.set("path", path);

  return fetch(url.toString(), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });
}

export interface KeycloakUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified: boolean;
  attributes?: Record<string, string[]>;
}

export interface KeycloakRole {
  id: string;
  name: string;
  description?: string;
  composite: boolean;
  clientRole: boolean;
}

export async function listUsers(): Promise<KeycloakUser[]> {
  const response = await keycloakAdminFetch("/users");
  if (!response.ok) {
    throw new Error(`Failed to list users: ${response.statusText}`);
  }
  return (await response.json()) as KeycloakUser[];
}

export async function getUser(userId: string): Promise<KeycloakUser> {
  const response = await keycloakAdminFetch(`/users/${userId}`);
  if (!response.ok) {
    throw new Error(`Failed to get user: ${response.statusText}`);
  }
  return (await response.json()) as KeycloakUser;
}

export async function getUserRoles(userId: string): Promise<KeycloakRole[]> {
  const response = await keycloakAdminFetch(`/users/${userId}/role-mappings/realm`);
  if (!response.ok) {
    // If 404, user has no roles
    if (response.status === 404) {
      return [];
    }
    throw new Error(`Failed to get user roles: ${response.statusText}`);
  }
  const data = (await response.json()) as { mappings?: KeycloakRole[] } | KeycloakRole[];
  // Handle different response formats
  if (Array.isArray(data)) {
    return data;
  }
  if (data && typeof data === "object" && "mappings" in data) {
    return data.mappings || [];
  }
  return [];
}

export async function listRealmRoles(): Promise<KeycloakRole[]> {
  const response = await keycloakAdminFetch("/roles");
  if (!response.ok) {
    throw new Error(`Failed to list roles: ${response.statusText}`);
  }
  return (await response.json()) as KeycloakRole[];
}

export async function assignRoleToUser(
  userId: string,
  roleName: string
): Promise<void> {
  // First get the role
  const roleResponse = await keycloakAdminFetch(`/roles/${roleName}`);
  if (!roleResponse.ok) {
    throw new Error(`Role not found: ${roleName}`);
  }
  const role = (await roleResponse.json()) as KeycloakRole;

  // Assign the role
  const response = await keycloakAdminFetch(`/users/${userId}/role-mappings/realm`, {
    method: "POST",
    body: JSON.stringify([role])
  });

  if (!response.ok) {
    throw new Error(`Failed to assign role: ${response.statusText}`);
  }
}

export async function removeRoleFromUser(
  userId: string,
  roleName: string
): Promise<void> {
  // First get the role
  const roleResponse = await keycloakAdminFetch(`/roles/${roleName}`);
  if (!roleResponse.ok) {
    throw new Error(`Role not found: ${roleName}`);
  }
  const role = (await roleResponse.json()) as KeycloakRole;

  // Remove the role
  const response = await keycloakAdminFetch(`/users/${userId}/role-mappings/realm`, {
    method: "DELETE",
    body: JSON.stringify([role])
  });

  if (!response.ok) {
    throw new Error(`Failed to remove role: ${response.statusText}`);
  }
}

export async function createRealmRole(
  name: string,
  description?: string
): Promise<KeycloakRole> {
  const response = await keycloakAdminFetch("/roles", {
    method: "POST",
    body: JSON.stringify({
      name,
      description
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to create role: ${response.statusText}`);
  }

  // Fetch the created role
  const roleResponse = await keycloakAdminFetch(`/roles/${name}`);
  return (await roleResponse.json()) as KeycloakRole;
}

