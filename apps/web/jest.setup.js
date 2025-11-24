// Jest setup file
// This runs before each test file

// Mock environment variables
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://tsg:tsg_secret@localhost:5432/tsg_logistics_test";
process.env.NODE_ENV = "test";

// Increase timeout for database operations
jest.setTimeout(30000);

