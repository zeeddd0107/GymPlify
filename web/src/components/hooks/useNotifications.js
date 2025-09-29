import { useState, useEffect, useCallback } from "react";

// Mock notification data - replace with actual API calls
const mockNotifications = [
  {
    id: "1",
    type: "checkin",
    title: "New Check-in",
    message: "John Doe checked in at 9:30 AM",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    userId: "user1",
    sessionId: "session1",
  },
  {
    id: "2",
    type: "subscription",
    title: "Subscription Expiring",
    message: "Sarah Wilson's subscription expires in 3 days",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    userId: "user2",
    subscriptionId: "sub1",
  },
  {
    id: "3",
    type: "equipment",
    title: "Equipment Maintenance",
    message: "Treadmill #3 requires maintenance",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    equipmentId: "eq1",
  },
  {
    id: "4",
    type: "checkout",
    title: "Check-out",
    message: "Mike Johnson checked out at 6:45 PM",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    read: false,
    userId: "user3",
    sessionId: "session2",
  },
  {
    id: "5",
    type: "warning",
    title: "Low Stock Alert",
    message: "Protein powder is running low (5 items left)",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: true,
    inventoryId: "inv1",
  },
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        setNotifications(mockNotifications);
      } catch (error) {
        console.error("Failed to load notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification,
      ),
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId),
    );
  }, []);

  // Add new notification
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  }, []);

  // Get unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Get notifications by type
  const getNotificationsByType = useCallback(
    (type) => {
      return notifications.filter((n) => n.type === type);
    },
    [notifications],
  );

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
    getNotificationsByType,
    clearAllNotifications,
  };
};

export default useNotifications;
