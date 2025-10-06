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
    price: 100,
    period: "session",
    description: "Pay as you go",
    features: [
      "Single gym session",
      "Basic equipment access",
      "Locker room access",
      "Water station access",
    ],
    maxSessions: 1,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    price: 850,
    period: "month",
    description: "Best value for regular gym-goers",
    features: [
      "Unlimited gym access",
      "All equipment included",
      "Locker room access",
      "Water station access",
      "Mobile app features",
      "Progress tracking",
    ],
    maxSessions: null, // unlimited
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: "coaching-group",
    name: "Coaching Program",
    price: 2500,
    period: "month",
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
    maxSessions: null, // unlimited
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
  {
    id: "coaching-solo",
    name: "Coaching Program",
    price: 2500,
    period: "month",
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
    maxSessions: 10,
    isActive: true,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  },
];

async function setupSubscriptionPlans() {
  try {
    console.log("Setting up subscription plans...");

    for (const plan of subscriptionPlans) {
      await db.collection("subscriptionPlans").doc(plan.id).set(plan);
      console.log(`✅ Created plan: ${plan.name}`);
    }

    console.log("🎉 All subscription plans created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting up subscription plans:", error);
    process.exit(1);
  }
}

setupSubscriptionPlans();
