import { useState } from "react";
import { Alert } from "react-native";
import { fetchUpcomingSessions } from "@/src/services/dashboardService";
import { useAuth } from "@/src/context";

export const useUpcomingSessions = () => {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const { user: authUser, loading: authLoading } = useAuth();

  const fetchUpcomingSessionsHook = async () => {
    try {
      console.log("🔍 useUpcomingSessions - fetchUpcomingSessionsHook called");
      console.log("🔍 useUpcomingSessions - authLoading:", authLoading);
      console.log("🔍 useUpcomingSessions - authUser:", authUser);

      // Don't fetch if authentication is still loading
      if (authLoading) {
        console.log(
          "🔍 useUpcomingSessions - Authentication still loading, skipping sessions fetch",
        );
        return;
      }

      // Don't fetch if no authenticated user
      if (!authUser) {
        console.log(
          "🔍 useUpcomingSessions - No authenticated user, skipping sessions fetch",
        );
        return;
      }

      // Don't fetch if user ID is not available
      if (!authUser.id) {
        console.log(
          "🔍 useUpcomingSessions - No user ID available, skipping sessions fetch",
        );
        return;
      }

      console.log(
        "🔍 useUpcomingSessions - Fetching sessions for user:",
        authUser.email,
      );
      const sessions = await fetchUpcomingSessions(authUser.id);
      setUpcomingSessions(sessions);
      console.log(
        "🔍 useUpcomingSessions - Sessions fetched:",
        sessions.length,
      );
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
      Alert.alert("Error", "Failed to load upcoming sessions");
    }
  };

  return {
    upcomingSessions,
    setUpcomingSessions,
    fetchUpcomingSessionsHook,
  };
};
