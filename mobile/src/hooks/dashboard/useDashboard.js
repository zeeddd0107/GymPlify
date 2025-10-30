import React, { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { firestore } from "@/src/services/firebase";
import { useMembership } from "./useMembership";
import { useAttendance } from "./useAttendance";
import { useUpcomingSessions } from "./useUpcomingSessions";
import { useWorkoutTip } from "./useWorkoutTip";
import { useUserData } from "../user/useUserData";
import { useNotifications } from "../notifications/useNotifications";
// import { hasActiveSubscription } from "@/src/services/subscriptionService";
// import { useSubscriptionStatus } from "../subscription/useSubscriptionStatus";
import { useAuth } from "@/src/context";

export const useDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { user: authUser, loading: authLoading } = useAuth();

  const {
    membershipData,
    subscriptions,
    fetchMembershipDataHook,
    handleRenewMembership,
    getMembershipStatusColor,
    getDaysLeftFromSubscriptions,
  } = useMembership();

  const { attendanceData, fetchAttendanceDataHook, getProgressPercentage } =
    useAttendance();

  const { upcomingSessions, fetchUpcomingSessionsHook } = useUpcomingSessions();

  const { workoutTip, fetchWorkoutTipHook } = useWorkoutTip();

  const {
    email,
    userData,
    activeSubscriptionId,
    isUserDataLoading,
    fetchUserData,
    getGreeting,
  } = useUserData();

  const { notifications, unreadCount } = useNotifications();

  const fetchDashboardData = useCallback(async () => {
    try {
      // console.log("🔍 useDashboard - fetchDashboardData called");

      // Don't fetch if authentication is still loading
      if (authLoading) {
        // console.log("🔍 useDashboard - Authentication still loading, skipping dashboard data fetch");
        return;
      }

      // Don't fetch if no authenticated user
      if (!authUser) {
        // console.log("🔍 useDashboard - No authenticated user, skipping dashboard data fetch");
        return;
      }

      // Don't fetch if user ID is not available
      if (!authUser.id) {
        // console.log("🔍 useDashboard - No user ID available, skipping dashboard data fetch");
        return;
      }

      // console.log("🔍 useDashboard - Fetching dashboard data for user:", authUser.email);

      // Fetch all dashboard data in parallel
      // Note: Notifications are now real-time via useNotifications hook, no need to fetch
      await Promise.all([
        fetchMembershipDataHook(),
        fetchAttendanceDataHook(),
        fetchUpcomingSessionsHook(),
        Promise.resolve(fetchWorkoutTipHook()),
      ]);

      // console.log("🔍 useDashboard - Dashboard data fetch completed");
      setIsDataLoaded(true);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
      setIsDataLoaded(true); // Set to true even on error to prevent infinite loading
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, authLoading]); // Add authUser and authLoading as dependencies

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUserData(), fetchMembershipDataHook(true)]); // Force refresh subscription data
    setRefreshing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array since these functions are stable

  useEffect(() => {
    // console.log("🔍 useDashboard - useEffect triggered");

    // Only fetch data if user is authenticated and not loading
    if (!authLoading && authUser && authUser.id) {
      fetchUserData();
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, authUser]); // Depend on authentication state

  // Check if subscription is actually active (not just exists)
  const [isSubscriptionActive, setIsSubscriptionActive] = useState(false);
  // Check if user has ANY subscription (active or expired) - for dashboard access
  const [hasAnySubscription, setHasAnySubscription] = useState(false);
  
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (!authUser?.id) {
        setIsSubscriptionActive(false);
        setHasAnySubscription(false);
        return;
      }
      
      try {
        const { getUserActiveSubscription } = await import("@/src/services/subscriptionService");
        
        // First check if user has an active subscription
        if (activeSubscriptionId) {
          const subscription = await getUserActiveSubscription(authUser.id);
          
          if (subscription) {
            // Subscription exists - check if it's active
            const isActive = !subscription.isExpired && subscription.status === "active";
            setIsSubscriptionActive(isActive);
            setHasAnySubscription(true); // User has subscription (even if expired)
            return;
          }
        }
        
        // If no activeSubscriptionId, check if user has ANY subscription (including expired ones)
        // by querying the subscriptions collection
        const subscriptionsSnapshot = await firestore
          .collection("subscriptions")
          .where("userId", "==", authUser.id)
          .limit(1)
          .get();
        
        if (!subscriptionsSnapshot.empty) {
          // User has at least one subscription (could be expired)
          const subscriptionData = subscriptionsSnapshot.docs[0].data();
          
          // Check if it's active
          const now = new Date();
          const endDate = subscriptionData.endDate?.toDate?.() || new Date();
          const isActive = subscriptionData.status === "active" && endDate > now;
          
          setIsSubscriptionActive(isActive);
          setHasAnySubscription(true); // User has subscription history
        } else {
          setIsSubscriptionActive(false);
          setHasAnySubscription(false); // User has no subscription at all
        }
      } catch (error) {
        console.error("Error checking subscription status:", error);
        setIsSubscriptionActive(false);
        // If there's an error, check activeSubscriptionId as fallback
        setHasAnySubscription(!!activeSubscriptionId);
      }
    };
    
    checkSubscriptionStatus();
  }, [activeSubscriptionId, authUser?.id]);

  // hasActiveSubscription: true only if subscription exists AND is active (not expired)
  // hasSubscription: true if user has any subscription (active or expired) - for dashboard access
  const hasActiveSubscription = isSubscriptionActive;
  const hasSubscription = hasAnySubscription; // User has subscription if they have any subscription history

  // Debug: Let's also check the user data directly
  // console.log("🔍 useDashboard - hasActiveSub from hook:", hasActiveSub);
  // console.log("🔍 useDashboard - activeSubscriptionId:", activeSubscriptionId);
  // console.log("🔍 useDashboard - hasActiveSubscription (simple):", hasActiveSubscription);
  // console.log("🔍 useDashboard - userData:", userData);

  // Debug: Check authentication state
  React.useEffect(() => {
    // console.log("🔍 useDashboard - Authentication state debug:");
    // console.log("  - authUser:", userData);
    // console.log("  - activeSubscriptionId:", activeSubscriptionId);
    // console.log("  - hasActiveSubscription:", hasActiveSubscription);
  }, [userData, activeSubscriptionId, hasActiveSubscription]);

  return {
    // State
    refreshing,
    showQR,
    setShowQR,
    email,
    userData,
    membershipData,
    attendanceData,
    upcomingSessions,
    workoutTip,
    notifications,
    subscriptions,
    hasActiveSubscription, // True only if subscription is active (not expired)
    hasSubscription, // True if user has any subscription (active or expired)
    isDataLoaded,
    isUserDataLoading,

    // Functions
    onRefresh,
    getGreeting,
    handleRenewMembership,
    getMembershipStatusColor,
    getDaysLeftFromSubscriptions,
    getProgressPercentage,
    unreadCount,
  };
};
