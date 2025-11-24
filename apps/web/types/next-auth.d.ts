import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    orgId?: string;
    error?: string;
  }

  interface User {
    orgId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    orgId?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
  }
}

