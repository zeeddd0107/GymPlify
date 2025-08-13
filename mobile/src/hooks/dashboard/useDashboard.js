import { useState, useEffect, useCallback } from "react";
import { Alert } from "react-native";
import { firebase } from "@/src/services/firebase";
import { useMembership } from "./useMembership";
import { useAttendance } from "./useAttendance";
import { useUpcomingSessions } from "./useUpcomingSessions";
import { useWorkoutTip } from "./useWorkoutTip";
import { useUserData } from "../user/useUserData";
import { useNotifications } from "../notifications/useNotifications";

export const useDashboard = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [showQR, setShowQR] = useState(false);

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

  const { email, userData, fetchUserData, getGreeting } = useUserData();

  const { notifications, fetchNotificationsHook, getUnreadCount } =
    useNotifications();

  const fetchDashboardData = useCallback(async () => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) return;

      // Fetch all dashboard data in parallel
      await Promise.all([
        fetchMembershipDataHook(),
        fetchAttendanceDataHook(),
        fetchUpcomingSessionsHook(),
        fetchNotificationsHook(),
        Promise.resolve(fetchWorkoutTipHook()),
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array since these functions are stable

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUserData(), fetchDashboardData()]);
    setRefreshing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array since these functions are stable

  useEffect(() => {
    fetchUserData();
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

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
