import { useState } from "react";
import { Alert } from "react-native";
import { fetchNotifications } from "@/src/services/dashboardService";
import { useAuth } from "@/src/context";
import Logger from "@/src/utils/logger";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { user: authUser, loading: authLoading } = useAuth();

  const fetchNotificationsHook = async () => {
    try {
      Logger.hook("useNotifications", "Fetching notifications");

      // Don't fetch if authentication is still loading
      if (authLoading) {
        Logger.debug(
          "Authentication still loading, skipping notifications fetch",
        );
        return;
      }

      // Don't fetch if no authenticated user
      if (!authUser) {
        Logger.debug("No authenticated user, skipping notifications fetch");
        return;
      }

      // Don't fetch if user ID is not available
      if (!authUser.id) {
        Logger.debug("No user ID available, skipping notifications fetch");
        return;
      }

      Logger.hook(
        "useNotifications",
        `Fetching data for user: ${authUser.email}`,
      );
      const notifs = await fetchNotifications(authUser.id);
      setNotifications(notifs);
      Logger.hook(
        "useNotifications",
        `Notifications fetched: ${notifs.length}`,
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
      Alert.alert("Error", "Failed to load notifications");
    }
  };

  const getUnreadCount = () => {
    return notifications.filter((n) => n.unread).length;
  };

  return {
    notifications,
    setNotifications,
    fetchNotificationsHook,
    getUnreadCount,
  };
};
