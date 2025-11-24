const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "4001", 10),
  APP_NAME: "TSG Orders Service",
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://tsg:tsg_secret@localhost:5432/tsg_logistics?schema=orders",
  SERVICES: {
    VENDOR: process.env.VENDOR_SERVICE_URL ?? "http://localhost:4002",
    WALLET: process.env.WALLET_SERVICE_URL ?? "http://localhost:4003"
  }
});

export type AppConfiguration = ReturnType<typeof configuration>;

export default configuration;

