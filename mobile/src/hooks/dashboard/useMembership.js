import { useState } from "react";
import { Alert } from "react-native";
import { firebase } from "@/src/services/firebase";
import {
  fetchMembershipData,
  renewMembership,
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
    switch (status) {
      case "Active":
        return "#22c55e";
      case "Expiring Soon":
        return "#f59e0b";
      case "Expired":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  // Calculate days left from subscriptions using endDate minus max(startDate, today)
  const getDaysLeftFromSubscriptions = () => {
    if (!subscriptions || subscriptions.length === 0) return null;

    // Map to items that have end/start (fallback to validUntil when present)
    const mapped = subscriptions
      .map((sub) => {
        // Try to use endDate first, then fallback to validUntil
        let endRaw = sub.endDate;
        if (!endRaw && sub.validUntil) {
          endRaw = new Date(sub.validUntil);
        }
        if (!endRaw) return null;

        const end = endRaw?.toDate ? endRaw.toDate() : new Date(endRaw);
        const startRaw = sub.startDate;
        const start = startRaw
          ? startRaw?.toDate
            ? startRaw.toDate()
            : new Date(startRaw)
          : null;
        const today = new Date();
        const reference = start && start > today ? start : today;

        // Set both dates to start of day for accurate comparison
        const endOnly = new Date(
          end.getFullYear(),
          end.getMonth(),
          end.getDate(),
        );
        const refOnly = new Date(
          reference.getFullYear(),
          reference.getMonth(),
          reference.getDate(),
        );
        const diffDays = Math.ceil(
          (endOnly.getTime() - refOnly.getTime()) / (1000 * 60 * 60 * 24),
        );
        return {
          end,
          daysLeft: Math.max(diffDays, 0),
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
