import { useState } from "react";
import { Alert } from "react-native";
import { fetchUpcomingSessions } from "@/src/services/dashboardService";
import { useAuth } from "@/src/context";
import Logger from "@/src/utils/logger";

export const useUpcomingSessions = () => {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const { user: authUser, loading: authLoading } = useAuth();

  const fetchUpcomingSessionsHook = async () => {
    try {
      Logger.hook("useUpcomingSessions", "Fetching upcoming sessions");

      // Don't fetch if authentication is still loading
      if (authLoading) {
        Logger.debug("Authentication still loading, skipping sessions fetch");
        return;
      }

      // Don't fetch if no authenticated user
      if (!authUser) {
        Logger.debug("No authenticated user, skipping sessions fetch");
        return;
      }

      // Don't fetch if user ID is not available
      if (!authUser.id) {
        Logger.debug("No user ID available, skipping sessions fetch");
        return;
      }

      Logger.hook(
        "useUpcomingSessions",
        `Fetching data for user: ${authUser.email}`,
      );
      const sessions = await fetchUpcomingSessions(authUser.id);
      setUpcomingSessions(sessions);
      Logger.hook(
        "useUpcomingSessions",
        `Sessions fetched: ${sessions.length}`,
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
