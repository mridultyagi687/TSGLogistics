function getDatabaseUrl(schema: string): string {
  // If service-specific URL is set, use it
  if (schema === "orders" && process.env.ORDERS_DATABASE_URL) {
    return process.env.ORDERS_DATABASE_URL;
  }
  
  // Otherwise, use DATABASE_URL and append schema
  const baseUrl = process.env.DATABASE_URL ?? "postgresql://tsg:tsg_secret@localhost:5432/tsg_logistics";
  
  // If URL already has query parameters, append schema; otherwise add it
  if (baseUrl.includes("?")) {
    // Check if schema already exists
    if (baseUrl.includes(`schema=${schema}`)) {
      return baseUrl;
    }
    // Append schema parameter
    return `${baseUrl}&schema=${schema}`;
  } else {
    return `${baseUrl}?schema=${schema}`;
  }
}

const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.ORDERS_PORT ?? process.env.PORT ?? "4001", 10),
  APP_NAME: "TSG Orders Service",
  DATABASE_URL: getDatabaseUrl("orders"),
  SERVICES: {
    VENDOR: process.env.VENDOR_SERVICE_URL ?? "http://localhost:4002",
    WALLET: process.env.WALLET_SERVICE_URL ?? "http://localhost:4003"
  }
});

export type AppConfiguration = ReturnType<typeof configuration>;

export default configuration;

