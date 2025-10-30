import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { firebase } from "@/src/services/firebase";
import { useAuth } from "@/src/context";

/**
 * Hook to monitor subscription status
 * Returns subscription state without redirecting users with expired subscriptions
 */
export const useSubscriptionStatus = () => {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false); // Has subscription (active or expired)
  const [isExpired, setIsExpired] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      setHasActiveSubscription(false);
      setHasSubscription(false);
      setIsExpired(false);
      setSubscription(null);
      setLoading(false);
      return;
    }

    const checkSubscriptionStatus = async () => {
      try {
        setLoading(true);

        // Get user document
        const userDoc = await firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .get();

        if (!userDoc.exists) {
          setHasActiveSubscription(false);
          setHasSubscription(false);
          setIsExpired(false);
          setSubscription(null);
          setLoading(false);
          return;
        }

        const userData = userDoc.data();

        if (!userData.activeSubscriptionId) {
          setHasActiveSubscription(false);
          setHasSubscription(false);
          setIsExpired(false);
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
          setHasSubscription(false);
          setIsExpired(false);
          setSubscription(null);
          setLoading(false);
          return;
        }

        const subscriptionData = subscriptionDoc.data();

        // Check if subscription is active and not expired
        const now = new Date();
        const endDate = subscriptionData.endDate?.toDate?.() || new Date();
        const isActive = subscriptionData.status === "active" && endDate > now;
        const isExpiredStatus = subscriptionData.status === "expired" || endDate < now;

        setHasActiveSubscription(isActive);
        setHasSubscription(true); // User has a subscription (active or expired)
        setIsExpired(isExpiredStatus);
        setSubscription(subscriptionData);
        setLoading(false);

        // Only redirect if user just got an active subscription (not if they have expired one)
        // This allows users with expired subscriptions to stay on dashboard
        if (isActive) {
          console.log("User has active subscription");
          // Don't redirect here - let the app handle navigation naturally
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
              const isExpiredStatus = subscriptionData.status === "expired" || endDate < now;

              setHasActiveSubscription(isActive);
              setHasSubscription(true);
              setIsExpired(isExpiredStatus);
              setSubscription(subscriptionData);

              // Only redirect if user just got an active subscription
              if (isActive) {
                console.log("Subscription approved! User can access full features");
                // Don't force redirect - let app handle navigation
              }
            }
          } else {
            setHasActiveSubscription(false);
            setHasSubscription(false);
            setIsExpired(false);
            setSubscription(null);
          }
        } else {
          setHasActiveSubscription(false);
          setHasSubscription(false);
          setIsExpired(false);
          setSubscription(null);
        }
      });

    return () => unsubscribe();
  }, [user, router]);

  return {
    hasActiveSubscription,
    hasSubscription, // New: indicates user has any subscription (active or expired)
    isExpired, // New: indicates subscription is expired
    subscription,
    loading,
  };
};
