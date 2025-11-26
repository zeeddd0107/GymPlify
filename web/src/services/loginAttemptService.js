import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebase";

class LoginAttemptService {
  constructor() {
    this.MAX_ATTEMPTS = 5;
    this.LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    this.STORAGE_KEY = "gymplify_login_attempts";
  }

  /**
   * Let me get login attempts data from localStorage
   */
  getLocalAttempts() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error("Error reading login attempts from localStorage:", error);
      return null;
    }
  }

  /**
   * Let me save login attempts data to localStorage
   */
  saveLocalAttempts(attemptsData) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(attemptsData));
    } catch (error) {
      console.error("Error saving login attempts to localStorage:", error);
    }
  }

  /**
   * Let me get login attempts data from Firestore
   */
  async getFirestoreAttempts(email) {
    try {
      const attemptsRef = doc(db, "loginAttempts", email);
      const attemptsSnap = await getDoc(attemptsRef);
      return attemptsSnap.exists() ? attemptsSnap.data() : null;
    } catch {
      // Silently fail - Firestore access is optional, localStorage is primary for web
      // The OTP system uses Firebase Cloud Functions which have admin access
      return null;
    }
  }

  /**
   * Let me save login attempts data to Firestore
   */
  async saveFirestoreAttempts(email, attemptsData) {
    try {
      const attemptsRef = doc(db, "loginAttempts", email);
      await setDoc(attemptsRef, {
        ...attemptsData,
        updatedAt: serverTimestamp(),
      });
    } catch {
      // Silently fail - Firestore access is optional, localStorage is primary for web
      // The OTP system uses Firebase Cloud Functions which have admin access
    }
  }

  /**
   * Let me get current login attempts for an email
   */
  async getAttempts(email) {
    // Let me get from localStorage first since it's faster
    const localAttempts = this.getLocalAttempts();

    // If I have local attempts for the same email, I'll use them for better performance
    if (localAttempts && localAttempts.email === email) {
      // I'll only check Firestore if the local data is older than 1 minute
      const localTime = new Date(localAttempts.updatedAt);
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

      if (localTime > oneMinuteAgo) {
        return localAttempts;
      }
    }

    // Let me get from Firestore since it's more reliable across devices
    const firestoreAttempts = await this.getFirestoreAttempts(email);

    // I'll use Firestore data if it's available and more recent, otherwise localStorage
    if (firestoreAttempts && localAttempts) {
      const firestoreTime =
        firestoreAttempts.updatedAt?.toDate?.() ||
        new Date(firestoreAttempts.updatedAt);
      const localTime = new Date(localAttempts.updatedAt);

      if (firestoreTime > localTime) {
        // Let me update localStorage with the Firestore data
        this.saveLocalAttempts(firestoreAttempts);
        return firestoreAttempts;
      }
    }

    // If I have local attempts but they're for a different email, I'll ignore them
    if (localAttempts && localAttempts.email !== email) {
      return (
        firestoreAttempts || {
          email,
          attempts: 0,
          lastAttempt: null,
          lockedUntil: null,
          updatedAt: new Date().toISOString(),
        }
      );
    }

    return (
      firestoreAttempts ||
      localAttempts || {
        email,
        attempts: 0,
        lastAttempt: null,
        lockedUntil: null,
        updatedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Let me record a failed login attempt
   */
  async recordFailedAttempt(email) {
    const attemptsData = await this.getAttempts(email);
    const now = new Date();

    const newAttempts = attemptsData.attempts + 1;
    const isLocked = newAttempts >= this.MAX_ATTEMPTS;
    const lockedUntil = isLocked
      ? new Date(now.getTime() + this.LOCKOUT_DURATION)
      : null;

    const updatedData = {
      email,
      attempts: newAttempts,
      lastAttempt: now.toISOString(),
      lockedUntil: lockedUntil?.toISOString() || null,
      updatedAt: now.toISOString(),
    };

    // Let me save to both localStorage and Firestore
    this.saveLocalAttempts(updatedData);
    await this.saveFirestoreAttempts(email, updatedData);

    return {
      attempts: newAttempts,
      remainingAttempts: Math.max(0, this.MAX_ATTEMPTS - newAttempts),
      isLocked,
      lockedUntil,
    };
  }

  /**
   * Let me reset login attempts after a successful login
   */
  async resetAttempts(email) {
    const resetData = {
      email,
      attempts: 0,
      lastAttempt: null,
      lockedUntil: null,
      updatedAt: new Date().toISOString(),
    };

    // Let me save to both localStorage and Firestore
    this.saveLocalAttempts(resetData);
    await this.saveFirestoreAttempts(email, resetData);
  }

  /**
   * Let me clear all login attempts from localStorage (useful for logout)
   */
  clearAllLocalAttempts() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing login attempts from localStorage:", error);
    }
  }

  /**
   * Let me check if the account is currently locked
   */
  async isAccountLocked(email) {
    const attemptsData = await this.getAttempts(email);

    if (!attemptsData.lockedUntil) {
      return false;
    }

    const lockedUntil = new Date(attemptsData.lockedUntil);
    const now = new Date();

    if (now >= lockedUntil) {
      // The lock has expired, let me reset the attempts
      await this.resetAttempts(email);
      return false;
    }

    return true;
  }

  /**
   * Let me get the remaining lockout time in seconds
   */
  async getRemainingLockoutTime(email) {
    const attemptsData = await this.getAttempts(email);

    if (!attemptsData.lockedUntil) {
      return 0;
    }

    const lockedUntil = new Date(attemptsData.lockedUntil);
    const now = new Date();
    const remaining = Math.max(0, Math.ceil((lockedUntil - now) / 1000));

    if (remaining === 0) {
      // The lock has expired, let me reset the attempts
      await this.resetAttempts(email);
    }

    return remaining;
  }

  /**
   * Let me get the attempt status message
   */
  async getAttemptStatusMessage(email) {
    const attemptsData = await this.getAttempts(email);
    const remainingAttempts = Math.max(
      0,
      this.MAX_ATTEMPTS - attemptsData.attempts,
    );

    if (await this.isAccountLocked(email)) {
      const remainingTime = await this.getRemainingLockoutTime(email);
      const minutes = Math.ceil(remainingTime / 60);
      return `Account locked due to multiple failed attempts. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`;
    }

    if (remainingAttempts === 3) {
      return "You have 3 attempts left.";
    } else if (remainingAttempts === 2) {
      return "You have 2 attempts left.";
    } else if (remainingAttempts === 1) {
      return "You have 1 attempt left before your account is temporarily locked.";
    }

    return null;
  }
}

export default new LoginAttemptService();
