import Link from "next/link";
import { getPlatformStatus } from "../lib/status";
import { SwiggyCard, SwiggyButton, SwiggyStatCard } from "./components/swiggy-ui";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const portals: Array<{ title: string; description: string; href: string; icon: string }> = [
  {
    title: "Loads Dashboard",
    description: "Manage all your loads in one place",
    href: "/loads",
    icon: "📊"
  },
  {
    title: "Assignments",
    description: "Review and manage vendor assignments",
    href: "/assignments",
    icon: "🤝"
  },
  {
    title: "Vendors",
    description: "Manage roadside partners",
    href: "/vendors",
    icon: "🏪"
  },
  {
    title: "Wallets",
    description: "Escrow and payment management",
    href: "/wallets",
    icon: "💰"
  }
];

export default async function HomePage() {
  const status = await getPlatformStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section - Modern Gradient */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#3B82F6]">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-20 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-lg">
                TSG Logistics
                <span className="block mt-2">Operations Platform</span>
              </h1>
              <p className="mt-6 text-xl leading-8 text-indigo-50">
                End-to-end logistics orchestration for shippers, fleets, drivers, and vendors.
                Manage loads, trips, assignments, and payments from a single platform.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link href="/login">
                  <SwiggyButton
                    size="lg"
                    className="!bg-white !text-[#6366F1] hover:!bg-indigo-50 shadow-xl border-2 border-white"
                  >
                    Sign In
                  </SwiggyButton>
                </Link>
                <Link href="/dashboard">
                  <SwiggyButton
                    size="lg"
                    className="!bg-transparent !border-2 !border-white !text-white hover:!bg-white/20 !shadow-none"
                  >
                    Dashboard
                  </SwiggyButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-12 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <SwiggyStatCard label="Active Loads" value="0" icon="📦" />
            <SwiggyStatCard label="In Transit" value="0" icon="🚛" />
            <SwiggyStatCard label="Assignments" value="0" icon="🤝" />
            <SwiggyCard className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform Status</p>
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      status.status === "ok" ? "bg-green-500 animate-pulse" : "bg-yellow-500"
                    }`}
                  />
                  <span className="text-lg font-bold text-gray-900">
                    {status.status === "ok" ? "Operational" : "Degraded"}
                  </span>
                </div>
              </div>
            </SwiggyCard>
          </div>
        </div>
      </section>

      {/* Portals Section */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900">Workspaces</h2>
            <p className="mt-4 text-lg text-gray-600">
              Access specialized workspaces for different operational needs
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {portals.map((portal) => (
              <Link key={portal.href} href={portal.href as "/loads" | "/assignments"}>
                <SwiggyCard className="transition-all hover:scale-105">
                  <div className="flex items-start gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-4xl shadow-sm">
                      {portal.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900">{portal.title}</h3>
                      <p className="mt-2 text-base text-gray-600">{portal.description}</p>
                      <div className="mt-4 flex items-center text-base font-semibold text-[#6366F1]">
                        Open workspace
                        <span className="ml-2">→</span>
                      </div>
                    </div>
                  </div>
                </SwiggyCard>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white">Ready to get started?</h2>
            <p className="mt-4 text-xl text-indigo-50">
              Sign in to access your logistics dashboard and start managing operations.
            </p>
            <div className="mt-8">
              <Link href="/login">
                <SwiggyButton
                  size="lg"
                  className="!bg-white !text-[#6366F1] hover:!bg-indigo-50 shadow-xl"
                >
                  Sign In Now
                </SwiggyButton>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
