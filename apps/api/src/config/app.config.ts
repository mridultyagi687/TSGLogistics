const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.PORT ?? "4000", 10),
  APP_NAME: "TSG Logistics Aggregator API",
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://tsg:tsg_secret@localhost:5432/tsg_logistics"
});

export type AppConfiguration = ReturnType<typeof configuration>;

export default configuration;

