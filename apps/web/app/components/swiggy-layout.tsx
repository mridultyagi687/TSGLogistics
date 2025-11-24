"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "../../lib/use-auth";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

function SwiggyLayoutContent({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session, status, signOut } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-30 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex-1" />
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {status === "loading" ? (
                <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
              ) : session?.user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {session.user.name || session.user.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {session.user.role} • {session.user.orgId || "No org"}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      window.location.href = "/login";
                    }
                  }}
                  className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-indigo-700 hover:to-purple-700"
                >
                  Sign in
                </button>
              )}
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="overflow-x-hidden">
          <div className="h-full w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function SwiggyLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render until mounted to avoid SSR issues
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main>{children}</main>
      </div>
    );
  }

  const isLanding = pathname === "/";
  const isLogin = pathname === "/login" || pathname.startsWith("/api/auth");

  if (isLanding || isLogin) {
    return <>{children}</>;
  }

  return <SwiggyLayoutContent>{children}</SwiggyLayoutContent>;
}
