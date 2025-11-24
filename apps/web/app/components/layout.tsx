"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../lib/use-auth";
import { ThemeToggle } from "./theme-toggle";
import type { ReactNode } from "react";

const navigation = [
  { name: "Dashboard", href: "/loads", icon: "📊" },
  { name: "Loads", href: "/loads", icon: "📦" },
  { name: "Assignments", href: "/assignments", icon: "🤝" },
  { name: "Trips", href: "/loads", icon: "🚛" }
];

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session, status, signOut } = useAuth();
  const isLanding = pathname === "/";
  const isStandaloneAuth = pathname === "/login";

  if (isLanding || isStandaloneAuth) {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-md">
                T
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">TSG Logistics</span>
            </Link>
            <div className="hidden md:flex md:gap-1">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href as any}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
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
                onClick={() => window.location.href = "/login"}
                className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:from-indigo-700 hover:to-purple-700"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>
      <main className="pt-16">{children}</main>
    </div>
  );
}
