require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});
const admin = require("../config/firebase");

/*
Usage:
  node scripts/deleteUsersByRange.js MBR-00147 MBR-00150

Behavior:
  - Deletes users with customMemberId in the specified range
  - Removes their Firebase Auth accounts
  - Deletes their Firestore user documents
  - Removes their subscriptions
  - Removes their attendance records
  - Removes their notifications
  - Shows detailed summary of what was deleted

Examples:
  node scripts/deleteUsersByRange.js MBR-00147 MBR-00150
  node scripts/deleteUsersByRange.js MBR-00001 MBR-00010
  node scripts/deleteUsersByRange.js MBR-00100 MBR-00100  (single user)
*/

const startMemberId = process.argv[2];
const endMemberId = process.argv[3];

if (!startMemberId || !endMemberId) {
  console.error('Usage: node scripts/deleteUsersByRange.js MBR-00147 MBR-00150');
  console.error('Example: node scripts/deleteUsersByRange.js MBR-00001 MBR-00010');
  process.exit(1);
}

// Validate member ID format
const memberIdRegex = /^MBR-\d{5}$/;
if (!memberIdRegex.test(startMemberId) || !memberIdRegex.test(endMemberId)) {
  console.error('Error: Member IDs must be in format MBR-XXXXX (e.g., MBR-00147)');
  process.exit(1);
}

// Extract numbers from member IDs
const startNumber = parseInt(startMemberId.split('-')[1]);
const endNumber = parseInt(endMemberId.split('-')[1]);

if (startNumber > endNumber) {
  console.error('Error: Start member ID must be less than or equal to end member ID');
  process.exit(1);
}

console.log("==================================================");
console.log("GYMPLIFY USER DELETION BY MEMBER ID RANGE");
console.log("==================================================");
console.log(`Deleting users from ${startMemberId} to ${endMemberId}`);
console.log(`Range: ${endNumber - startNumber + 1} users`);
console.log("This action cannot be undone!");
console.log("Will delete Firebase Auth accounts + Firestore documents");
console.log("==================================================\n");

async function confirmDeletion() {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('Are you sure you want to delete these users? Type "DELETE" to confirm: ', (answer) => {
      rl.close();
      resolve(answer === 'DELETE');
    });
  });
}

async function findUsersByMemberIdRange() {
  console.log("Finding users in the specified range...");

  const db = admin.firestore();
  const users = [];

  // Query users collection for customMemberId in range
  const usersSnapshot = await db.collection('users')
    .where('customMemberId', '>=', startMemberId)
    .where('customMemberId', '<=', endMemberId)
    .get();

  if (usersSnapshot.empty) {
    console.log("No users found in the specified range");
    return [];
  }

  usersSnapshot.forEach(doc => {
    const userData = doc.data();
    users.push({
      uid: doc.id,
      customMemberId: userData.customMemberId,
      displayName: userData.displayName,
      email: userData.email
    });
  });

  console.log(`Found ${users.length} users in range ${startMemberId} to ${endMemberId}`);
  return users;
}

async function deleteUserData(user) {
  const db = admin.firestore();
  const batch = db.batch();
  let deletedCount = 0;

  try {
    console.log(`Deleting user: ${user.displayName} (${user.customMemberId})`);

    // 1. Delete user's subscriptions
    const subscriptionsSnapshot = await db.collection('subscriptions')
      .where('userId', '==', user.uid)
      .get();

    subscriptionsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
      deletedCount++;
    });

    // 2. Delete user's attendance records
    const attendanceSnapshot = await db.collection('attendance')
      .where('userId', '==', user.uid)
      .get();

    attendanceSnapshot.forEach(doc => {
      batch.delete(doc.ref);
      deletedCount++;
    });

    // 3. Delete user's notifications
    const notificationsSnapshot = await db.collection('notifications')
      .where('userId', '==', user.uid)
      .get();

    notificationsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
      deletedCount++;
    });

    // 4. Delete user's requests
    const requestsSnapshot = await db.collection('requests')
      .where('userId', '==', user.uid)
      .get();

    requestsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
      deletedCount++;
    });

    // 5. Delete user's sessions (if they exist in subcollection)
    const userSessionsRef = db.collection('users').doc(user.uid).collection('sessions');
    const sessionsSnapshot = await userSessionsRef.get();

    sessionsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
      deletedCount++;
    });

    // 6. Delete user document
    const userRef = db.collection('users').doc(user.uid);
    batch.delete(userRef);
    deletedCount++;

    // Commit all Firestore deletions
    await batch.commit();

    // 7. Delete Firebase Auth account
    try {
      await admin.auth().deleteUser(user.uid);
      console.log(`   Deleted Firebase Auth account for ${user.email}`);
    } catch (authError) {
      console.log(`   Could not delete Firebase Auth account for ${user.email}: ${authError.message}`);
    }

    console.log(`   Deleted ${deletedCount} Firestore documents for ${user.displayName}`);

    return {
      success: true,
      deletedCount,
      user: user.displayName,
      memberId: user.customMemberId
    };

  } catch (error) {
    console.error(`   Error deleting user ${user.displayName}:`, error.message);
    return {
      success: false,
      error: error.message,
      user: user.displayName,
      memberId: user.customMemberId
    };
  }
}

async function updateMemberIdCounter(users) {
  if (users.length === 0) return;

  console.log("Updating member ID counter...");

  const db = admin.firestore();
  const counterRef = db.collection('counters').doc('memberId');
  const counterDoc = await counterRef.get();

  if (counterDoc.exists) {
    const currentNumber = counterDoc.data().currentNumber;
    const deletedNumbers = users.map(u => parseInt(u.customMemberId.split('-')[1]));
    const maxDeletedNumber = Math.max(...deletedNumbers);

    // If we deleted users at the end of the range, update the counter
    if (maxDeletedNumber === currentNumber) {
      const remainingUsers = await db.collection('users')
        .where('customMemberId', '>=', 'MBR-00001')
        .orderBy('customMemberId', 'desc')
        .limit(1)
        .get();

      if (!remainingUsers.empty) {
        const lastUserMemberId = remainingUsers.docs[0].data().customMemberId;
        const lastNumber = parseInt(lastUserMemberId.split('-')[1]);

        await counterRef.update({
          currentNumber: lastNumber,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`   Updated member ID counter to ${lastNumber}`);
      }
    } else {
      console.log(`   Member ID counter unchanged (deleted users not at end of range)`);
    }
  }
}

async function main() {
  try {
    // Confirm deletion
    const confirmed = await confirmDeletion();
    if (!confirmed) {
      console.log("Deletion cancelled by user");
      process.exit(0);
    }

    console.log("\nStarting deletion process...\n");

    // Find users in range
    const users = await findUsersByMemberIdRange();

    if (users.length === 0) {
      console.log("No users found to delete");
      process.exit(0);
    }

    // Show users that will be deleted
    console.log("\nUsers that will be deleted:");
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.displayName} (${user.customMemberId}) - ${user.email}`);
    });

    console.log(`\nThis will delete ${users.length} users and all their associated data!`);

    // Confirm again
    const finalConfirm = await confirmDeletion();
    if (!finalConfirm) {
      console.log("Deletion cancelled by user");
      process.exit(0);
    }

    console.log("\nProceeding with deletion...\n");

    // Delete each user
    const results = [];
    let totalDeleted = 0;
    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      const result = await deleteUserData(user);
      results.push(result);

      if (result.success) {
        successCount++;
        totalDeleted += result.deletedCount;
      } else {
        errorCount++;
      }
    }

    // Update member ID counter
    await updateMemberIdCounter(users);

    // Show summary
    console.log("\n==================================================");
    console.log("DELETION SUMMARY");
    console.log("==================================================");
    console.log(`Successfully deleted: ${successCount} users`);
    console.log(`Failed to delete: ${errorCount} users`);
    console.log(`Firebase Auth accounts deleted: ${successCount}`);
    console.log(`Total Firestore documents deleted: ${totalDeleted}`);
    console.log(`Range: ${startMemberId} to ${endMemberId}`);

    if (errorCount > 0) {
      console.log("\nUsers that failed to delete:");
      results.filter(r => !r.success).forEach(result => {
        console.log(`   - ${result.user} (${result.memberId}): ${result.error}`);
      });
    }

    console.log("\nDeletion process completed!");
    console.log("Member ID counter has been updated");
    console.log("You can now use the populate script to add new users");

    process.exit(0);

  } catch (error) {
    console.error("Error during deletion process:", error);
    process.exit(1);
  }
}

main();
