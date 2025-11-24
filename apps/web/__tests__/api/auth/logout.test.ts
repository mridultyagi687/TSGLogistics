/**
 * Integration tests for logout API route
 */

import { POST } from "../../../app/api/auth/logout/route";
import { authenticate } from "../../../lib/auth-simple";
import { prisma } from "../../../lib/prisma";

// Mock next/headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const { cookies } = require("next/headers");

describe("POST /api/auth/logout", () => {
  let mockCookieStore: any;

  beforeEach(() => {
    mockCookieStore = {
      get: jest.fn(),
      delete: jest.fn(),
    };
    cookies.mockReturnValue(mockCookieStore);
  });

  afterEach(async () => {
    await prisma.session.deleteMany({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should logout and delete session", async () => {
    // Create a session
    const authSession = await authenticate("admin", "admin123", {});
    expect(authSession).not.toBeNull();

    mockCookieStore.get.mockReturnValue({
      value: authSession!.sessionId,
    });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockCookieStore.delete).toHaveBeenCalledWith("session_id");

    // Verify session was deleted
    const session = await prisma.session.findUnique({
      where: { sessionId: authSession!.sessionId },
    });
    expect(session).toBeNull();
  });

  it("should handle logout without session cookie", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockCookieStore.delete).toHaveBeenCalledWith("session_id");
  });

  it("should handle invalid session ID gracefully", async () => {
    mockCookieStore.get.mockReturnValue({
      value: "invalid-session-id",
    });

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockCookieStore.delete).toHaveBeenCalledWith("session_id");
  });

  it("should return 500 for database errors", async () => {
    const authSession = await authenticate("admin", "admin123", {});

    mockCookieStore.get.mockReturnValue({
      value: authSession!.sessionId,
    });

    // Mock Prisma to throw an error
    const originalDeleteMany = prisma.session.deleteMany;
    prisma.session.deleteMany = jest
      .fn()
      .mockRejectedValue(new Error("DB Error"));

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");

    // Restore original
    prisma.session.deleteMany = originalDeleteMany;
  });
});

