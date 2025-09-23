require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const admin = require("../config/firebase");

/*
Usage:
  node scripts/addStaff.js "Full Name" staff@example.com

Behavior:
  - Creates Firebase Auth user with a generated temporary password
  - Writes Firestore user document with role: "staff" and displayName
  - Includes lastLogout field (initially null)
  - Generates a 16-character password with letters, numbers, and one special character
  - Outputs login credentials for the staff member to use immediately
*/

const fullName = process.argv[2];
const email = process.argv[3];

if (!fullName || !email) {
  console.error('Usage: node scripts/addStaff.js "Full Name" user@example.com');
  process.exit(1);
}

function generateTemporaryPassword() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*";

  let password = "";

  // Generate 11 characters with letters and numbers
  for (let i = 0; i < 11; i++) {
    const charSet = Math.random() < 0.6 ? letters : numbers; // 60% letters, 40% numbers
    password += charSet.charAt(Math.floor(Math.random() * charSet.length));
  }

  // Add one special character at the end
  password += specialChars.charAt(
    Math.floor(Math.random() * specialChars.length),
  );

  return password;
}

async function ensureUser(email, temporaryPassword) {
  try {
    const user = await admin.auth().getUserByEmail(email);
    return user;
  } catch (e) {
    if (e.code === "auth/user-not-found") {
      return await admin.auth().createUser({
        email,
        password: temporaryPassword,
        emailVerified: false,
      });
    }
    throw e;
  }
}

async function main() {
  try {
    const temporaryPassword = generateTemporaryPassword();
    const user = await ensureUser(email, temporaryPassword);

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
        lastLogout: null, // Will be set when user logs out
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    console.log("==================================================");
    console.log("✅ STAFF USER CREATED SUCCESSFULLY");
    console.log("==================================================");
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Name: ${fullName}`);
    console.log(`🆔 UID: ${user.uid}`);
    console.log(`👥 Role: staff`);
    console.log(`🕒 lastLogout: null (will be set on logout)`);
    console.log("");
    console.log("🔑 LOGIN CREDENTIALS:");
    console.log(`   📧 Email: ${email}`);
    console.log(`   🔐 Password: ${temporaryPassword}`);
    console.log("");
    console.log("📝 Instructions for staff member:");
    console.log("   1. Use the credentials above to log in");
    console.log("   2. Change password after first login");
    console.log("   3. Password can be changed in profile settings");
    console.log("");
    console.log("==================================================");

    process.exit(0);
  } catch (err) {
    console.error("Failed to add staff:", err);
    process.exit(1);
  }
}

main();
