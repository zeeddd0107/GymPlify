import { useState } from "react";
import { Alert } from "react-native";
import {
  fetchMembershipData,
  renewMembership,
  fetchActiveSubscriptions,
} from "@/src/services/dashboardService";
import { getUserActiveSubscription } from "@/src/services/subscriptionService";
import { useAuth } from "@/src/context";

export const useMembership = () => {
  const [membershipData, setMembershipData] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const { user: authUser, loading: authLoading } = useAuth();

  const fetchMembershipDataHook = async () => {
    try {
      console.log("🔍 useMembership - fetchMembershipDataHook called");
      console.log("🔍 useMembership - authLoading:", authLoading);
      console.log("🔍 useMembership - authUser:", authUser);
      console.log("🔍 useMembership - authUser type:", typeof authUser);
      console.log(
        "🔍 useMembership - authUser keys:",
        authUser ? Object.keys(authUser) : "null",
      );
      console.log("🔍 useMembership - authUser.id:", authUser?.id);

      // Don't fetch if authentication is still loading
      if (authLoading) {
        console.log(
          "🔍 useMembership - Authentication still loading, skipping membership data fetch",
        );
        return;
      }

      // Don't fetch if no authenticated user
      if (!authUser) {
        console.log(
          "🔍 useMembership - No authenticated user, skipping membership data fetch",
        );
        return;
      }

      // Don't fetch if user ID is not available
      if (!authUser.id) {
        console.log(
          "🔍 useMembership - No user ID available, skipping membership data fetch",
        );
        return;
      }

      console.log(
        "🔍 useMembership - Fetching membership data for user:",
        authUser.email,
      );

      // Try to get active subscription from new system first
      const activeSubscription = await getUserActiveSubscription(authUser.id);
      if (activeSubscription) {
        console.log(
          "🔍 useMembership - Found active subscription:",
          activeSubscription.id,
        );
        setMembershipData(activeSubscription);
        return;
      }

      console.log(
        "🔍 useMembership - No active subscription found, trying fallback system",
      );

      // Fallback to old system
      const membership = await fetchMembershipData(authUser.id);
      setMembershipData(membership);

      // Also fetch subscriptions to calculate days remaining
      const activeSubs = await fetchActiveSubscriptions(authUser.id);
      setSubscriptions(activeSubs);

      console.log("🔍 useMembership - Membership data fetch completed");
    } catch (error) {
      console.error("Error fetching membership data:", error);
      // Don't show alert for missing membership data since it's expected for new users
      // Alert.alert("Error", "Failed to load membership data");
    }
  };

  const handleRenewMembership = async () => {
    try {
      if (!authUser) {
        Alert.alert("Error", "Please log in to renew membership");
        return;
      }

      const result = await renewMembership(authUser.id, membershipData.planId);
      if (result.success) {
        Alert.alert("Success", "Membership renewed successfully!");
        fetchMembershipDataHook(); // Refresh data
      }
    } catch (error) {
      Alert.alert("Error", "Failed to renew membership: " + error.message);
    }
  };

  const getMembershipStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "#22c55e"; // Green
      case "expiring soon":
        return "#f59e0b"; // Orange
      case "expired":
        return "#ef4444"; // Red
      case "cancelled":
        return "#6b7280"; // Gray
      default:
        return "#6b7280"; // Gray for unknown status
    }
  };

  // Calculate days left from subscriptions using endDate minus today
  const getDaysLeftFromSubscriptions = () => {
    // First try to get days left from the active subscription (membershipData)
    if (membershipData && membershipData.endDate) {
      try {
        const end = membershipData.endDate.toDate
          ? membershipData.endDate.toDate()
          : new Date(membershipData.endDate);
        const today = new Date();

        // Set both dates to start of day for accurate comparison
        const endOnly = new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate(),
        );
        const todayOnly = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );

        const diffDays = Math.ceil(
          (endOnly.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24),
        );

        return diffDays;
      } catch (error) {
        console.error(
          "Error calculating days left from membershipData:",
          error,
        );
      }
    }

    // Fallback to subscriptions array
    if (!subscriptions || subscriptions.length === 0) return null;

    // Map to items that have endDate
    const mapped = subscriptions
      .map((sub) => {
        // Try to use endDate first, then fallback to validUntil
        let endRaw = sub.endDate;
        if (!endRaw && sub.validUntil) {
          endRaw = new Date(sub.validUntil);
        }
        if (!endRaw) return null;

        const end = endRaw?.toDate ? endRaw.toDate() : new Date(endRaw);
        const today = new Date();

        // Set both dates to start of day for accurate comparison
        const endOnly = new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate(),
        );
        const todayOnly = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
        );

        const diffDays = Math.ceil(
          (endOnly.getTime() - todayOnly.getTime()) / (1000 * 60 * 60 * 24),
        );

        return {
          end,
          daysLeft: diffDays, // Allow negative values for expired subscriptions
        };
      })
      .filter(Boolean);

    if (mapped.length === 0) return null;

    // Pick the soonest ending subscription
    mapped.sort((a, b) => a.end.getTime() - b.end.getTime());
    return mapped[0].daysLeft;
  };

  return {
    membershipData,
    subscriptions,
    setSubscriptions,
    fetchMembershipDataHook,
    handleRenewMembership,
    getMembershipStatusColor,
    getDaysLeftFromSubscriptions,
  };
};
