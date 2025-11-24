/**
 * Comprehensive tests for authentication system
 */

import {
  authenticate,
  getSession,
  deleteSession,
  getUserByUsername,
  getUserById,
  createUser,
  updateUser,
  changePassword,
  getAllUsers,
  getUserSessions,
  deleteAllUserSessions,
  cleanExpiredSessions,
} from "../../lib/auth-simple";
import { prisma } from "../../lib/prisma";
import { hash } from "bcryptjs";

// Test database cleanup helper
async function cleanupTestData() {
  try {
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({
      where: {
        username: {
          notIn: ["admin", "ops-lead", "viewer"],
        },
      },
    });
  } catch (error) {
    // Ignore cleanup errors in tests
  }
}

describe("Authentication System", () => {
  beforeAll(async () => {
    // Ensure test database is ready
    await cleanupTestData();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await cleanupTestData();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("authenticate()", () => {
    it("should authenticate user with valid credentials", async () => {
      const session = await authenticate("admin", "admin123", {
        userAgent: "test-agent",
        ipAddress: "127.0.0.1",
      });

      expect(session).not.toBeNull();
      expect(session?.username).toBe("admin");
      expect(session?.role).toBe("admin");
      expect(session?.sessionId).toBeDefined();
    });

    it("should return null for invalid username", async () => {
      const session = await authenticate("nonexistent", "password", {});
      expect(session).toBeNull();
    });

    it("should return null for invalid password", async () => {
      const session = await authenticate("admin", "wrongpassword", {});
      expect(session).toBeNull();
    });

    it("should return null for inactive user", async () => {
      // Create an inactive user
      const inactiveUser = await createUser(
        "inactive",
        "inactive@test.com",
        "password123",
        "viewer",
        "org_test",
        "Inactive User"
      );
      await updateUser(inactiveUser.id, { isActive: false });

      const session = await authenticate("inactive", "password123", {});
      expect(session).toBeNull();
    });

    it("should create session with device information", async () => {
      const deviceInfo = {
        userAgent: "Mozilla/5.0 Test",
        ipAddress: "192.168.1.1",
        deviceInfo: JSON.stringify({ platform: "test" }),
      };

      const session = await authenticate("admin", "admin123", deviceInfo);
      expect(session).not.toBeNull();

      // Verify session was created in database
      const dbSession = await prisma.session.findUnique({
        where: { sessionId: session!.sessionId },
      });

      expect(dbSession).not.toBeNull();
      expect(dbSession?.userAgent).toBe(deviceInfo.userAgent);
      expect(dbSession?.ipAddress).toBe(deviceInfo.ipAddress);
    });

    it("should update lastLogin timestamp", async () => {
      const userBefore = await getUserByUsername("admin");
      const lastLoginBefore = userBefore?.lastLogin;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await authenticate("admin", "admin123", {});

      const userAfter = await getUserByUsername("admin");
      expect(userAfter?.lastLogin).not.toBe(lastLoginBefore);
      expect(userAfter?.lastLogin).toBeInstanceOf(Date);
    });

    it("should handle case-insensitive username", async () => {
      const session1 = await authenticate("ADMIN", "admin123", {});
      const session2 = await authenticate("admin", "admin123", {});

      expect(session1).not.toBeNull();
      expect(session2).not.toBeNull();
      expect(session1?.username).toBe("admin");
      expect(session2?.username).toBe("admin");
    });
  });

  describe("getSession()", () => {
    it("should retrieve valid session", async () => {
      const authSession = await authenticate("admin", "admin123", {});
      expect(authSession).not.toBeNull();

      const session = await getSession(authSession!.sessionId);
      expect(session).not.toBeNull();
      expect(session?.userId).toBe(authSession?.userId);
      expect(session?.username).toBe("admin");
    });

    it("should return null for invalid session ID", async () => {
      const session = await getSession("invalid-session-id");
      expect(session).toBeNull();
    });

    it("should return null for expired session", async () => {
      const authSession = await authenticate("admin", "admin123", {});
      expect(authSession).not.toBeNull();

      // Manually expire the session
      await prisma.session.update({
        where: { sessionId: authSession!.sessionId },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      const session = await getSession(authSession!.sessionId);
      expect(session).toBeNull();
    });

    it("should update lastAccessed timestamp", async () => {
      const authSession = await authenticate("admin", "admin123", {});
      expect(authSession).not.toBeNull();

      const dbSessionBefore = await prisma.session.findUnique({
        where: { sessionId: authSession!.sessionId },
      });
      const lastAccessedBefore = dbSessionBefore?.lastAccessed;

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await getSession(authSession!.sessionId);

      const dbSessionAfter = await prisma.session.findUnique({
        where: { sessionId: authSession!.sessionId },
      });
      expect(dbSessionAfter?.lastAccessed).not.toEqual(lastAccessedBefore);
    });

    it("should return null if user is inactive", async () => {
      const authSession = await authenticate("admin", "admin123", {});
      expect(authSession).not.toBeNull();

      // Deactivate user
      await updateUser(authSession!.userId, { isActive: false });

      const session = await getSession(authSession!.sessionId);
      expect(session).toBeNull();
    });
  });

  describe("deleteSession()", () => {
    it("should delete session from database", async () => {
      const authSession = await authenticate("admin", "admin123", {});
      expect(authSession).not.toBeNull();

      await deleteSession(authSession!.sessionId);

      const session = await getSession(authSession!.sessionId);
      expect(session).toBeNull();

      const dbSession = await prisma.session.findUnique({
        where: { sessionId: authSession!.sessionId },
      });
      expect(dbSession).toBeNull();
    });

    it("should handle deleting non-existent session gracefully", async () => {
      await expect(deleteSession("non-existent-session")).resolves.not.toThrow();
    });
  });

  describe("getUserByUsername()", () => {
    it("should retrieve user by username", async () => {
      const user = await getUserByUsername("admin");
      expect(user).not.toBeNull();
      expect(user?.username).toBe("admin");
      expect(user?.email).toBe("admin@tsglogistics.in");
    });

    it("should return null for non-existent username", async () => {
      const user = await getUserByUsername("nonexistent");
      expect(user).toBeNull();
    });

    it("should handle case-insensitive username", async () => {
      const user1 = await getUserByUsername("ADMIN");
      const user2 = await getUserByUsername("admin");
      expect(user1).not.toBeNull();
      expect(user2).not.toBeNull();
      expect(user1?.username).toBe("admin");
      expect(user2?.username).toBe("admin");
    });
  });

  describe("getUserById()", () => {
    it("should retrieve user by ID", async () => {
      const userByUsername = await getUserByUsername("admin");
      expect(userByUsername).not.toBeNull();

      const userById = await getUserById(userByUsername!.id);
      expect(userById).not.toBeNull();
      expect(userById?.id).toBe(userByUsername!.id);
      expect(userById?.username).toBe("admin");
    });

    it("should return null for non-existent user ID", async () => {
      const user = await getUserById("non-existent-id");
      expect(user).toBeNull();
    });
  });

  describe("createUser()", () => {
    it("should create new user", async () => {
      const user = await createUser(
        "testuser",
        "test@example.com",
        "password123",
        "viewer",
        "org_test",
        "Test User"
      );

      expect(user).not.toBeNull();
      expect(user.username).toBe("testuser");
      expect(user.email).toBe("test@example.com");
      expect(user.role).toBe("viewer");
      expect(user.isActive).toBe(true);

      // Verify password is hashed
      expect(user.passwordHash).not.toBe("password123");
      expect(user.passwordHash.length).toBeGreaterThan(20);
    });

    it("should throw error for duplicate username", async () => {
      await createUser(
        "duplicate",
        "dup1@example.com",
        "password123",
        "viewer",
        "org_test",
        "Duplicate 1"
      );

      await expect(
        createUser(
          "duplicate",
          "dup2@example.com",
          "password123",
          "viewer",
          "org_test",
          "Duplicate 2"
        )
      ).rejects.toThrow("User already exists");
    });

    it("should hash password", async () => {
      const user = await createUser(
        "hashtest",
        "hash@example.com",
        "plainpassword",
        "viewer",
        "org_test",
        "Hash Test"
      );

      expect(user.passwordHash).not.toBe("plainpassword");
      expect(user.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    });
  });

  describe("updateUser()", () => {
    it("should update user fields", async () => {
      const user = await createUser(
        "updatetest",
        "update@example.com",
        "password123",
        "viewer",
        "org_test",
        "Update Test"
      );

      const updated = await updateUser(user.id, {
        name: "Updated Name",
        email: "updated@example.com",
        role: "ops_lead",
      });

      expect(updated).not.toBeNull();
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.email).toBe("updated@example.com");
      expect(updated?.role).toBe("ops_lead");
    });

    it("should return null for non-existent user", async () => {
      const updated = await updateUser("non-existent-id", {
        name: "Test",
      });
      expect(updated).toBeNull();
    });

    it("should update isActive status", async () => {
      const user = await createUser(
        "activetest",
        "active@example.com",
        "password123",
        "viewer",
        "org_test",
        "Active Test"
      );

      const updated = await updateUser(user.id, { isActive: false });
      expect(updated?.isActive).toBe(false);
    });
  });

  describe("changePassword()", () => {
    it("should change password with valid old password", async () => {
      const user = await createUser(
        "passwordtest",
        "password@example.com",
        "oldpassword",
        "viewer",
        "org_test",
        "Password Test"
      );

      const result = await changePassword(
        user.id,
        "oldpassword",
        "newpassword"
      );
      expect(result).toBe(true);

      // Verify new password works
      const session = await authenticate("passwordtest", "newpassword", {});
      expect(session).not.toBeNull();
    });

    it("should return false for invalid old password", async () => {
      const user = await createUser(
        "passwordtest2",
        "password2@example.com",
        "oldpassword",
        "viewer",
        "org_test",
        "Password Test 2"
      );

      const result = await changePassword(
        user.id,
        "wrongpassword",
        "newpassword"
      );
      expect(result).toBe(false);

      // Verify old password still works
      const session = await authenticate("passwordtest2", "oldpassword", {});
      expect(session).not.toBeNull();
    });

    it("should return false for non-existent user", async () => {
      const result = await changePassword(
        "non-existent-id",
        "old",
        "new"
      );
      expect(result).toBe(false);
    });
  });

  describe("getAllUsers()", () => {
    it("should return all users", async () => {
      await createUser(
        "listtest1",
        "list1@example.com",
        "password123",
        "viewer",
        "org_test",
        "List Test 1"
      );
      await createUser(
        "listtest2",
        "list2@example.com",
        "password123",
        "viewer",
        "org_test",
        "List Test 2"
      );

      const users = await getAllUsers();
      expect(users.length).toBeGreaterThanOrEqual(2);
      expect(users.some((u) => u.username === "listtest1")).toBe(true);
      expect(users.some((u) => u.username === "listtest2")).toBe(true);
    });

    it("should include default users", async () => {
      const users = await getAllUsers();
      const usernames = users.map((u) => u.username);
      expect(usernames).toContain("admin");
      expect(usernames).toContain("ops-lead");
      expect(usernames).toContain("viewer");
    });
  });

  describe("getUserSessions()", () => {
    it("should return all active sessions for user", async () => {
      const authSession1 = await authenticate("admin", "admin123", {
        userAgent: "Device 1",
      });
      const authSession2 = await authenticate("admin", "admin123", {
        userAgent: "Device 2",
      });

      expect(authSession1).not.toBeNull();
      expect(authSession2).not.toBeNull();

      const sessions = await getUserSessions(authSession1!.userId);
      expect(sessions.length).toBeGreaterThanOrEqual(2);
      expect(
        sessions.some((s) => s.sessionId === authSession1!.sessionId)
      ).toBe(true);
      expect(
        sessions.some((s) => s.sessionId === authSession2!.sessionId)
      ).toBe(true);
    });

    it("should not return expired sessions", async () => {
      const authSession = await authenticate("admin", "admin123", {});

      // Expire the session
      await prisma.session.update({
        where: { sessionId: authSession!.sessionId },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      const sessions = await getUserSessions(authSession!.userId);
      expect(
        sessions.some((s) => s.sessionId === authSession!.sessionId)
      ).toBe(false);
    });
  });

  describe("deleteAllUserSessions()", () => {
    it("should delete all sessions for a user", async () => {
      const authSession1 = await authenticate("admin", "admin123", {});
      const authSession2 = await authenticate("admin", "admin123", {});

      expect(authSession1).not.toBeNull();
      expect(authSession2).not.toBeNull();

      await deleteAllUserSessions(authSession1!.userId);

      const session1 = await getSession(authSession1!.sessionId);
      const session2 = await getSession(authSession2!.sessionId);

      expect(session1).toBeNull();
      expect(session2).toBeNull();
    });
  });

  describe("cleanExpiredSessions()", () => {
    it("should delete expired sessions", async () => {
      const authSession1 = await authenticate("admin", "admin123", {});
      const authSession2 = await authenticate("admin", "admin123", {});

      // Expire first session
      await prisma.session.update({
        where: { sessionId: authSession1!.sessionId },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      await cleanExpiredSessions();

      const session1 = await getSession(authSession1!.sessionId);
      const session2 = await getSession(authSession2!.sessionId);

      expect(session1).toBeNull();
      expect(session2).not.toBeNull(); // Should still be valid
    });
  });
});

