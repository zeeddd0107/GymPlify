/**
 * Demo script to show how the login attempt system works
 * This is not a test file, just a demonstration
 */

import loginAttemptService from "../loginAttemptService";

// Mock localStorage for demo
const mockLocalStorage = {
  data: {},
  getItem: (key) => mockLocalStorage.data[key] || null,
  setItem: (key, value) => {
    mockLocalStorage.data[key] = value;
  },
  removeItem: (key) => {
    delete mockLocalStorage.data[key];
  },
  clear: () => {
    mockLocalStorage.data = {};
  },
};

// Mock Firestore for demo
const mockFirestore = {
  data: {},
  doc: (collection, id) => ({ collection, id }),
  getDoc: async (docRef) => {
    const data = mockFirestore.data[docRef.id];
    return {
      exists: () => !!data,
      data: () => data,
    };
  },
  setDoc: async (docRef, data) => {
    mockFirestore.data[docRef.id] = data;
  },
};

// Override the service methods for demo
const _originalGetLocalAttempts = loginAttemptService.getLocalAttempts;
const _originalSaveLocalAttempts = loginAttemptService.saveLocalAttempts;
const _originalGetFirestoreAttempts = loginAttemptService.getFirestoreAttempts;
const _originalSaveFirestoreAttempts =
  loginAttemptService.saveFirestoreAttempts;

loginAttemptService.getLocalAttempts = () => {
  const stored = mockLocalStorage.getItem("gymplify_login_attempts");
  return stored ? JSON.parse(stored) : null;
};

loginAttemptService.saveLocalAttempts = (data) => {
  mockLocalStorage.setItem("gymplify_login_attempts", JSON.stringify(data));
};

loginAttemptService.getFirestoreAttempts = async (email) => {
  const mockDoc = { id: email };
  const mockSnap = await mockFirestore.getDoc(mockDoc);
  return mockSnap.exists() ? mockSnap.data() : null;
};

loginAttemptService.saveFirestoreAttempts = async (email, data) => {
  const mockDoc = mockFirestore.doc("loginAttempts", email);
  await mockFirestore.setDoc(mockDoc, data);
};

// Demo function
async function demonstrateLoginAttempts() {
  console.log("=== Login Attempt System Demo ===\n");

  const testEmail = "test@example.com";

  // Scenario 1: First failed attempt
  console.log("1. First failed login attempt:");
  const result1 = await loginAttemptService.recordFailedAttempt(testEmail);
  console.log(
    `   Attempts: ${result1.attempts}, Remaining: ${result1.remainingAttempts}, Locked: ${result1.isLocked}`,
  );

  // Scenario 2: Second failed attempt
  console.log("\n2. Second failed login attempt:");
  const result2 = await loginAttemptService.recordFailedAttempt(testEmail);
  console.log(
    `   Attempts: ${result2.attempts}, Remaining: ${result2.remainingAttempts}, Locked: ${result2.isLocked}`,
  );

  // Scenario 3: Check status message
  console.log("\n3. Status message:");
  const statusMessage =
    await loginAttemptService.getAttemptStatusMessage(testEmail);
  console.log(`   Message: "${statusMessage}"`);

  // Scenario 4: Successful login - reset attempts
  console.log("\n4. Successful login - resetting attempts:");
  await loginAttemptService.resetAttempts(testEmail);
  const resetStatus =
    await loginAttemptService.getAttemptStatusMessage(testEmail);
  console.log(
    `   After reset: "${resetStatus || "No message (attempts reset)"}"`,
  );

  // Scenario 5: Multiple failed attempts leading to lockout
  console.log("\n5. Multiple failed attempts leading to lockout:");
  for (let i = 0; i < 5; i++) {
    const result = await loginAttemptService.recordFailedAttempt(testEmail);
    console.log(
      `   Attempt ${i + 1}: ${result.attempts} attempts, Locked: ${result.isLocked}`,
    );
  }

  // Scenario 6: Check lockout message
  console.log("\n6. Lockout message:");
  const lockoutMessage =
    await loginAttemptService.getAttemptStatusMessage(testEmail);
  console.log(`   Message: "${lockoutMessage}"`);

  // Scenario 7: Check if account is locked
  console.log("\n7. Account lock status:");
  const isLocked = await loginAttemptService.isAccountLocked(testEmail);
  console.log(`   Is locked: ${isLocked}`);

  // Scenario 8: Clear all attempts (simulating logout)
  console.log("\n8. Clearing all attempts (logout):");
  loginAttemptService.clearAllLocalAttempts();
  const clearedStatus =
    await loginAttemptService.getAttemptStatusMessage(testEmail);
  console.log(
    `   After clear: "${clearedStatus || "No message (attempts cleared)"}"`,
  );

  console.log("\n=== Demo Complete ===");
}

// Export for potential use
export { demonstrateLoginAttempts };

// If running directly, execute the demo
if (typeof window === "undefined") {
  demonstrateLoginAttempts().catch(console.error);
}
