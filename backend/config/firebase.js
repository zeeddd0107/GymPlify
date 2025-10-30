const admin = require("firebase-admin"); // from npm install firebase-admin
const path = require("path");

require("dotenv").config();

// Try to use environment variables first, fall back to service account key file
try {
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined,
  }),
});
} catch (error) {
  // Fallback to service account key file if environment variables are not set
  const serviceAccountKeyPath = path.join(__dirname, "serviceAccountKey.json");
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountKeyPath)),
  });
}

module.exports = admin;
