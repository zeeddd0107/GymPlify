require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const admin = require("../config/firebase");

const email = process.argv[2]; // Pass email as argument

if (!email) {
  console.error("Usage: node setAdmin.js user@example.com");
  process.exit(1);
}

admin
  .auth()
  .getUserByEmail(email)
  .then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log(`Admin claim set for ${email}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error setting admin claim:", err);
    process.exit(1);
  });
