import { db } from "@/config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDocs,
  writeBatch,
} from "firebase/firestore";

class NotificationService {
  constructor() {
    this.listeners = new Map();
  }

  // Subscribe to notifications for a specific user
  subscribeToNotifications(userId, callback) {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      }));
      callback(notifications);
    });

    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  // Create a new notification
  async createNotification(notificationData) {
    try {
      const notificationsRef = collection(db, "notifications");
      const docRef = await addDoc(notificationsRef, {
        ...notificationData,
        timestamp: serverTimestamp(),
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
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        read: true,
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  // Mark all notifications as read for a user
  async markAllAsRead(userId) {
    try {
      const notificationsRef = collection(db, "notifications");
      const q = query(
        notificationsRef,
        where("userId", "==", userId),
        where("read", "==", false),
      );

      const snapshot = await getDocs(q);
      const batch = writeBatch(db);

      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, {
          read: true,
          readAt: serverTimestamp(),
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
      const notificationRef = doc(db, "notifications", notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }

  // Create system notifications for gym events
  async createCheckInNotification(userId, userName, sessionId) {
    return this.createNotification({
      userId,
      type: "checkin",
      title: "New Check-in",
      message: `${userName} checked in`,
      sessionId,
      priority: "normal",
    });
  }

  async createCheckOutNotification(userId, userName, sessionId) {
    return this.createNotification({
      userId,
      type: "checkout",
      title: "Check-out",
      message: `${userName} checked out`,
      sessionId,
      priority: "normal",
    });
  }

  async createSubscriptionExpiryNotification(userId, userName, daysLeft) {
    return this.createNotification({
      userId,
      type: "subscription",
      title: "Subscription Expiring",
      message: `${userName}'s subscription expires in ${daysLeft} days`,
      priority: "high",
    });
  }

  async createEquipmentMaintenanceNotification(userId, equipmentName) {
    return this.createNotification({
      userId,
      type: "equipment",
      title: "Equipment Maintenance",
      message: `${equipmentName} requires maintenance`,
      priority: "medium",
    });
  }

  async createLowStockNotification(userId, itemName, quantity) {
    return this.createNotification({
      userId,
      type: "warning",
      title: "Low Stock Alert",
      message: `${itemName} is running low (${quantity} items left)`,
      priority: "high",
    });
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
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
