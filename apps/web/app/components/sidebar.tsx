"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../lib/use-auth";

export interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Loads", href: "/loads", icon: "📦" },
  { name: "Assignments", href: "/assignments", icon: "🤝" },
  { name: "Trips", href: "/trips", icon: "🚛" },
  { name: "Vendors", href: "/vendors", icon: "🏪" },
  { name: "Wallets", href: "/wallets", icon: "💰" },
  { name: "Users", href: "/users", icon: "👥" },
];

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { data: session, status, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <aside
        className={`fixed left-0 top-0 z-40 h-screen border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
      <div className="flex h-full flex-col">
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-3 group">
              {/* Three Dots Logo */}
              <div className="relative flex items-center justify-center">
                <div className="relative h-10 w-10">
                  {/* Top dot - Yellow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-yellow-400 shadow-sm" />
                  {/* Bottom left dot - Light Green */}
                  <div className="absolute bottom-0 left-0 h-3 w-3 rounded-full bg-lime-400 shadow-sm" />
                  {/* Bottom right dot - Reddish Orange */}
                  <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-orange-400 shadow-sm" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                  TSG
                </span>
                <span className="text-[9px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider leading-tight mt-0.5">
                  THINK SMALL GROUP
                </span>
              </div>
            </Link>
          )}
          {isCollapsed && (
            <Link href="/" className="flex items-center justify-center w-full">
              <div className="relative h-8 w-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-yellow-400" />
                <div className="absolute bottom-0 left-0 h-2 w-2 rounded-full bg-lime-400" />
                <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-orange-400" />
              </div>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`rounded-lg p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
              isCollapsed ? "mx-auto" : "ml-auto"
            }`}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className={`h-5 w-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href as any}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4">
          {/* User Info */}
          {status === "loading" ? (
            <div className="h-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          ) : session?.user ? (
            <div className={`space-y-2 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
              {!isCollapsed && (
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {session.user.name || session.user.username}
                </div>
              )}
              {!isCollapsed && (
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {session.user.role} • {session.user.orgId || "No org"}
                </div>
              )}
              <button
                onClick={handleSignOut}
                className={`w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 transition hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  isCollapsed ? "px-2" : ""
                }`}
                title={isCollapsed ? "Sign out" : undefined}
              >
                {isCollapsed ? "🚪" : "Sign out"}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className={`block w-full rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-3 py-2 text-xs font-semibold text-white text-center transition hover:from-indigo-700 hover:to-purple-700 ${
                isCollapsed ? "px-2" : ""
              }`}
            >
              {isCollapsed ? "🔐" : "Sign in"}
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}

