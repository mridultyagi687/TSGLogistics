/**
 * Integration tests for login API route
 */

import { POST } from "../../../app/api/auth/login/route";
import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";
import { hash } from "bcryptjs";

// Mock next/headers
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

const { cookies } = require("next/headers");

describe("POST /api/auth/login", () => {
  let mockCookieStore: any;

  beforeEach(() => {
    mockCookieStore = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };
    cookies.mockReturnValue(mockCookieStore);
  });

  afterEach(async () => {
    // Clean up test sessions
    await prisma.session.deleteMany({});
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should login with valid credentials", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-agent": "test-agent",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.username).toBe("admin");
    expect(data.user.role).toBe("admin");
    expect(mockCookieStore.set).toHaveBeenCalledWith(
      "session_id",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60,
        path: "/",
      })
    );
  });

  it("should return 400 for missing username", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: "admin123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Username and password are required");
    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });

  it("should return 400 for missing password", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Username and password are required");
  });

  it("should return 401 for invalid credentials", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "wrongpassword",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Invalid username or password");
    expect(mockCookieStore.set).not.toHaveBeenCalled();
  });

  it("should capture device information", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "user-agent": "Mozilla/5.0 Test Browser",
        "x-forwarded-for": "192.168.1.1",
        "sec-ch-ua-platform": "macOS",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin123",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    // Verify session was created with device info
    const cookieCall = mockCookieStore.set.mock.calls[0];
    const sessionId = cookieCall[1];

    const session = await prisma.session.findUnique({
      where: { sessionId },
    });

    expect(session).not.toBeNull();
    expect(session?.userAgent).toBe("Mozilla/5.0 Test Browser");
    expect(session?.ipAddress).toBe("192.168.1.1");
    expect(session?.deviceInfo).toContain("macOS");
  });

  it("should handle IP address from x-real-ip header", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-real-ip": "10.0.0.1",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin123",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const cookieCall = mockCookieStore.set.mock.calls[0];
    const sessionId = cookieCall[1];

    const session = await prisma.session.findUnique({
      where: { sessionId },
    });

    expect(session?.ipAddress).toBe("10.0.0.1");
  });

  it("should return 500 for database errors", async () => {
    // Mock Prisma to throw an error
    const originalFindUnique = prisma.user.findUnique;
    prisma.user.findUnique = jest.fn().mockRejectedValue(new Error("DB Error"));

    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin123",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Internal server error");

    // Restore original
    prisma.user.findUnique = originalFindUnique;
  });

  it("should handle empty user agent gracefully", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "admin",
        password: "admin123",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);

    const cookieCall = mockCookieStore.set.mock.calls[0];
    const sessionId = cookieCall[1];

    const session = await prisma.session.findUnique({
      where: { sessionId },
    });

    expect(session).not.toBeNull();
    // Should handle missing user agent
  });

  it("should handle malformed JSON", async () => {
    const request = new NextRequest("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "invalid json",
    });

    await expect(POST(request)).rejects.toThrow();
  });
});

