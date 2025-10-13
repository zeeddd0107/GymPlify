import { firebase } from "./firebase";
import {
  createSubscriptionDates as _createSubscriptionDates,
  getRemainingDays,
  isSubscriptionExpired,
} from "@/src/utils/dateUtils";

const firestore = firebase.firestore();

/**
 * Get subscription tier level
 */
const getSubscriptionTier = (planName) => {
  const name = planName.toLowerCase();
  if (name.includes("walkin") || name.includes("walk-in")) return 1; // Lowest
  if (name.includes("monthly")) return 2; // Mid
  if (name.includes("coaching") && name.includes("group")) return 3; // High
  if (name.includes("coaching") && name.includes("solo")) return 4; // Highest
  if (name.includes("coaching")) return 3; // Default coaching to group level
  return 1; // Default to lowest
};

/**
 * Get appropriate warning message based on subscription hierarchy
 */
const getSubscriptionWarningMessage = (
  currentPlan,
  newPlan,
  currentPlanId = null,
  newPlanId = null,
) => {
  const currentTier = getSubscriptionTier(currentPlan);
  const newTier = getSubscriptionTier(newPlan);

  console.log("🔍 Subscription Warning Debug:", {
    currentPlan,
    newPlan,
    currentPlanId,
    newPlanId,
    currentTier,
    newTier,
    currentPlanLower: currentPlan.toLowerCase(),
    newPlanLower: newPlan.toLowerCase(),
    includesWalkin: currentPlan.toLowerCase().includes("walkin"),
    includesWalkIn: currentPlan.toLowerCase().includes("walk-in"),
    includesSolo: currentPlan.toLowerCase().includes("solo"),
    includesCoachingProgram: currentPlan
      .toLowerCase()
      .includes("coaching program"),
    includesMonthly: newPlan.toLowerCase().includes("monthly"),
    currentPlanIncludesMonthly: currentPlan.toLowerCase().includes("monthly"),
    newPlanIncludesWalkin:
      newPlan.toLowerCase().includes("walkin") ||
      newPlan.toLowerCase().includes("walk-in"),
    isCoachingGroupToSolo:
      (currentPlanId === "coaching-group" ||
        (currentPlan.toLowerCase().includes("coaching") &&
          currentPlan.toLowerCase().includes("group"))) &&
      (newPlanId === "coaching-solo" || newPlan.toLowerCase().includes("solo")),
    isSoloToCoachingGroup:
      (currentPlanId === "coaching-solo" ||
        (currentPlan.toLowerCase().includes("coaching") &&
          currentPlan.toLowerCase().includes("solo"))) &&
      (newPlanId === "coaching-group" ||
        (newPlan.toLowerCase().includes("coaching") &&
          newPlan.toLowerCase().includes("group"))),
  });

  // Special case: Walk-in to Walk-in (same tier)
  if (
    (currentPlan.toLowerCase().includes("walkin") ||
      currentPlan.toLowerCase().includes("walk-in")) &&
    (newPlan.toLowerCase().includes("walkin") ||
      newPlan.toLowerCase().includes("walk-in"))
  ) {
    console.log("✅ Matched Walk-in to Walk-in case");
    return {
      title: "Add More Walk-in Days!",
      message:
        "You can add more walk-in days to your current subscription. The new walk-in day will be added to your remaining subscription period. Would you like to continue?",
    };
  }

  // Special case: Walk-in to Monthly (tier 1 to tier 2)
  if (
    (currentPlan.toLowerCase().includes("walkin") ||
      currentPlan.toLowerCase().includes("walk-in")) &&
    newPlan.toLowerCase().includes("monthly")
  ) {
    console.log("✅ Matched Walk-in to Monthly case");
    console.log("📋 Walk-in to Monthly Debug:", {
      currentPlan: currentPlan,
      newPlan: newPlan,
      currentPlanLower: currentPlan.toLowerCase(),
      newPlanLower: newPlan.toLowerCase(),
    });
    return {
      title: "Upgrade to Monthly Subscription!",
      message:
        "Great! You can upgrade your walk-in subscription to monthly. Your remaining walk-in days will be added to the monthly subscription period. Would you like to continue with this upgrade?",
    };
  }

  // Special case: Monthly to Walk-in (tier 2 to tier 1 - not allowed)
  if (
    currentPlan.toLowerCase().includes("monthly") &&
    (newPlan.toLowerCase().includes("walkin") ||
      newPlan.toLowerCase().includes("walk-in"))
  ) {
    console.log("✅ Matched Monthly to Walk-in case - NOT ALLOWED");
    return {
      title: "Cannot Add Walk-in to Monthly Subscription",
      message:
        "You already have an active monthly subscription. Walk-in sessions cannot be added to monthly subscriptions. Please use your monthly subscription to access the gym.",
      isNotAllowed: true, // Flag to indicate this should show a warning, not a modal
    };
  }

  // Special case: Coaching/Solo to Walk-in (tier 3/4 to tier 1 - not allowed)
  if (
    (currentPlan.toLowerCase().includes("coaching") ||
      currentPlan.toLowerCase().includes("solo")) &&
    (newPlan.toLowerCase().includes("walkin") ||
      newPlan.toLowerCase().includes("walk-in"))
  ) {
    console.log("✅ Matched Coaching/Solo to Walk-in case - NOT ALLOWED");
    return {
      title: "Please Wait for Your Coaching Program to End",
      message:
        "You currently have an active coaching program subscription. Please wait until your coaching program ends before purchasing walk-in sessions. You can continue using your coaching program benefits until then.",
      isNotAllowed: true, // Flag to indicate this should show a warning, not a modal
    };
  }

  // Special case: Coaching/Solo to Monthly (tier 3/4 to tier 2 - not allowed)
  if (
    (currentPlan.toLowerCase().includes("coaching") ||
      currentPlan.toLowerCase().includes("solo")) &&
    newPlan.toLowerCase().includes("monthly")
  ) {
    console.log("✅ Matched Coaching/Solo to Monthly case - NOT ALLOWED");
    return {
      title: "Please Wait for Your Coaching Program to End",
      message:
        "You currently have an active coaching program subscription. Please wait until your coaching program ends before purchasing a monthly subscription. You can continue using your coaching program benefits until then.",
      isNotAllowed: true, // Flag to indicate this should show a warning, not a modal
    };
  }

  // Special case: Coaching-Group to Solo (tier 3 to tier 4 - not allowed)
  if (
    (currentPlanId === "coaching-group" ||
      (currentPlan.toLowerCase().includes("coaching") &&
        currentPlan.toLowerCase().includes("group"))) &&
    (newPlanId === "coaching-solo" || newPlan.toLowerCase().includes("solo"))
  ) {
    console.log("✅ Matched Coaching-Group to Solo case - NOT ALLOWED");
    return {
      title: "Please Wait for Your Group Coaching to End",
      message:
        "You currently have an active group coaching program subscription. Please wait until your group coaching program ends before switching to solo coaching. You can continue using your group coaching benefits until then.",
      isNotAllowed: true, // Flag to indicate this should show a warning, not a modal
    };
  }

  // Special case: Solo to Solo (same tier - extension allowed)
  if (
    (currentPlanId === "coaching-solo" ||
      (currentPlan.toLowerCase().includes("coaching") &&
        currentPlan.toLowerCase().includes("solo"))) &&
    (newPlanId === "coaching-solo" || newPlan.toLowerCase().includes("solo"))
  ) {
    console.log("✅ Matched Solo to Solo case - EXTENSION ALLOWED");
    console.log("📋 Solo to Solo Debug:", {
      currentPlan: currentPlan,
      newPlan: newPlan,
      currentPlanId: currentPlanId,
      newPlanId: newPlanId,
    });
    return {
      title: "Extend Solo Coaching Program!",
      message:
        "You can extend your solo coaching program. Your remaining solo coaching sessions will be added to the new solo coaching period. Would you like to continue with this extension?",
    };
  }

  // Special case: Coaching-Group to Coaching-Group (same tier - extension allowed)
  if (
    (currentPlanId === "coaching-group" ||
      (currentPlan.toLowerCase().includes("coaching") &&
        currentPlan.toLowerCase().includes("group"))) &&
    (newPlanId === "coaching-group" ||
      (newPlan.toLowerCase().includes("coaching") &&
        newPlan.toLowerCase().includes("group")))
  ) {
    console.log(
      "✅ Matched Coaching-Group to Coaching-Group case - EXTENSION ALLOWED",
    );
    console.log("📋 Coaching-Group to Coaching-Group Debug:", {
      currentPlan: currentPlan,
      newPlan: newPlan,
      currentPlanId: currentPlanId,
      newPlanId: newPlanId,
    });
    return {
      title: "Extend Group Coaching Program!",
      message:
        "You can extend your group coaching program. Your remaining group coaching period will be added to the new group coaching period. Would you like to continue with this extension?",
    };
  }

  // Special case: Solo to Coaching-Group (tier 4 to tier 3 - not allowed)
  if (
    (currentPlanId === "coaching-solo" ||
      (currentPlan.toLowerCase().includes("coaching") &&
        currentPlan.toLowerCase().includes("solo"))) &&
    (newPlanId === "coaching-group" ||
      (newPlan.toLowerCase().includes("coaching") &&
        newPlan.toLowerCase().includes("group")))
  ) {
    console.log("✅ Matched Solo to Coaching-Group case - NOT ALLOWED");
    return {
      title: "Please Wait for Your Solo Coaching to End",
      message:
        "You currently have an active solo coaching program subscription. Please wait until your solo coaching program ends before switching to group coaching. You can continue using your solo coaching benefits until then.",
      isNotAllowed: true, // Flag to indicate this should show a warning, not a modal
    };
  }

  // Special case: Monthly to Monthly (same tier)
  if (
    currentPlan.toLowerCase().includes("monthly") &&
    newPlan.toLowerCase().includes("monthly")
  ) {
    console.log("✅ Matched Monthly to Monthly case");
    console.log("📋 Monthly to Monthly Debug:", {
      currentPlan: currentPlan,
      newPlan: newPlan,
      currentPlanLower: currentPlan.toLowerCase(),
      newPlanLower: newPlan.toLowerCase(),
    });
    return {
      title: "Extend Monthly Subscription!",
      message:
        "You can extend your monthly subscription. The new monthly period will be added to your current subscription. Would you like to continue?",
    };
  }

  // Special case: Monthly to Coaching/Solo (tier 2 to tier 3/4) - UPGRADE ALLOWED
  if (
    currentPlan.toLowerCase().includes("monthly") &&
    (newPlan.toLowerCase().includes("coaching") ||
      newPlan.toLowerCase().includes("solo"))
  ) {
    console.log("✅ Matched Monthly to Coaching/Solo case - UPGRADE ALLOWED");
    return {
      title: "Upgrade to Coaching Program!",
      message:
        "Great! You can upgrade your monthly subscription to a coaching program. This will replace your current monthly subscription and give you access to personal coaching sessions. Would you like to continue with this upgrade?",
    };
  }

  // Special case: Walk-in to Coaching/Solo (tier 1 to tier 3/4) - UPGRADE ALLOWED
  if (
    (currentPlan.toLowerCase().includes("walkin") ||
      currentPlan.toLowerCase().includes("walk-in")) &&
    (newPlan.toLowerCase().includes("coaching") ||
      newPlan.toLowerCase().includes("solo"))
  ) {
    console.log("✅ Matched Walk-in to Coaching/Solo case - UPGRADE ALLOWED");
    return {
      title: "Upgrade to Coaching Program!",
      message:
        "Great! You can upgrade your walk-in session to a coaching program. This will replace your current walk-in session and give you access to personal coaching sessions. Would you like to continue with this upgrade?",
    };
  }

  // Special case: Solo to Monthly (tier 4 to tier 2 - downgrade)
  // Check for "Coaching Program" which is the Solo plan name
  if (
    currentPlan.toLowerCase().includes("coaching program") &&
    newPlan.toLowerCase().includes("monthly")
  ) {
    console.log("✅ Matched Solo to Monthly case");
    return {
      title: "You already have an active subscription!",
      message:
        "Don't worry — if you purchase another subscription, it will start right after your current subscription ends. Would you like to continue?",
    };
  }

  // Same tier or downgrade - start after current ends
  if (newTier <= currentTier) {
    console.log("✅ Matched Same tier or downgrade case");
    return {
      title: "You already have an active subscription!",
      message:
        "Don't worry — if you purchase another subscription, it will start right after your current subscription ends. Would you like to continue?",
    };
  }

  // Upgrade - can start now or next month
  console.log("✅ Matched Upgrade case");
  return {
    title: "You already have an active subscription!",
    message:
      "Would you like this subscription to start now or next month? Starting now will replace your current subscription.",
  };
};

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
  bypassSubscriptionCheck = false,
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

    // Get plan data first
    const planData = await getSubscriptionPlan(planId);

    // Check if user already has an active subscription (unless bypassed)
    if (!bypassSubscriptionCheck && userDoc.exists) {
      const userData = userDoc.data();

      // If user has an activeSubscriptionId, check if it's still active
      if (userData.activeSubscriptionId) {
        const activeSubscriptionRef = firestore
          .collection("subscriptions")
          .doc(userData.activeSubscriptionId);
        const activeSubscriptionDoc = await activeSubscriptionRef.get();

        if (activeSubscriptionDoc.exists) {
          const activeSubscriptionData = activeSubscriptionDoc.data();

          // Check if the active subscription is still valid (not expired)
          const now = new Date();
          const endDate =
            activeSubscriptionData.endDate?.toDate?.() || new Date();

          if (endDate > now) {
            // User already has an active subscription
            const currentPlan = activeSubscriptionData.planName || "Unknown";
            const newPlan = planData.name || "Unknown";

            console.log("🔍 Active Subscription Debug:", {
              activeSubscriptionId: userData.activeSubscriptionId,
              currentPlan: currentPlan,
              newPlan: newPlan,
              activeSubscriptionData: {
                planName: activeSubscriptionData.planName,
                status: activeSubscriptionData.status,
                startDate: activeSubscriptionData.startDate,
                endDate: activeSubscriptionData.endDate,
              },
            });

            // Note: Walk-in to Walk-in will go through normal warning modal flow
            // The actual extension will happen when user confirms in the modal

            const warningMessage = getSubscriptionWarningMessage(
              currentPlan,
              newPlan,
              activeSubscriptionData.planId,
              planData.id,
            );

            return {
              success: false,
              hasActiveSubscription: true,
              currentPlan: currentPlan,
              newPlan: newPlan,
              title: warningMessage.title,
              message: warningMessage.message,
              isNotAllowed: warningMessage.isNotAllowed || false, // Pass through the isNotAllowed flag
            };
          }
        }
      }
    }
    console.log("📝 SubscriptionService: Plan data retrieved:", {
      planId: planData.id,
      name: planData.name,
      price: planData.price,
      period: planData.period,
    });

    // Note: All subscription requests (including Walk-in to Walk-in) go to admin for approval
    // The extension logic will be handled by the admin when they approve the request

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
    return {
      success: true,
      subscriptionId: docRef.id,
      message: "Subscription request created successfully",
    };
  } catch (error) {
    console.error("Error creating pending subscription:", error);
    throw error;
  }
};

/**
 * Get user's active subscription
 */
export const getUserActiveSubscription = async (
  userId,
  forceRefresh = false,
) => {
  try {
    // Force fresh data by using source: 'server' if forceRefresh is true
    const userDoc = await firestore
      .collection("users")
      .doc(userId)
      .get(forceRefresh ? { source: "server" } : undefined);
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
      .get(forceRefresh ? { source: "server" } : undefined);

    if (!subscriptionDoc.exists) {
      return null;
    }

    const subscriptionData = subscriptionDoc.data();

    // Add calculated fields using date utilities
    const subscription = {
      id: subscriptionDoc.id,
      ...subscriptionData,
      remainingDays: getRemainingDays(subscriptionData),
      isExpired: isSubscriptionExpired(subscriptionData),
    };

    return subscription;
  } catch (error) {
    // Handle permission errors gracefully - return null instead of throwing
    // This allows the app to continue functioning when users don't have subscription access
    if (
      error.code === "permission-denied" ||
      error.message?.includes("permissions")
    ) {
      console.log("Permission denied for subscription access, returning null");
      return null;
    }

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

/**
 * Extend a Walk-in subscription by adding the period left from current + new Walk-in
 */
const _extendWalkinSubscription = async (userId, subscriptionId) => {
  try {
    console.log(
      "📝 SubscriptionService: Extending Walk-in subscription:",
      subscriptionId,
    );

    // Get the current subscription
    const subscriptionRef = firestore
      .collection("subscriptions")
      .doc(subscriptionId);
    const subscriptionDoc = await subscriptionRef.get();

    if (!subscriptionDoc.exists) {
      throw new Error("Subscription not found");
    }

    const subscriptionData = subscriptionDoc.data();
    const currentEndDate = subscriptionData.endDate?.toDate?.() || new Date();
    const now = new Date();

    // Calculate remaining time from current Walk-in
    const currentRemainingTime = Math.max(
      0,
      currentEndDate.getTime() - now.getTime(),
    );

    // Calculate period left for new Walk-in (1 day = 24 hours)
    const newWalkinPeriod = 24 * 60 * 60 * 1000; // 1 day in milliseconds

    // Total extension time = current remaining + new Walk-in period
    const totalExtensionTime = currentRemainingTime + newWalkinPeriod;

    // Calculate new end date
    const newEndDate = new Date(now.getTime() + totalExtensionTime);

    // Create extension record with proper timestamps
    const extensionRecord = {
      extendedAt: new Date(),
      previousEndDate: subscriptionData.endDate,
      newEndDate: firebase.firestore.Timestamp.fromDate(newEndDate),
      reason: "Additional Walk-in session purchased",
      currentRemainingDays: Math.ceil(
        currentRemainingTime / (24 * 60 * 60 * 1000),
      ),
      newWalkinDays: 1,
      totalExtensionDays: Math.ceil(totalExtensionTime / (24 * 60 * 60 * 1000)),
    };

    // Update the subscription with the new end date
    await subscriptionRef.update({
      endDate: firebase.firestore.Timestamp.fromDate(newEndDate),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      // Add a note about the extension
      extensions: firebase.firestore.FieldValue.arrayUnion(extensionRecord),
    });

    const totalDays = Math.ceil(totalExtensionTime / (24 * 60 * 60 * 1000));
    console.log("✅ Walk-in subscription extended successfully");

    return {
      success: true,
      message: `Walk-in subscription extended by ${totalDays} day${totalDays > 1 ? "s" : ""}`,
      newEndDate: newEndDate,
      subscriptionId: subscriptionId,
      totalDays: totalDays,
    };
  } catch (error) {
    console.error("Error extending Walk-in subscription:", error);
    throw error;
  }
};

/**
 * Get user's subscription history
 */
export const getUserSubscriptionHistory = async (userId) => {
  try {
    // Get user document to retrieve subscription history
    const userDoc = await firestore.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return [];
    }

    const userData = userDoc.data();
    const subscriptionHistory = userData.subscriptionHistory || [];

    if (subscriptionHistory.length === 0) {
      return [];
    }

    // Fetch all subscription documents from history
    const subscriptionPromises = subscriptionHistory.map((subscriptionId) =>
      firestore.collection("subscriptions").doc(subscriptionId).get(),
    );

    const subscriptionDocs = await Promise.all(subscriptionPromises);

    // Filter out non-existent subscriptions and format data
    const history = subscriptionDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate?.() || new Date(),
        endDate: doc.data().endDate?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        remainingDays: getRemainingDays(doc.data()),
        isExpired: isSubscriptionExpired(doc.data()),
      }))
      .sort((a, b) => b.startDate - a.startDate); // Sort by start date, newest first

    console.log("📚 Retrieved subscription history:", {
      userId,
      historyCount: history.length,
      subscriptionIds: subscriptionHistory,
    });

    return history;
  } catch (error) {
    console.error("Error fetching user subscription history:", error);
    throw error;
  }
};
