require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const admin = require("../config/firebase");

/*
Usage:
  node scripts/addStaff.js "Full Name" staff@example.com

Behavior:
  - Creates Firebase Auth user if missing (no password required here)
  - Writes Firestore user document with role: "staff" and displayName
  - Outputs a password reset link to share with the staff member
*/

const fullName = process.argv[2];
const email = process.argv[3];

if (!fullName || !email) {
  console.error('Usage: node scripts/addStaff.js "Full Name" user@example.com');
  process.exit(1);
}

async function ensureUser(email) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    return user;
  } catch (e) {
    if (e.code === "auth/user-not-found") {
      return await admin.auth().createUser({ email, emailVerified: false });
    }
    throw e;
  }
}

async function main() {
  try {
    const user = await ensureUser(email);

    // Write Firestore user document
    const db = admin.firestore();
    const userRef = db.collection("users").doc(user.uid);
    await userRef.set(
      {
        uid: user.uid,
        email,
        displayName: fullName,
        role: "staff",
        provider: "password",
        photoURL:
          user.photoURL ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0D8ABC&color=fff&bold=true`,
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    // Generate password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    console.log("Staff user ensured:", email);
    console.log("UID:", user.uid);
    console.log("Role: staff");
    console.log("Password reset link (send to the staff):\n", resetLink);

    process.exit(0);
  } catch (err) {
    console.error("Failed to add staff:", err);
    process.exit(1);
  }
}

main();
