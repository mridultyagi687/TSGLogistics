import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

type JwtPayload = Record<string, unknown>;

function decodeJwt(token?: string): JwtPayload | null {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const decoded = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64")
      .toString("utf8");
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

function extractOrgId(token?: string): string | undefined {
  const claimPath = process.env.KEYCLOAK_ORG_CLAIM;
  if (!claimPath) {
    return undefined;
  }

  const payload = decodeJwt(token);
  if (!payload) {
    return undefined;
  }

  return claimPath.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, payload) as string | undefined;
}

async function refreshAccessToken(token: Record<string, unknown>) {
  try {
    const issuer = process.env.KEYCLOAK_ISSUER;
    if (!issuer) {
      throw new Error("Missing KEYCLOAK_ISSUER for token refresh.");
    }

    const refreshToken = token.refreshToken as string | undefined;
    if (!refreshToken) {
      throw new Error("Missing refresh token.");
    }

    const params = new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.KEYCLOAK_CLIENT_ID ?? "",
      refresh_token: refreshToken
    });

    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
    if (clientSecret) {
      params.append("client_secret", clientSecret);
    }

    const response = await fetch(
      `${issuer}/protocol/openid-connect/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString()
      }
    );

    if (!response.ok) {
      throw new Error(`Token refresh request failed: ${response.status}`);
    }

    const refreshed = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      not_before_policy?: number;
      session_state?: string;
      scope?: string;
      token_type?: string;
    };

    const orgId =
      extractOrgId(refreshed.access_token) ??
      (token.orgId as string | undefined) ??
      process.env.DEFAULT_GATEWAY_ORG_ID;

    return {
      ...token,
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? refreshToken,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      orgId,
      error: undefined
    };
  } catch (error) {
    return {
      ...token,
      error: "RefreshAccessTokenError"
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? "",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "",
      issuer: process.env.KEYCLOAK_ISSUER,
      authorization: {
        params: {
          prompt: "login"
        }
      }
    })
  ],
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.access_token) {
        const expiresAt =
          account.expires_at !== undefined
            ? account.expires_at * 1000
            : Date.now() + 60 * 60 * 1000;

        const orgId =
          extractOrgId(account.access_token) ??
          process.env.DEFAULT_GATEWAY_ORG_ID ??
          (user as { orgId?: string } | undefined)?.orgId;

        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token ?? token.refreshToken,
          accessTokenExpires: expiresAt,
          orgId,
          error: undefined
        };
      }

      if (
        token.accessTokenExpires &&
        Date.now() < (token.accessTokenExpires as number) - 60 * 1000
      ) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token.accessToken) {
        Object.assign(session, {
          accessToken: token.accessToken,
          error: token.error
        });
      }
      if (token.orgId) {
        Object.assign(session, {
          orgId: token.orgId
        });
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET
};

