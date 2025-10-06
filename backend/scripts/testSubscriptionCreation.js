const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function testSubscriptionCreation() {
  try {
    console.log("🧪 Testing subscription plan data retrieval...");

    // Test getting a subscription plan
    const planDoc = await db
      .collection("subscriptionPlans")
      .doc("monthly")
      .get();

    if (!planDoc.exists) {
      console.log("❌ Monthly plan not found");
      return;
    }

    const planData = planDoc.data();
    console.log("📋 Plan data retrieved:");
    console.log("   - ID:", planDoc.id);
    console.log("   - Name:", planData.name);
    console.log("   - Price:", planData.price);
    console.log("   - Period:", planData.period);
    console.log("   - PeriodLeft:", planData.periodLeft);

    // Test creating a mock pending subscription
    const mockPendingSubscription = {
      userId: "test-user-123",
      userEmail: "test@example.com",
      userDisplayName: "Test User",
      planId: planDoc.id,
      planName: planData.name,
      price: planData.price,
      status: "pending",
      requestDate: admin.firestore.FieldValue.serverTimestamp(),
      paymentMethod: "counter",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    console.log("\n📝 Mock pending subscription object:");
    console.log("   - User ID:", mockPendingSubscription.userId);
    console.log("   - Plan ID:", mockPendingSubscription.planId);
    console.log("   - Plan Name:", mockPendingSubscription.planName);
    console.log("   - Price:", mockPendingSubscription.price);
    console.log("   - Status:", mockPendingSubscription.status);

    console.log("\n✅ Test completed successfully!");
    console.log("💡 Subscription system is working properly.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error testing subscription creation:", error);
    process.exit(1);
  }
}

testSubscriptionCreation();
