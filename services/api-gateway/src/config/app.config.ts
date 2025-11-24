const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.GATEWAY_PORT ?? process.env.PORT ?? "4000", 10),
  ORDERS_SERVICE_URL:
    process.env.ORDERS_SERVICE_URL ?? "http://localhost:4001",
  VENDOR_SERVICE_URL:
    process.env.VENDOR_SERVICE_URL ?? "http://localhost:4002",
  WALLET_SERVICE_URL:
    process.env.WALLET_SERVICE_URL ?? "http://localhost:4003",
  CORS_ORIGINS: process.env.CORS_ORIGINS ?? "http://localhost:3000",
  REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
  TELEMETRY_CHANNEL:
    process.env.TELEMETRY_CHANNEL ?? "telemetry:gateway:events",
  TRIP_LIFECYCLE_WEBHOOK_URL:
    process.env.TRIP_LIFECYCLE_WEBHOOK_URL ?? ""
});

export type GatewayConfiguration = ReturnType<typeof configuration>;

export default configuration;

