const configuration = () => ({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  VENDOR_SERVICE_URL:
    process.env.VENDOR_SERVICE_URL ?? "http://localhost:4002",
  ORDERS_SERVICE_URL:
    process.env.ORDERS_SERVICE_URL ?? "http://localhost:4001",
  KAFKA_BROKERS: (process.env.KAFKA_BROKERS ?? "localhost:9092").split(","),
  ASSIGNMENT_TOPIC: process.env.ASSIGNMENT_TOPIC ?? "assignment.events",
  ASSIGNMENT_CONSUMER_GROUP:
    process.env.ASSIGNMENT_CONSUMER_GROUP ?? "assignment-worker",
  POLL_INTERVAL_MS: parseInt(process.env.POLL_INTERVAL_MS ?? "15000", 10)
});

export type AssignmentWorkerConfiguration = ReturnType<typeof configuration>;

export default configuration;
