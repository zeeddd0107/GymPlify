require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const admin = require("../config/firebase");

const email = process.argv[2];

if (!email) {
  console.error("Usage: node removeAdmin.js user@example.com");
  process.exit(1);
}

admin
  .auth()
  .getUserByEmail(email)
  .then((user) => {
    // Remove the admin claim
    return admin.auth().setCustomUserClaims(user.uid, {});
  })
  .then(() => {
    console.log(`Admin claim removed for ${email}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error removing admin claim:", err);
    process.exit(1);
  });
