const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.VENDOR_PORT ?? process.env.PORT ?? "4002", 10),
  APP_NAME: "TSG Vendor Service",
  DATABASE_URL:
    process.env.VENDOR_DATABASE_URL ??
    process.env.DATABASE_URL ??
    "postgresql://tsg:tsg_secret@localhost:5432/tsg_logistics?schema=vendors"
});

export type AppConfiguration = ReturnType<typeof configuration>;

export default configuration;

