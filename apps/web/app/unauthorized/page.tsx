import Link from "next/link";
import { SwiggyCard, SwiggyButton } from "../components/swiggy-ui";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <SwiggyCard className="max-w-md w-full">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            You don&rsquo;t have permission to access this resource.
          </p>
          <div className="space-y-3">
            <Link href="/dashboard">
              <SwiggyButton className="w-full">Go to Dashboard</SwiggyButton>
            </Link>
            <Link href="/users">
              <SwiggyButton variant="outline" className="w-full">
                Contact Administrator
              </SwiggyButton>
            </Link>
          </div>
        </div>
      </SwiggyCard>
    </div>
  );
}

