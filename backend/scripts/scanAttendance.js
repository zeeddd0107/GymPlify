// scanAttendance.js
// Usage: node scanAttendance.js
// Make sure you have backend/config/serviceAccountKey.json (not committed to git)
// This script listens for QR code input (userId), fetches user info, and logs attendance.

const readline = require("readline");
const admin = require("firebase-admin");
const path = require("path");

// Path to your service account key
const serviceAccountPath = path.join(
  __dirname,
  "../config/serviceAccountKey.json",
);

try {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
  });
} catch (e) {
  console.error(
    "Failed to initialize Firebase Admin. Make sure serviceAccountKey.json exists.",
  );
  process.exit(1);
}

const db = admin.firestore();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

console.log(
  "Ready to scan QR codes. Please scan a QR code (userId will be read):",
);

rl.on("line", async (input) => {
  const qrValue = input.trim();
  if (!qrValue) {
    console.log("No input detected. Please scan again.");
    return;
  }
  // Extract userId from qrValue (format: userId_timestamp_randomNumber)
  const userId = qrValue.split("_")[0];
  if (!userId) {
    console.log("Could not extract userId from QR code.");
    return;
  }
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      console.log(`User with userId ${userId} not found.`);
      return;
    }
    const userInfo = userDoc.data();
    const attendanceData = {
      userId,
      checkInTime: admin.firestore.FieldValue.serverTimestamp(),
      userInfo,
      qrValue, // Optionally store the full scanned value for auditing
    };
    await db.collection("attendance").add(attendanceData);
    console.log(`Attendance recorded for userId: ${userId}`);
  } catch (err) {
    console.error("Error processing attendance:", err);
  }
  console.log("\nReady for next scan:");
});
