import { firebase } from "./firebase";

const firestore = firebase.firestore();

/**
 * Get all available subscription plans
 */
export const getSubscriptionPlans = async () => {
  try {
    const snapshot = await firestore
      .collection("subscriptionPlans")
      .where("isActive", "==", true)
      .orderBy("price", "asc")
      .get();

    const plans = [];
    snapshot.forEach((doc) => {
      plans.push({ id: doc.id, ...doc.data() });
    });

    return plans;
  } catch (error) {
    console.error("Error fetching subscription plans:", error);
    throw error;
  }
};

/**
 * Get a specific subscription plan by ID
 */
export const getSubscriptionPlan = async (planId) => {
  try {
    const doc = await firestore
      .collection("subscriptionPlans")
      .doc(planId)
      .get();

    if (!doc.exists) {
      throw new Error("Subscription plan not found");
    }

    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("Error fetching subscription plan:", error);
    throw error;
  }
};

/**
 * Create a pending subscription request
 */
export const createPendingSubscription = async (
  userId,
  planId,
  paymentMethod = "counter",
  userContext = null,
) => {
  try {
    console.log(
      "📝 SubscriptionService: Creating pending subscription for user:",
      userId,
    );
    console.log(
      "📝 SubscriptionService: User context provided:",
      !!userContext,
    );

    // Validate userId
    if (!userId || userId === "undefined") {
      throw new Error("Invalid user ID provided");
    }

    // Get user data
    const userDoc = await firestore.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      console.log(
        "📝 SubscriptionService: User document not found, creating it...",
      );

      // Use user context data if available, otherwise try Firebase
      let userData;
      if (userContext) {
        console.log("📝 SubscriptionService: Using user context data");
        userData = {
          email: userContext.email,
          displayName: userContext.name || userContext.displayName,
          name: userContext.name || userContext.displayName,
          photoURL: userContext.picture || userContext.photoURL,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
      } else {
        // Fallback to Firebase Auth
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
          throw new Error(
            "No authenticated user found and no user context provided",
          );
        }
        console.log("📝 SubscriptionService: Using Firebase auth data");
        userData = {
          email: currentUser.email,
          displayName: currentUser.displayName,
          name: currentUser.displayName,
          photoURL: currentUser.photoURL,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
      }

      await firestore.collection("users").doc(userId).set(userData);
      console.log("📝 SubscriptionService: User document created successfully");
    } else {
      console.log("📝 SubscriptionService: User document found");
    }

    // Get user data for subscription creation
    const finalUserData = userDoc.exists
      ? userDoc.data()
      : userContext
        ? {
            email: userContext.email,
            displayName: userContext.name || userContext.displayName,
            name: userContext.name || userContext.displayName,
          }
        : {
            email: firebase.auth().currentUser?.email,
            displayName: firebase.auth().currentUser?.displayName,
            name: firebase.auth().currentUser?.displayName,
          };

    // Get plan data
    const planData = await getSubscriptionPlan(planId);
    console.log("📝 SubscriptionService: Plan data retrieved:", {
      planId: planData.id,
      name: planData.name,
      price: planData.price,
      period: planData.period,
    });

    // Create pending subscription request
    const pendingSubscription = {
      userId: userId, // Ensure userId is not undefined
      userEmail: finalUserData.email || "unknown@example.com",
      userDisplayName:
        finalUserData.displayName || finalUserData.name || "Unknown User",
      planId: planId,
      planName: planData.name,
      price: planData.price,
      status: "pending",
      requestDate: firebase.firestore.FieldValue.serverTimestamp(),
      paymentMethod: paymentMethod,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };

    console.log("📝 SubscriptionService: Pending subscription object:", {
      userId: pendingSubscription.userId,
      userEmail: pendingSubscription.userEmail,
      planId: pendingSubscription.planId,
      planName: pendingSubscription.planName,
      price: pendingSubscription.price,
      status: pendingSubscription.status,
      paymentMethod: pendingSubscription.paymentMethod,
    });

    const docRef = await firestore
      .collection("pendingSubscriptions")
      .add(pendingSubscription);

    console.log("✅ Pending subscription created:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating pending subscription:", error);
    throw error;
  }
};

/**
 * Get user's active subscription
 */
export const getUserActiveSubscription = async (userId) => {
  try {
    const userDoc = await firestore.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    if (!userData.activeSubscriptionId) {
      return null;
    }

    const subscriptionDoc = await firestore
      .collection("subscriptions")
      .doc(userData.activeSubscriptionId)
      .get();

    if (!subscriptionDoc.exists) {
      return null;
    }

    return { id: subscriptionDoc.id, ...subscriptionDoc.data() };
  } catch (error) {
    console.error("Error fetching user active subscription:", error);
    throw error;
  }
};

/**
 * Check if user has active subscription
 */
export const hasActiveSubscription = async (userId) => {
  try {
    const subscription = await getUserActiveSubscription(userId);
    return subscription && subscription.status === "active";
  } catch (error) {
    console.error("Error checking active subscription:", error);
    return false;
  }
};
