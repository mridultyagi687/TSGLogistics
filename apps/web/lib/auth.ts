'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "./auth-options";

export interface GatewaySession {
  token?: string;
  orgId?: string;
}

export async function getGatewaySession(): Promise<GatewaySession> {
  const session = await getServerSession(authOptions);
  const token =
    session?.accessToken?.toString().trim() ||
    process.env.GATEWAY_SERVICE_TOKEN?.trim() ||
    undefined;
  const orgId =
    session?.orgId?.toString().trim() ||
    process.env.GATEWAY_ORG_ID?.trim() ||
    process.env.DEFAULT_GATEWAY_ORG_ID?.trim() ||
    undefined;

  return {
    token,
    orgId
  };
}

export async function hasGatewaySession(): Promise<boolean> {
  const { token } = await getGatewaySession();
  return Boolean(token && token.length > 0);
}

