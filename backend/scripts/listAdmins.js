require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const admin = require("../config/firebase");

async function listAdmins(nextPageToken) {
  const result = await admin.auth().listUsers(1000, nextPageToken);
  result.users.forEach((user) => {
    if (user.customClaims && user.customClaims.admin) {
      console.log(`Admin: ${user.email} (UID: ${user.uid})`);
    }
  });
  if (result.pageToken) {
    await listAdmins(result.pageToken);
  }
}

listAdmins().catch(console.error);
