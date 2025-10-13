import { describe, it, expect, beforeEach, vi } from "vitest";
import loginAttemptService from "../loginAttemptService";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock Firestore
const mockFirestore = {
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
};

vi.mock("@/config/firebase", () => ({
  db: mockFirestore,
}));

describe("LoginAttemptService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe("getLocalAttempts", () => {
    it("should return null when no data is stored", () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = loginAttemptService.getLocalAttempts();
      expect(result).toBeNull();
    });

    it("should return parsed data when valid data is stored", () => {
      const testData = {
        email: "test@example.com",
        attempts: 2,
        lastAttempt: "2024-01-01T00:00:00.000Z",
        lockedUntil: null,
        updatedAt: "2024-01-01T00:00:00.000Z",
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(testData));

      const result = loginAttemptService.getLocalAttempts();
      expect(result).toEqual(testData);
    });

    it("should return null when invalid JSON is stored", () => {
      localStorageMock.getItem.mockReturnValue("invalid json");
      const result = loginAttemptService.getLocalAttempts();
      expect(result).toBeNull();
    });
  });

  describe("saveLocalAttempts", () => {
    it("should save data to localStorage", () => {
      const testData = {
        email: "test@example.com",
        attempts: 1,
        lastAttempt: "2024-01-01T00:00:00.000Z",
        lockedUntil: null,
        updatedAt: "2024-01-01T00:00:00.000Z",
      };

      loginAttemptService.saveLocalAttempts(testData);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "gymplify_login_attempts",
        JSON.stringify(testData),
      );
    });
  });

  describe("recordFailedAttempt", () => {
    it("should record first failed attempt", async () => {
      const email = "test@example.com";
      const mockDoc = { id: email };
      const mockSnap = { exists: () => false };

      mockFirestore.doc.mockReturnValue(mockDoc);
      mockFirestore.getDoc.mockResolvedValue(mockSnap);
      mockFirestore.setDoc.mockResolvedValue();

      const result = await loginAttemptService.recordFailedAttempt(email);

      expect(result.attempts).toBe(1);
      expect(result.remainingAttempts).toBe(4);
      expect(result.isLocked).toBe(false);
      expect(result.lockedUntil).toBeNull();
    });

    it("should lock account after 5 failed attempts", async () => {
      const email = "test@example.com";
      const mockDoc = { id: email };
      const mockSnap = {
        exists: () => true,
        data: () => ({
          email,
          attempts: 4,
          lastAttempt: "2024-01-01T00:00:00.000Z",
          lockedUntil: null,
          updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      };

      mockFirestore.doc.mockReturnValue(mockDoc);
      mockFirestore.getDoc.mockResolvedValue(mockSnap);
      mockFirestore.setDoc.mockResolvedValue();

      const result = await loginAttemptService.recordFailedAttempt(email);

      expect(result.attempts).toBe(5);
      expect(result.remainingAttempts).toBe(0);
      expect(result.isLocked).toBe(true);
      expect(result.lockedUntil).toBeInstanceOf(Date);
    });
  });

  describe("resetAttempts", () => {
    it("should reset attempts to zero", async () => {
      const email = "test@example.com";
      const mockDoc = { id: email };

      mockFirestore.doc.mockReturnValue(mockDoc);
      mockFirestore.setDoc.mockResolvedValue();

      await loginAttemptService.resetAttempts(email);

      expect(mockFirestore.setDoc).toHaveBeenCalledWith(
        mockDoc,
        expect.objectContaining({
          email,
          attempts: 0,
          lastAttempt: null,
          lockedUntil: null,
        }),
        undefined,
      );
    });
  });

  describe("isAccountLocked", () => {
    it("should return false when account is not locked", async () => {
      const email = "test@example.com";
      const mockDoc = { id: email };
      const mockSnap = {
        exists: () => true,
        data: () => ({
          email,
          attempts: 2,
          lastAttempt: "2024-01-01T00:00:00.000Z",
          lockedUntil: null,
          updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      };

      mockFirestore.doc.mockReturnValue(mockDoc);
      mockFirestore.getDoc.mockResolvedValue(mockSnap);

      const result = await loginAttemptService.isAccountLocked(email);
      expect(result).toBe(false);
    });

    it("should return true when account is locked", async () => {
      const email = "test@example.com";
      const futureTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      const mockDoc = { id: email };
      const mockSnap = {
        exists: () => true,
        data: () => ({
          email,
          attempts: 5,
          lastAttempt: "2024-01-01T00:00:00.000Z",
          lockedUntil: futureTime.toISOString(),
          updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      };

      mockFirestore.doc.mockReturnValue(mockDoc);
      mockFirestore.getDoc.mockResolvedValue(mockSnap);

      const result = await loginAttemptService.isAccountLocked(email);
      expect(result).toBe(true);
    });
  });

  describe("getAttemptStatusMessage", () => {
    it("should return correct message for 3 attempts left", async () => {
      const email = "test@example.com";
      const mockDoc = { id: email };
      const mockSnap = {
        exists: () => true,
        data: () => ({
          email,
          attempts: 2,
          lastAttempt: "2024-01-01T00:00:00.000Z",
          lockedUntil: null,
          updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      };

      mockFirestore.doc.mockReturnValue(mockDoc);
      mockFirestore.getDoc.mockResolvedValue(mockSnap);

      const result = await loginAttemptService.getAttemptStatusMessage(email);
      expect(result).toBe("You have 3 attempts left.");
    });

    it("should return correct message for 2 attempts left", async () => {
      const email = "test@example.com";
      const mockDoc = { id: email };
      const mockSnap = {
        exists: () => true,
        data: () => ({
          email,
          attempts: 3,
          lastAttempt: "2024-01-01T00:00:00.000Z",
          lockedUntil: null,
          updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      };

      mockFirestore.doc.mockReturnValue(mockDoc);
      mockFirestore.getDoc.mockResolvedValue(mockSnap);

      const result = await loginAttemptService.getAttemptStatusMessage(email);
      expect(result).toBe("You have 2 attempts left.");
    });

    it("should return correct message for 1 attempt left", async () => {
      const email = "test@example.com";
      const mockDoc = { id: email };
      const mockSnap = {
        exists: () => true,
        data: () => ({
          email,
          attempts: 4,
          lastAttempt: "2024-01-01T00:00:00.000Z",
          lockedUntil: null,
          updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      };

      mockFirestore.doc.mockReturnValue(mockDoc);
      mockFirestore.getDoc.mockResolvedValue(mockSnap);

      const result = await loginAttemptService.getAttemptStatusMessage(email);
      expect(result).toBe(
        "You have 1 attempt left before your account is temporarily locked.",
      );
    });

    it("should return lockout message when account is locked", async () => {
      const email = "test@example.com";
      const futureTime = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
      const mockDoc = { id: email };
      const mockSnap = {
        exists: () => true,
        data: () => ({
          email,
          attempts: 5,
          lastAttempt: "2024-01-01T00:00:00.000Z",
          lockedUntil: futureTime.toISOString(),
          updatedAt: "2024-01-01T00:00:00.000Z",
        }),
      };

      mockFirestore.doc.mockReturnValue(mockDoc);
      mockFirestore.getDoc.mockResolvedValue(mockSnap);

      const result = await loginAttemptService.getAttemptStatusMessage(email);
      expect(result).toContain(
        "Account locked due to multiple failed attempts",
      );
      expect(result).toContain("Try again in");
    });
  });
});
