/**
 * Integration tests for session API route
 */

import { GET } from "../../../app/api/auth/session/route";
import { authenticate } from "../../../lib/auth-simple";
import { prisma } from "../../../lib/prisma";

// Mock next/headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const { cookies } = require("next/headers");

describe("GET /api/auth/session", () => {
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

  it("should return user for valid session", async () => {
    const authSession = await authenticate("admin", "admin123", {});
    expect(authSession).not.toBeNull();

    mockCookieStore.get.mockReturnValue({
      value: authSession!.sessionId,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).not.toBeNull();
    expect(data.user.username).toBe("admin");
    expect(data.user.role).toBe("admin");
    expect(data.user.id).toBe(authSession!.userId);
  });

  it("should return null user for missing session cookie", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toBeNull();
  });

  it("should return null user for invalid session ID", async () => {
    mockCookieStore.get.mockReturnValue({
      value: "invalid-session-id",
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toBeNull();
    expect(mockCookieStore.delete).toHaveBeenCalledWith("session_id");
  });

  it("should return null user for expired session", async () => {
    const authSession = await authenticate("admin", "admin123", {});

    // Expire the session
    await prisma.session.update({
      where: { sessionId: authSession!.sessionId },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });

    mockCookieStore.get.mockReturnValue({
      value: authSession!.sessionId,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toBeNull();
    expect(mockCookieStore.delete).toHaveBeenCalledWith("session_id");
  });

  it("should return null user and clear cookie for inactive user", async () => {
    const authSession = await authenticate("admin", "admin123", {});

    // Deactivate user
    await prisma.user.update({
      where: { id: authSession!.userId },
      data: { isActive: false },
    });

    mockCookieStore.get.mockReturnValue({
      value: authSession!.sessionId,
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toBeNull();
    expect(mockCookieStore.delete).toHaveBeenCalledWith("session_id");
  });

  it("should handle database errors gracefully", async () => {
    mockCookieStore.get.mockReturnValue({
      value: "some-session-id",
    });

    // Mock Prisma to throw an error
    const originalFindUnique = prisma.session.findUnique;
    prisma.session.findUnique = jest
      .fn()
      .mockRejectedValue(new Error("DB Error"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toBeNull();

    // Restore original
    prisma.session.findUnique = originalFindUnique;
  });

  it("should update lastAccessed on session retrieval", async () => {
    const authSession = await authenticate("admin", "admin123", {});

    const sessionBefore = await prisma.session.findUnique({
      where: { sessionId: authSession!.sessionId },
    });
    const lastAccessedBefore = sessionBefore?.lastAccessed;

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 1000));

    mockCookieStore.get.mockReturnValue({
      value: authSession!.sessionId,
    });

    await GET();

    const sessionAfter = await prisma.session.findUnique({
      where: { sessionId: authSession!.sessionId },
    });

    expect(sessionAfter?.lastAccessed).not.toEqual(lastAccessedBefore);
  });
});

