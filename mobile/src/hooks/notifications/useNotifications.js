import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context";
import notificationService from "../../services/notificationService";
import pushNotificationService from "../../services/pushNotificationService";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Subscribe to real-time notifications
  useEffect(() => {
    // Mobile app uses user.id instead of user.uid
    const userId = user?.uid || user?.id;
    
    if (!userId) {
      // Silently handle no user case (happens during logout/login)
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const unsubscribe = notificationService.subscribeToNotifications(
      userId,
      (allNotifications) => {
        // Update state with all notifications
        // Push notifications are handled by the service singleton
        setNotifications(allNotifications);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.uid, user?.id]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    const userId = user?.uid || user?.id;
    if (!userId) return;

    try {
      await notificationService.markAllAsRead(userId);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, [user?.uid, user?.id]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, []);

  // Get unread count and update badge
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Update badge count when unread count changes
  useEffect(() => {
    pushNotificationService.setBadgeCount(unreadCount).catch((error) => {
      console.error("Failed to update badge count:", error);
    });
  }, [unreadCount]);

  // Get notifications by type
  const getNotificationsByType = useCallback(
    (type) => {
      return notifications.filter((n) => n.type === type);
    },
    [notifications]
  );

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getNotificationsByType,
  };
};

export default useNotifications;
