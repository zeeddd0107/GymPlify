import { useState } from "react";
import { Alert } from "react-native";
import { firebase } from "@/src/services/firebase";
import { fetchNotifications } from "@/src/services/dashboardService";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotificationsHook = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) return;

      const notifs = await fetchNotifications(user.uid);
      setNotifications(notifs);
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
