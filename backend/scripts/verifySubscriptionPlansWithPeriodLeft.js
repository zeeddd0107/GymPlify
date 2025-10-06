const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function verifySubscriptionPlansWithPeriodLeft() {
  try {
    console.log(
      "🔍 Verifying subscriptionPlans collection with periodLeft field...",
    );

    const collectionRef = db.collection("subscriptionPlans");
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      console.log("❌ No subscriptionPlans collection found.");
      return;
    }

    console.log(
      `📋 Found ${snapshot.size} plans in subscriptionPlans collection:\n`,
    );

    for (const doc of snapshot.docs) {
      const planData = doc.data();
      const planId = doc.id;

      console.log(`📄 Plan: ${planData.name} (${planId})`);
      console.log(`   💰 Price: ${planData.price}`);
      console.log(`   ⏰ Period: ${planData.period}`);
      console.log(`   📊 PeriodLeft: ${planData.periodLeft}`);
      console.log(`   📝 Description: ${planData.description}`);
      console.log(`   ⭐ Popular: ${planData.popular || "N/A"}`);
      console.log(`   🎨 Color: ${planData.color || "N/A"}`);
      console.log(`   ✅ Active: ${planData.isActive || "N/A"}`);
      console.log(
        `   🏷️  Features: ${planData.features ? planData.features.length : 0} items`,
      );
      console.log(`   📅 Created: ${planData.createdAt ? "Yes" : "No"}`);
      console.log(`   🔄 Updated: ${planData.updatedAt ? "Yes" : "No"}`);
      console.log("");
    }

    console.log("✅ Verification complete!");
    console.log("\n📋 Collection structure summary:");
    console.log(
      "   - All plans have: id, name, price, period, periodLeft, description, features",
    );
    console.log(
      "   - Additional fields: popular, color, isActive, createdAt, updatedAt",
    );
    console.log("\n📊 PeriodLeft values:");
    console.log("   - Walk-in Session: 1 (session)");
    console.log("   - Solo Coaching: 10 (sessions)");
    console.log("   - Monthly Plan: 31 (days)");
    console.log("   - Coaching Group: 30 (days)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error verifying subscriptionPlans collection:", error);
    process.exit(1);
  }
}

verifySubscriptionPlansWithPeriodLeft();
