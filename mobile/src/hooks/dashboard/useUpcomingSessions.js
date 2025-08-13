import { useState } from "react";
import { Alert } from "react-native";
import { firebase } from "@/src/services/firebase";
import { fetchUpcomingSessions } from "@/src/services/dashboardService";

export const useUpcomingSessions = () => {
  const [upcomingSessions, setUpcomingSessions] = useState([]);

  const fetchUpcomingSessionsHook = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) return;

      const sessions = await fetchUpcomingSessions(user.uid);
      setUpcomingSessions(sessions);
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
