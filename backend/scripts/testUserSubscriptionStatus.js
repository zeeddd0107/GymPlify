const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function testUserSubscriptionStatus() {
  try {
    console.log("🔍 Testing user subscription status detection...\n");

    // Test with Maureen's user ID (she has an active subscription)
    const maureenUserId = "F5BwKP6RytXnDhfSysOhnqHmnM83";
    console.log(`👤 Testing with Maureen's user ID: ${maureenUserId}`);

    // Get user document
    const userDoc = await db.collection("users").doc(maureenUserId).get();

    if (!userDoc.exists) {
      console.log("❌ User document does not exist");
      return;
    }

    const userData = userDoc.data();
    console.log("📋 User data:", {
      email: userData.email,
      displayName: userData.displayName,
      activeSubscriptionId: userData.activeSubscriptionId,
    });

    if (!userData.activeSubscriptionId) {
      console.log("❌ No activeSubscriptionId found in user data");
      return;
    }

    // Get subscription details
    const subscriptionDoc = await db
      .collection("subscriptions")
      .doc(userData.activeSubscriptionId)
      .get();

    if (!subscriptionDoc.exists) {
      console.log("❌ Subscription document does not exist");
      return;
    }

    const subscriptionData = subscriptionDoc.data();

    // Check if subscription is active and not expired
    const now = new Date();
    const endDate = subscriptionData.endDate?.toDate?.() || new Date();
    const isActive = subscriptionData.status === "active" && endDate > now;

    console.log("📋 Subscription details:", {
      planName: subscriptionData.planName,
      status: subscriptionData.status,
      startDate: subscriptionData.startDate?.toDate?.(),
      endDate: endDate,
      isActive: isActive,
      periodLeft: subscriptionData.periodLeft,
    });

    console.log(
      `\n🎯 Result: hasActiveSubscription = ${isActive ? "TRUE" : "FALSE"}`,
    );

    if (isActive) {
      console.log(
        "✅ Maureen should see the home dashboard WITHOUT membership status",
      );
      console.log("✅ Maureen should see the QR code button");
    } else {
      console.log(
        "❌ Maureen should see membership status and subscription plans",
      );
      console.log("❌ Maureen should NOT see the QR code button");
    }
  } catch (error) {
    console.error("❌ Error testing subscription status:", error);
  }
}

// Run the test
testUserSubscriptionStatus()
  .then(() => {
    console.log("\n✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
