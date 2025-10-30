import { firebase, firestore } from "./firebase";
import * as Notifications from "expo-notifications";
import { AppState } from "react-native";

class NotificationService {
  constructor() {
    this.listeners = new Map();
    this.notifiedIds = new Set(); // Track which IDs have already triggered push notifications
    this.isFirstLoad = true; // Skip push notifications on first load
    this.appState = AppState.currentState; // Track app state
    this.appStateListener = null;
    this.justCameToForeground = false; // Track if app just transitioned to foreground
  }

  // Subscribe to notifications for a specific user
  subscribeToNotifications(userId, callback) {
    console.log("NotificationService: Setting up listener for userId:", userId);
    
    // Set up app state listener to track when app comes to foreground
    if (!this.appStateListener) {
      this.appStateListener = AppState.addEventListener('change', (nextAppState) => {
        const wasInBackground = this.appState.match(/inactive|background/);
        const isNowActive = nextAppState === 'active';
        
        if (wasInBackground && isNowActive) {
          console.log("App came to foreground - marking flag to prevent duplicate notifications");
          this.justCameToForeground = true;
          // Reset flag after 10 seconds to allow new notifications
          setTimeout(() => {
            this.justCameToForeground = false;
          }, 10000);
        }
        
        this.appState = nextAppState;
      });
    }
    
    const unsubscribe = firestore
      .collection("notifications")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .onSnapshot(
        (snapshot) => {
          console.log("NotificationService: Snapshot received, docs:", snapshot.size, "App state:", this.appState);
          
          // Get all notifications
          const notifications = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              timestamp: data.timestamp?.toDate() || new Date(),
            };
          });
          
          // Don't trigger push notifications on first load
          if (this.isFirstLoad) {
            console.log("First load - marking all existing notifications as notified");
            notifications.forEach(n => this.notifiedIds.add(n.id));
            this.isFirstLoad = false;
          } else {
            // Get only newly added documents that haven't been notified yet
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                const notificationId = change.doc.id;
                const data = change.doc.data();
                const notificationTimestamp = data.timestamp?.toDate() || new Date();
                const now = Date.now();
                const notificationTime = notificationTimestamp.getTime();
                const timeSinceNotification = now - notificationTime;
                
                // If app just came to foreground AND notification is older than 5 seconds,
                // it means FCM already sent it while app was in background
                const wasReceivedInBackground = this.justCameToForeground && timeSinceNotification > 5000;
                
                // Only trigger LOCAL push notification if:
                // 1. We haven't notified for this ID yet, AND
                // 2. App is in foreground (active state), AND
                // 3. Notification was NOT received while app was in background (FCM already handled it)
                if (!this.notifiedIds.has(notificationId) && this.appState === 'active' && !wasReceivedInBackground) {
                  console.log("New notification - triggering LOCAL push (app in foreground):", {
                    id: notificationId,
                    type: data.type,
                    title: data.title,
                    timeSinceNotification: Math.round(timeSinceNotification / 1000) + "s",
                  });
                  
                  // Mark as notified IMMEDIATELY
                  this.notifiedIds.add(notificationId);
                  
                  // Trigger push notification
                  this.triggerPushNotification({
                    id: notificationId,
                    ...data,
                    timestamp: notificationTimestamp,
                  });
                } else {
                  // Mark as notified even if we don't trigger local notification
                  // (because FCM already sent it when app was in background)
                  if (!this.notifiedIds.has(notificationId)) {
                    this.notifiedIds.add(notificationId);
                    console.log("Notification received while app in background - FCM already sent it, marking as notified:", {
                      id: notificationId,
                      appState: this.appState,
                      timeSinceNotification: Math.round(timeSinceNotification / 1000) + "s",
                      wasReceivedInBackground: wasReceivedInBackground,
                      justCameToForeground: this.justCameToForeground,
                    });
                  } else {
                    console.log("Notification already notified, skipping push:", change.doc.id);
                  }
                }
              }
            });
          }
          
          callback(notifications);
        },
        (error) => {
          console.error("Error subscribing to notifications:", error);
          callback([]);
        }
      );

    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  // Trigger push notification (called only once per notification by the service)
  triggerPushNotification(notification) {
    Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.message,
        data: notification,
        sound: 'default',
        priority: notification.priority === 'high' ? 'high' : 'default',
      },
      trigger: null, // Show immediately
    }).catch(err => {
      console.error("Failed to schedule local notification:", err);
    });
  }

  // Create a new notification
  async createNotification(notificationData) {
    try {
      const docRef = await firestore.collection("notifications").add({
        ...notificationData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        read: false,
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await firestore.collection("notifications").doc(notificationId).update({
        read: true,
        readAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const snapshot = await firestore
        .collection("notifications")
        .where("userId", "==", userId)
        .where("read", "==", false)
        .get();

      const batch = firestore.batch();

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          readAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  // Delete a notification
  async deleteNotification(notificationId) {
    try {
      await firestore.collection("notifications").doc(notificationId).delete();
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount(userId) {
    try {
      const snapshot = await firestore
        .collection("notifications")
        .where("userId", "==", userId)
        .where("read", "==", false)
        .get();

      return snapshot.size;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  // Subscription-related notifications
  async createSubscriptionRequestNotification(
    adminUserId,
    userName,
    subscriptionName,
    requestId
  ) {
    return this.createNotification({
      userId: adminUserId,
      type: "subscription_request",
      title: "New Subscription Request",
      message: `${userName} requested ${subscriptionName}`,
      requestId,
      priority: "high",
      actionUrl: "/requests",
    });
  }

  async createSubscriptionApprovedNotification(
    userId,
    subscriptionName,
    subscriptionId
  ) {
    return this.createNotification({
      userId,
      type: "subscription_approved",
      title: "Subscription Approved!",
      message: `Your ${subscriptionName} subscription has been approved and is now active`,
      subscriptionId,
      priority: "high",
      actionUrl: "/subscriptions",
    });
  }

  async createSubscriptionRejectedNotification(
    userId,
    subscriptionName,
    requestId
  ) {
    return this.createNotification({
      userId,
      type: "subscription_rejected",
      title: "Subscription Request Rejected",
      message: `Your ${subscriptionName} subscription request was not approved. Please contact the admin for more information.`,
      requestId,
      priority: "high",
    });
  }

  async createSubscriptionExtendedNotification(
    userId,
    subscriptionName,
    daysAdded,
    subscriptionId
  ) {
    return this.createNotification({
      userId,
      type: "subscription_extended",
      title: "Subscription Extended",
      message: `Your ${subscriptionName} subscription has been extended by ${daysAdded} days`,
      subscriptionId,
      priority: "normal",
    });
  }

  // Helper function to notify all admins
  async notifyAllAdmins(notificationData) {
    try {
      // Query for all admin users
      const snapshot = await firestore
        .collection("users")
        .where("role", "==", "admin")
        .get();

      // Create notifications for each admin
      const promises = snapshot.docs.map((doc) =>
        this.createNotification({
          ...notificationData,
          userId: doc.id,
        })
      );

      await Promise.all(promises);
    } catch (error) {
      console.error("Error notifying admins:", error);
      throw error;
    }
  }

  // Unsubscribe from notifications
  unsubscribeFromNotifications(userId) {
    const unsubscribe = this.listeners.get(userId);
    if (unsubscribe) {
      unsubscribe();
      this.listeners.delete(userId);
    }
  }

  // Clean up all listeners
  cleanup() {
    this.listeners.forEach((unsubscribe) => unsubscribe());
    this.listeners.clear();
    
    // Remove app state listener
    if (this.appStateListener) {
      this.appStateListener.remove();
      this.appStateListener = null;
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;

