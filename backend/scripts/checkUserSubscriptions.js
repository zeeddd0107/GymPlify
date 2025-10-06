const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function checkUserSubscriptions() {
  try {
    console.log("🔍 Checking user subscriptions in Firebase...\n");

    // Get all users
    const usersSnapshot = await db.collection("users").get();
    console.log(`📊 Found ${usersSnapshot.size} users in the database\n`);

    let usersWithActiveSubscriptions = 0;
    let usersWithoutActiveSubscriptions = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;

      console.log(`👤 User: ${userId}`);
      console.log(`   Email: ${userData.email || "N/A"}`);
      console.log(
        `   Display Name: ${userData.displayName || userData.name || "N/A"}`,
      );
      console.log(
        `   Active Subscription ID: ${userData.activeSubscriptionId || "None"}`,
      );

      if (userData.activeSubscriptionId) {
        // Check if the subscription exists and is active
        const subscriptionDoc = await db
          .collection("subscriptions")
          .doc(userData.activeSubscriptionId)
          .get();

        if (subscriptionDoc.exists) {
          const subscriptionData = subscriptionDoc.data();
          const now = new Date();
          const endDate = subscriptionData.endDate?.toDate?.() || new Date();
          const isActive =
            subscriptionData.status === "active" && endDate > now;

          console.log(`   📋 Subscription Details:`);
          console.log(`      - Plan: ${subscriptionData.planName || "N/A"}`);
          console.log(`      - Status: ${subscriptionData.status || "N/A"}`);
          console.log(
            `      - Start Date: ${subscriptionData.startDate?.toDate?.() || "N/A"}`,
          );
          console.log(`      - End Date: ${endDate}`);
          console.log(`      - Is Active: ${isActive ? "✅ YES" : "❌ NO"}`);
          console.log(
            `      - Period Left: ${subscriptionData.periodLeft || "N/A"}`,
          );

          if (isActive) {
            usersWithActiveSubscriptions++;
            console.log(`   🎉 This user HAS an active subscription!`);
          } else {
            usersWithoutActiveSubscriptions++;
            console.log(
              `   ⚠️  This user has a subscription but it's not active (expired or inactive status)`,
            );
          }
        } else {
          console.log(
            `   ❌ Subscription document not found for ID: ${userData.activeSubscriptionId}`,
          );
          usersWithoutActiveSubscriptions++;
        }
      } else {
        console.log(`   ❌ No active subscription ID found`);
        usersWithoutActiveSubscriptions++;
      }

      console.log(""); // Empty line for readability
    }

    console.log("📈 SUMMARY:");
    console.log(
      `   ✅ Users with active subscriptions: ${usersWithActiveSubscriptions}`,
    );
    console.log(
      `   ❌ Users without active subscriptions: ${usersWithoutActiveSubscriptions}`,
    );
    console.log(`   📊 Total users: ${usersSnapshot.size}`);

    // Check subscription plans collection
    console.log("\n🔍 Checking subscription plans collection...");
    const plansSnapshot = await db.collection("subscriptionPlans").get();
    console.log(`📋 Found ${plansSnapshot.size} subscription plans:`);

    for (const planDoc of plansSnapshot.docs) {
      const planData = planDoc.data();
      console.log(
        `   - ${planData.name} (${planDoc.id}): ₱${planData.price} - ${planData.period}`,
      );
    }
  } catch (error) {
    console.error("❌ Error checking user subscriptions:", error);
  }
}

// Run the check
checkUserSubscriptions()
  .then(() => {
    console.log("\n✅ Database check completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
