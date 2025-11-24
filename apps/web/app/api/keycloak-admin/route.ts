/**
 * Proxy endpoint for Keycloak Admin API
 * This proxies requests to Keycloak Admin API to avoid exposing admin credentials to the client
 * 
 * Note: In production, this should be a proper backend service with proper authentication
 */

import { NextRequest, NextResponse } from "next/server";

const KEYCLOAK_ADMIN_URL = process.env.KEYCLOAK_ADMIN_URL || "http://localhost:8180";
const KEYCLOAK_ADMIN_USER = process.env.KEYCLOAK_ADMIN_USER || "admin";
const KEYCLOAK_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || "admin";
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "tsg";

let adminToken: string | null = null;
let tokenExpiry: number = 0;

async function getAdminToken(): Promise<string> {
  if (adminToken && Date.now() < tokenExpiry - 5 * 60 * 1000) {
    return adminToken;
  }

  const response = await fetch(
    `${KEYCLOAK_ADMIN_URL}/realms/master/protocol/openid-connect/token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "password",
        client_id: "admin-cli",
        username: KEYCLOAK_ADMIN_USER,
        password: KEYCLOAK_ADMIN_PASSWORD
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get admin token: ${response.statusText}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  adminToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;

  return adminToken;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");

    if (!path) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
    }

    const token = await getAdminToken();
    const url = `${KEYCLOAK_ADMIN_URL}/admin/realms/${KEYCLOAK_REALM}${path}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Keycloak API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
    }

    const body = await request.json();
    const token = await getAdminToken();
    const url = `${KEYCLOAK_ADMIN_URL}/admin/realms/${KEYCLOAK_REALM}${path}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Keycloak API error: ${errorText || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const token = await getAdminToken();
    const url = `${KEYCLOAK_ADMIN_URL}/admin/realms/${KEYCLOAK_REALM}${path}`;

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
    });

    if (!response.ok && response.status !== 204) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Keycloak API error: ${errorText || response.statusText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

