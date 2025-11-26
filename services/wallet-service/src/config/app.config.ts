function getDatabaseUrl(schema: string): string {
  // If service-specific URL is set, use it
  if (schema === "wallet" && process.env.WALLET_DATABASE_URL) {
    return process.env.WALLET_DATABASE_URL;
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
  PORT: parseInt(process.env.WALLET_PORT ?? process.env.PORT ?? "4003", 10),
  APP_NAME: "TSG Wallet Service",
  DATABASE_URL: getDatabaseUrl("wallet")
});

export type AppConfiguration = ReturnType<typeof configuration>;

export default configuration;

