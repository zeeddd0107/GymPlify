import React, { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
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

  const { notifications, fetchNotificationsHook, getUnreadCount } =
    useNotifications();

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
      await Promise.all([
        fetchMembershipDataHook(),
        fetchAttendanceDataHook(),
        fetchUpcomingSessionsHook(),
        fetchNotificationsHook(),
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

  // Use the new subscription status hook for real-time updates and redirects
  // const { hasActiveSubscription: hasActiveSub, subscription, loading: subscriptionLoading } = useSubscriptionStatus();

  // Simple check: if user has activeSubscriptionId, they have an active subscription
  const hasActiveSubscription = !!activeSubscriptionId;

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
    hasActiveSubscription: hasActiveSubscription, // Use the simple check based on activeSubscriptionId
    isDataLoaded,
    isUserDataLoading,

    // Functions
    onRefresh,
    getGreeting,
    handleRenewMembership,
    getMembershipStatusColor,
    getDaysLeftFromSubscriptions,
    getProgressPercentage,
    getUnreadCount,
  };
};
