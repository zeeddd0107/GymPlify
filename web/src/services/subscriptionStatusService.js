import { onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { getSubscriptionStatus } from "@/components/utils";

/**
 * Subscribe to user's subscription status changes
 * This can be used to notify mobile users when their subscription is approved
 */
export const subscribeToUserSubscriptionStatus = (userId, callback) => {
  try {
    // Listen to user document changes
    const userRef = doc(db, "users", userId);

    return onSnapshot(userRef, async (userDoc) => {
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check if user has an active subscription
        if (userData.activeSubscriptionId) {
          // Get the subscription details
          const subscriptionRef = doc(
            db,
            "subscriptions",
            userData.activeSubscriptionId,
          );
          const subscriptionDoc = await getDoc(subscriptionRef);

          if (subscriptionDoc.exists()) {
            const subscriptionData = subscriptionDoc.data();

            // Check if subscription is active using the utility function
            const actualStatus = getSubscriptionStatus(subscriptionData);
            const isActive = actualStatus === "active";

            // If subscription is expired but user still has activeSubscriptionId, update user document
            if (!isActive && userData.activeSubscriptionId) {
              // Update user document to move activeSubscriptionId to lastSubscriptionId
              const userRef = doc(db, "users", userId);
              updateDoc(userRef, {
                subscriptionStatus: actualStatus,
                lastSubscriptionId: userData.activeSubscriptionId,
                activeSubscriptionId: null,
                updatedAt: new Date(),
              }).catch((error) => {
                console.error(
                  "Error updating user subscription status:",
                  error,
                );
              });
            }

            callback({
              hasActiveSubscription: isActive,
              subscription: subscriptionData,
              subscriptionId: isActive ? userData.activeSubscriptionId : null,
            });
          } else {
            callback({
              hasActiveSubscription: false,
              subscription: null,
              subscriptionId: null,
            });
          }
        } else {
          callback({
            hasActiveSubscription: false,
            subscription: null,
            subscriptionId: null,
          });
        }
      } else {
        callback({
          hasActiveSubscription: false,
          subscription: null,
          subscriptionId: null,
        });
      }
    });
  } catch (error) {
    console.error("Error subscribing to user subscription status:", error);
    throw error;
  }
};

/**
 * Get user's current subscription status
 */
export const getUserSubscriptionStatus = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return {
        hasActiveSubscription: false,
        subscription: null,
        subscriptionId: null,
      };
    }

    const userData = userDoc.data();

    if (!userData.activeSubscriptionId) {
      return {
        hasActiveSubscription: false,
        subscription: null,
        subscriptionId: null,
      };
    }

    // Get the subscription details
    const subscriptionRef = doc(
      db,
      "subscriptions",
      userData.activeSubscriptionId,
    );
    const subscriptionDoc = await getDoc(subscriptionRef);

    if (!subscriptionDoc.exists()) {
      return {
        hasActiveSubscription: false,
        subscription: null,
        subscriptionId: null,
      };
    }

    const subscriptionData = subscriptionDoc.data();

    // Check if subscription is active using the utility function
    const actualStatus = getSubscriptionStatus(subscriptionData);
    const isActive = actualStatus === "active";

    // If subscription is expired but user still has activeSubscriptionId, update user document
    if (!isActive && userData.activeSubscriptionId) {
      // Update user document to move activeSubscriptionId to lastSubscriptionId
      const userRef = doc(db, "users", userId);
      updateDoc(userRef, {
        subscriptionStatus: actualStatus,
        lastSubscriptionId: userData.activeSubscriptionId,
        activeSubscriptionId: null,
        updatedAt: new Date(),
      }).catch((error) => {
        console.error("Error updating user subscription status:", error);
      });
    }

    return {
      hasActiveSubscription: isActive,
      subscription: subscriptionData,
      subscriptionId: isActive ? userData.activeSubscriptionId : null,
    };
  } catch (error) {
    console.error("Error getting user subscription status:", error);
    throw error;
  }
};

/**
 * Check if user should be redirected to dashboard
 * (i.e., they have an active subscription and should not see subscription plans)
 */
export const shouldRedirectToDashboard = async (userId) => {
  try {
    const status = await getUserSubscriptionStatus(userId);
    return status.hasActiveSubscription;
  } catch (error) {
    console.error("Error checking redirect status:", error);
    return false;
  }
};
