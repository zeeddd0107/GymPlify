import { useState } from "react";
import { Alert } from "react-native";
import { firebase } from "@/src/services/firebase";
import {
  fetchMembershipData,
  renewMembership,
  fetchActiveSubscriptions,
} from "@/src/services/dashboardService";

export const useMembership = () => {
  const [membershipData, setMembershipData] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);

  const fetchMembershipDataHook = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) return;

      const membership = await fetchMembershipData(user.uid);
      setMembershipData(membership);

      // Also fetch subscriptions to calculate days remaining
      const activeSubs = await fetchActiveSubscriptions(user.uid);
      setSubscriptions(activeSubs);
    } catch (error) {
      console.error("Error fetching membership data:", error);
      Alert.alert("Error", "Failed to load membership data");
    }
  };

  const handleRenewMembership = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        Alert.alert("Error", "Please log in to renew membership");
        return;
      }

      const result = await renewMembership(user.uid, membershipData.planId);
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
