const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: parseInt(process.env.WALLET_PORT ?? process.env.PORT ?? "4003", 10),
  APP_NAME: "TSG Wallet Service",
  DATABASE_URL:
    process.env.WALLET_DATABASE_URL ??
    process.env.DATABASE_URL ??
    "postgresql://tsg:tsg_secret@localhost:5432/tsg_logistics?schema=wallet"
});

export type AppConfiguration = ReturnType<typeof configuration>;

export default configuration;

