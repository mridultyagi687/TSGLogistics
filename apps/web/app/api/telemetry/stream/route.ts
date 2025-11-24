import Redis from "ioredis";
import type { NextRequest } from "next/server";
import { fetchLoads } from "../../../../lib/loads";
import { fetchTrips } from "../../../../lib/trips";
import type { GatewaySnapshot } from "../../../../lib/snapshot";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const encoder = new TextEncoder();
const HEARTBEAT_MS = 15000;

export const runtime = "nodejs";

const FALLBACK_REDIS_URL = "redis://localhost:6379";
const FALLBACK_CHANNEL = "telemetry:gateway:events";

async function buildSnapshot(): Promise<GatewaySnapshot> {
  const [loads, trips] = await Promise.all([fetchLoads(), fetchTrips()]);
  return {
    loads,
    trips,
    timestamp: new Date().toISOString(),
    trigger: "manual.snapshot"
  };
}

export async function GET(request: NextRequest) {
  const redisUrl = process.env.REDIS_URL ?? FALLBACK_REDIS_URL;
  const channel =
    process.env.TELEMETRY_CHANNEL ?? FALLBACK_CHANNEL;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let subscriber: Redis | null = null;
      let heartbeat: NodeJS.Timeout | undefined;
      let pollingInterval: NodeJS.Timeout | undefined;

      const sendSnapshot = async () => {
        try {
          const payload = await buildSnapshot();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
          );
        } catch (error) {
          controller.enqueue(
            encoder.encode(
              `event: error\ndata: ${
                error instanceof Error ? error.message : "Failed to fetch snapshot"
              }\n\n`
            )
          );
        }
      };

      const enablePolling = async (reason: string) => {
        controller.enqueue(
          encoder.encode(
            `event: fallback\ndata: ${JSON.stringify({ reason })}\n\n`
          )
        );
        await sendSnapshot();
        pollingInterval = setInterval(sendSnapshot, HEARTBEAT_MS);
      };

      try {
        subscriber = new Redis(redisUrl, { lazyConnect: true });
        await subscriber.connect();
        await subscriber.subscribe(channel);

        subscriber.on("message", async (_, message) => {
          try {
            const payload = JSON.parse(message) as GatewaySnapshot;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(payload)}\n\n`)
            );
          } catch (error) {
            controller.enqueue(
              encoder.encode(
                `event: error\ndata: ${
                  error instanceof Error
                    ? error.message
                    : "Malformed telemetry payload"
                }\n\n`
              )
            );
            await sendSnapshot();
          }
        });

        await sendSnapshot();
        heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(": ping\n\n"));
        }, HEARTBEAT_MS);
      } catch (error) {
        if (subscriber) {
          try {
            await subscriber.disconnect();
          } catch {
            // ignore disconnect errors
          }
        }
        subscriber = null;
        await enablePolling(
          error instanceof Error ? error.message : "redis_unavailable"
        );
      }

      const cleanup = async () => {
        if (heartbeat) {
          clearInterval(heartbeat);
        }
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        if (subscriber) {
          try {
            await subscriber.unsubscribe(channel);
          } catch {
            // ignore
          }
          await subscriber.disconnect();
        }
        controller.close();
      };

      request.signal.addEventListener("abort", () => {
        void cleanup();
      });
    },
    cancel() {
      // handled via abort listener
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Transfer-Encoding": "chunked"
    }
  });
}

