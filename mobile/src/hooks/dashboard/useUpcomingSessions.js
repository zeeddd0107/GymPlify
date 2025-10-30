import { useState, useRef } from "react";
import { Alert } from "react-native";
import { fetchUpcomingSessions } from "@/src/services/dashboardService";
import { useAuth } from "@/src/context";
import Logger from "@/src/utils/logger";

export const useUpcomingSessions = () => {
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const { user: authUser, loading: authLoading } = useAuth();
  const isFetchingRef = useRef(false);

  const fetchUpcomingSessionsHook = async () => {
    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      Logger.once("sessions-skip-duplicate", "useUpcomingSessions: Skipping duplicate fetch");
      return;
    }

    try {
      isFetchingRef.current = true;
      Logger.once("sessions-fetch-start", "useUpcomingSessions: Fetching upcoming sessions");

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

      Logger.once("sessions-fetch-user", `useUpcomingSessions: Fetching data for user: ${authUser.email}`);
      const sessions = await fetchUpcomingSessions(authUser.id);
      setUpcomingSessions(sessions);
      Logger.once("sessions-fetch-complete", `useUpcomingSessions: Sessions fetched: ${sessions.length}`);
    } catch (error) {
      console.error("Error fetching upcoming sessions:", error);
      Alert.alert("Error", "Failed to load upcoming sessions");
    } finally {
      isFetchingRef.current = false;
    }
  };

  return {
    upcomingSessions,
    setUpcomingSessions,
    fetchUpcomingSessionsHook,
  };
};
