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
    name: "Walk-in",
    price: "₱100",
    period: "per session",
    daysRemaining: 1,
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
    // No daysRemaining - calculated dynamically as exactly one calendar month
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
    name: "Coaching Program - Group",
    price: "₱2,500",
    period: "per month",
    // No daysRemaining - calculated dynamically as exactly one calendar month
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
    name: "Coaching Program - Solo",
    price: "₱2,500",
    period: "per month",
    // No daysRemaining - calculated dynamically as exactly one calendar month
    maxSessions: 10, // 10 sessions limit for solo coaching
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

        // Use set with merge to handle both existing and new documents
        const planData = {
          ...plan,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await planRef.set(planData, { merge: true });
        console.log(
          `✅ ${planDoc.exists ? "Updated" : "Created"} ${plan.name} - daysRemaining: ${plan.daysRemaining || "N/A"}, maxSessions: ${plan.maxSessions || "N/A"}`,
        );
      }
    } else {
      console.log(" Creating new subscriptionPlans collection...");

      for (const plan of subscriptionPlans) {
        await collectionRef.doc(plan.id).set(plan);
        console.log(
          `✅ Created plan: ${plan.name} - using date-based calculations`,
        );
      }
    }

    console.log("\n subscriptionPlans collection setup complete!");
    console.log(" Plan configurations:");
    console.log("   - Walk-in: 1 day, no session limits");
    console.log("   - Solo Coaching: Exactly one calendar month, 10 sessions");
    console.log(
      "   - Monthly Plan: Exactly one calendar month, unlimited sessions",
    );
    console.log(
      "   - Coaching Group: Exactly one calendar month, unlimited sessions",
    );
    console.log(
      "   - All monthly plans use exact calendar month calculations for accurate durations",
    );

    process.exit(0);
  } catch (error) {
    console.error(" Error setting up subscriptionPlans collection:", error);
    process.exit(1);
  }
}

setupSubscriptionPlansWithPeriodLeft();
