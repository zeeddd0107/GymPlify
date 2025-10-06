const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json");

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const subscriptionPlans = [
  {
    id: "walkin",
    name: "Walk-in Session",
    price: "₱100",
    period: "per session",
    periodLeft: 1, // 1 session for walkin
    description: "Pay as you go",
    features: [
      "Single gym session",
      "Basic equipment access",
      "Locker room access",
      "Water station access",
    ],
    popular: false,
    color: "#4361EE", // Blue
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    price: "₱850",
    period: "per month",
    periodLeft: 31, // 31 days for monthly plan
    description: "Best value for regular gym-goers",
    features: [
      "Unlimited gym access",
      "All equipment included",
      "Locker room access",
      "Water station access",
      "Mobile app features",
      "Progress tracking",
    ],
    popular: true,
    color: "#8b5cf6", // Purple
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: "coaching-group",
    name: "Coaching Program",
    price: "₱2,500",
    period: "per month",
    periodLeft: 30, // 30 days for coaching group
    description: "Group coaching - unlimited sessions",
    features: [
      "Everything in Monthly",
      "Personal coaching sessions",
      "Group training classes",
      "Nutrition guidance",
      "Workout plans",
      "Progress monitoring",
      "Unlimited sessions",
    ],
    popular: false,
    color: "#f59e0b", // Orange
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: "coaching-solo",
    name: "Coaching Program",
    price: "₱2,500",
    period: "per month",
    periodLeft: 10, // 10 sessions for solo coaching
    description: "Solo coaching - 10 sessions limit",
    features: [
      "Everything in Monthly",
      "Personal coaching sessions",
      "One-on-one training",
      "Nutrition guidance",
      "Custom workout plans",
      "Progress monitoring",
      "10 sessions per month",
    ],
    popular: false,
    color: "#10b981", // Green
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

async function setupSubscriptionPlansWithPeriodLeft() {
  try {
    console.log(
      "🚀 Setting up subscriptionPlans collection with periodLeft field...",
    );

    // Check if collection already exists
    const collectionRef = db.collection("subscriptionPlans");
    const snapshot = await collectionRef.limit(1).get();

    if (!snapshot.empty) {
      console.log(
        "⚠️  subscriptionPlans collection already exists. Updating with periodLeft field...",
      );

      // Update existing plans with periodLeft field
      for (const plan of subscriptionPlans) {
        const planRef = collectionRef.doc(plan.id);
        const planDoc = await planRef.get();

        if (planDoc.exists) {
          await planRef.update({
            periodLeft: plan.periodLeft,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(
            `✅ Updated ${plan.name} with periodLeft = ${plan.periodLeft}`,
          );
        } else {
          await planRef.set(plan);
          console.log(
            `✅ Created ${plan.name} with periodLeft = ${plan.periodLeft}`,
          );
        }
      }
    } else {
      console.log("📝 Creating new subscriptionPlans collection...");

      for (const plan of subscriptionPlans) {
        await collectionRef.doc(plan.id).set(plan);
        console.log(
          `✅ Created plan: ${plan.name} (periodLeft = ${plan.periodLeft})`,
        );
      }
    }

    console.log("\n🎉 subscriptionPlans collection setup complete!");
    console.log("📋 PeriodLeft values:");
    console.log("   - Walk-in Session: periodLeft = 1 (session)");
    console.log("   - Solo Coaching: periodLeft = 10 (sessions)");
    console.log("   - Monthly Plan: periodLeft = 31 (days)");
    console.log("   - Coaching Group: periodLeft = 30 (days)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up subscriptionPlans collection:", error);
    process.exit(1);
  }
}

setupSubscriptionPlansWithPeriodLeft();
