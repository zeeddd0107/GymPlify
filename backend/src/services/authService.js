const admin = require('../../config/firebase');

exports.getAllUsers = async () => {
  const users = [];

  const listAllUsers = async (nextPageToken) => {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    result.users.forEach(userRecord => {
      users.push({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName || '',
      });
    });

    if (result.pageToken) {
      await listAllUsers(result.pageToken);
    }
  };

  await listAllUsers();
  return users;
};
