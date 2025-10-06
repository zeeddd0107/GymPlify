import { useState } from "react";
import { Alert } from "react-native";
import { fetchNotifications } from "@/src/services/dashboardService";
import { useAuth } from "@/src/context";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { user: authUser, loading: authLoading } = useAuth();

  const fetchNotificationsHook = async () => {
    try {
      console.log("🔍 useNotifications - fetchNotificationsHook called");
      console.log("🔍 useNotifications - authLoading:", authLoading);
      console.log("🔍 useNotifications - authUser:", authUser);

      // Don't fetch if authentication is still loading
      if (authLoading) {
        console.log(
          "🔍 useNotifications - Authentication still loading, skipping notifications fetch",
        );
        return;
      }

      // Don't fetch if no authenticated user
      if (!authUser) {
        console.log(
          "🔍 useNotifications - No authenticated user, skipping notifications fetch",
        );
        return;
      }

      // Don't fetch if user ID is not available
      if (!authUser.id) {
        console.log(
          "🔍 useNotifications - No user ID available, skipping notifications fetch",
        );
        return;
      }

      console.log(
        "🔍 useNotifications - Fetching notifications for user:",
        authUser.email,
      );
      const notifs = await fetchNotifications(authUser.id);
      setNotifications(notifs);
      console.log(
        "🔍 useNotifications - Notifications fetched:",
        notifs.length,
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
