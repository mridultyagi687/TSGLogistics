"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { SwiggyButton, SwiggyInput } from "../components/swiggy-ui";
import { ThemeToggle } from "../components/theme-toggle";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check if already logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session");
        if (!response.ok) {
          // API error - continue to show login form
          setIsCheckingSession(false);
          return;
        }
        const data = await response.json();
        if (data.user) {
          const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
          router.push(callbackUrl as any);
          return;
        }
      } catch (err) {
        // Network or other error - continue to show login form
        console.error("Session check error:", err);
      } finally {
        setIsCheckingSession(false);
      }
    }
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - searchParams changes handled in handleSubmit

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
      
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          username, 
          password,
          redirectTo: callbackUrl
        }),
        credentials: "include" // Important: include cookies in request and response
      });

      const data = await response.json();

      if (!response.ok) {
        // Show specific error messages for different error types
        let errorMessage = data.error || "Invalid username or password";
        if (response.status === 503 && data.message) {
          // Database connection error
          errorMessage = data.message;
        } else if (data.message) {
          errorMessage = data.message;
        }
        setError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Success - cookie is set in response, now redirect
      // Use a small delay to ensure cookie is processed by browser
      const redirectUrl = data.redirectTo || callbackUrl;
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 50);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err instanceof Error 
          ? `Failed to sign in: ${err.message}` 
          : "Failed to sign in. Please check your connection and try again."
      );
      setIsLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 mb-4"></div>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Modern Header */}
      <header className="relative border-b border-white/20 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-shadow">
              T
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              TSG Logistics
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left Side - Modern Branding */}
          <div className="space-y-8 text-gray-900 relative z-10">
            <div className="space-y-4">
              <h1 className="text-5xl font-extrabold sm:text-6xl lg:text-7xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Welcome Back
              </h1>
              <p className="text-xl leading-8 text-gray-600 max-w-lg">
                Sign in to access your TSG Logistics dashboard and manage your operations seamlessly.
              </p>
            </div>

            {/* Modern Feature Cards */}
            <div className="space-y-4 pt-4">
              <div className="group flex items-start gap-4 rounded-2xl border border-gray-200/50 bg-white/60 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition-all hover:border-indigo-200">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
                  🔐
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Role-Based Access</h3>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                    Secure authentication with granular permissions
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-4 rounded-2xl border border-gray-200/50 bg-white/60 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition-all hover:border-purple-200">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
                  📊
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Unified Dashboard</h3>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                    Manage all operations from a single, intuitive interface
                  </p>
                </div>
              </div>

              <div className="group flex items-start gap-4 rounded-2xl border border-gray-200/50 bg-white/60 backdrop-blur-sm p-6 shadow-sm hover:shadow-md transition-all hover:border-pink-200">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 text-white text-xl shadow-lg group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Real-time Updates</h3>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                    Get instant notifications and live status updates
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Modern Login Form */}
          <div className="relative z-10">
            <div className="rounded-3xl border border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-8 shadow-2xl">
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-2xl font-bold shadow-lg mb-4">
                  T
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Sign In</h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  Enter your credentials to continue
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <SwiggyInput
                  label="Username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoFocus
                  placeholder="Enter your username"
                />

                <SwiggyInput
                  label="Password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />

                <SwiggyButton
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Sign In
                    </span>
                  )}
                </SwiggyButton>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="px-4 text-sm text-gray-500">Demo Accounts</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>

              {/* Demo Credentials Card */}
              <div className="rounded-xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-sm font-bold">
                    💡
                  </div>
                  <h3 className="text-base font-bold text-gray-900">Test Accounts</h3>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-white p-4 border border-gray-200 shadow-sm">
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Admin</span>
                      <div className="mt-1 flex items-center justify-between">
                        <code className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-900">admin</code>
                        <code className="rounded-md bg-purple-100 px-2 py-1 text-xs font-bold text-purple-900">admin123</code>
                      </div>
                    </div>
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Ops Lead</span>
                      <div className="mt-1 flex items-center justify-between">
                        <code className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-900">ops-lead</code>
                        <code className="rounded-md bg-purple-100 px-2 py-1 text-xs font-bold text-purple-900">ChangeMe123!</code>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Viewer</span>
                      <div className="mt-1 flex items-center justify-between">
                        <code className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-bold text-indigo-900">viewer</code>
                        <code className="rounded-md bg-purple-100 px-2 py-1 text-xs font-bold text-purple-900">viewer123</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Help Section */}
              <div className="mt-6 rounded-xl bg-gray-50 border border-gray-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-indigo-600"></div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 mb-1">Need assistance?</p>
                    <p className="text-xs text-gray-600">
                      Contact{" "}
                      <a
                        href="mailto:support@tsglogistics.in"
                        className="font-semibold text-indigo-600 hover:text-indigo-700"
                      >
                        support@tsglogistics.in
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 h-72 w-72 rounded-full bg-indigo-200 opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 -right-4 h-72 w-72 rounded-full bg-purple-200 opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-200 opacity-10 blur-3xl"></div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 mb-4"></div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
