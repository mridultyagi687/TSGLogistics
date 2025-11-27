import { NextResponse } from "next/server";

/**
 * Diagnostic endpoint to check if backend services are running
 */
export async function GET() {
  const services = [
    { name: "Orders Service", url: "http://localhost:4001/health" },
    { name: "Vendor Service", url: "http://localhost:4002/health" },
    { name: "Wallet Service", url: "http://localhost:4003/health" },
    { name: "API Gateway", url: "http://localhost:4000/health" },
  ];

  const statuses = await Promise.allSettled(
    services.map(async (service) => {
      try {
        const response = await fetch(service.url, {
          signal: AbortSignal.timeout(2000),
        });
        const data = await response.json().catch(() => ({}));
        return {
          name: service.name,
          status: "online",
          url: service.url,
          httpStatus: response.status,
          data,
        };
      } catch (error: any) {
        return {
          name: service.name,
          status: "offline",
          url: service.url,
          error: error?.message || "Connection failed",
        };
      }
    })
  );

  const results = statuses.map((result) =>
    result.status === "fulfilled" ? result.value : result.reason
  );

  const onlineCount = results.filter((r) => r.status === "online").length;
  const allOnline = onlineCount === services.length;

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      summary: {
        total: services.length,
        online: onlineCount,
        offline: services.length - onlineCount,
        allOnline,
      },
      services: results,
    },
    { status: allOnline ? 200 : 503 }
  );
}

