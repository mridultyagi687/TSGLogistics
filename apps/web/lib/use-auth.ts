/**
 * Client-side auth hook
 * Replaces NextAuth's useSession
 */

"use client";

import { useState, useEffect } from "react";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  orgId: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    async function fetchSession() {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();
        
        if (data.user) {
          setUser(data.user);
          setStatus("authenticated");
        } else {
          setUser(null);
          setStatus("unauthenticated");
        }
      } catch {
        setUser(null);
        setStatus("unauthenticated");
      }
    }

    fetchSession();
  }, []);

  const signOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setStatus("unauthenticated");
      // Use window.location for navigation to avoid router context issues
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Return loading state until mounted (prevents SSR issues)
  if (!mounted) {
    return {
      data: null,
      status: "loading" as const,
      signOut
    };
  }

  return {
    data: user ? { user } : null,
    status,
    signOut
  };
}
