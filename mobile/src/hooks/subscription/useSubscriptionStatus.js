import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { firebase } from "@/src/services/firebase";
import { useAuth } from "@/src/context";

/**
 * Hook to monitor subscription status and handle redirects
 */
export const useSubscriptionStatus = () => {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // console.log("🔍 useSubscriptionStatus hook - User:", user?.uid);
    // console.log("🔍 useSubscriptionStatus hook - hasActiveSubscription state:", hasActiveSubscription);

    if (!user) {
      // console.log("❌ No user found, setting hasActiveSubscription to false");
      setHasActiveSubscription(false);
      setLoading(false);
      return;
    }

    const checkSubscriptionStatus = async () => {
      try {
        setLoading(true);

        // Get user document
        // console.log("🔍 Checking user document for:", user.uid);
        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .get();

        if (!userDoc.exists) {
          // console.log("❌ User document does not exist");
          setHasActiveSubscription(false);
          setSubscription(null);
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        // console.log("🔍 User data:", userData);

        if (!userData.activeSubscriptionId) {
          // console.log("❌ No activeSubscriptionId found in user data");
          setHasActiveSubscription(false);
          setSubscription(null);
          setLoading(false);
          return;
        }

        // Get subscription details
        const subscriptionDoc = await firebase
          .firestore()
          .collection("subscriptions")
          .doc(userData.activeSubscriptionId)
          .get();

        if (!subscriptionDoc.exists) {
          setHasActiveSubscription(false);
          setSubscription(null);
          setLoading(false);
          return;
        }

        const subscriptionData = subscriptionDoc.data();

        // Check if subscription is active and not expired
        const now = new Date();
        const endDate = subscriptionData.endDate?.toDate?.() || new Date();
        const isActive = subscriptionData.status === "active" && endDate > now;

        console.log("🔍 Subscription Status Debug:");
        console.log("  - User ID:", user.uid);
        console.log(
          "  - Active Subscription ID:",
          userData.activeSubscriptionId,
        );
        console.log("  - Subscription Status:", subscriptionData.status);
        console.log("  - End Date:", endDate);
        console.log("  - Current Date:", now);
        console.log("  - Is Active:", isActive);
        console.log("  - Status Check:", subscriptionData.status === "active");
        console.log("  - Date Check:", endDate > now);

        setHasActiveSubscription(isActive);
        setSubscription(subscriptionData);
        setLoading(false);

        // If user has active subscription, redirect to dashboard
        if (isActive) {
          console.log(
            "✅ User has active subscription, redirecting to dashboard",
          );
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
        setLoading(false);
      }
    };

    checkSubscriptionStatus();

    // Set up real-time listener for subscription changes
    const unsubscribe = firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .onSnapshot(async (userDoc) => {
        if (userDoc.exists) {
          const userData = userDoc.data();

          if (userData.activeSubscriptionId) {
            // Get subscription details
            const subscriptionDoc = await firebase
              .firestore()
              .collection("subscriptions")
              .doc(userData.activeSubscriptionId)
              .get();

            if (subscriptionDoc.exists) {
              const subscriptionData = subscriptionDoc.data();

              // Check if subscription is active and not expired
              const now = new Date();
              const endDate =
                subscriptionData.endDate?.toDate?.() || new Date();
              const isActive =
                subscriptionData.status === "active" && endDate > now;

              setHasActiveSubscription(isActive);
              setSubscription(subscriptionData);

              // If user just got an active subscription, redirect to dashboard
              if (isActive && !hasActiveSubscription) {
                console.log(
                  "🎉 Subscription approved! Redirecting to dashboard",
                );
                router.replace("/(tabs)");
              }
            }
          } else {
            setHasActiveSubscription(false);
            setSubscription(null);
          }
        } else {
          setHasActiveSubscription(false);
          setSubscription(null);
        }
      });

    return () => unsubscribe();
  }, [user, router, hasActiveSubscription]);

  return {
    hasActiveSubscription,
    subscription,
    loading,
  };
};
