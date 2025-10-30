import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { firebase } from "./firebase";

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true, // For newer Android versions
    shouldShowList: true,   // For newer Android versions
  }),
});

// Set up Android notification channel
if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "Default",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#FF6B6B",
    sound: "default",
    enableVibrate: true,
    showBadge: true,
  });
}

class PushNotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Request notification permissions from the user
   */
  async requestPermissions() {
    try {
      if (!Device.isDevice) {
        console.log("Push notifications only work on physical devices");
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Permission not granted for push notifications");
        return false;
      }

      console.log(" Push notification permission granted");
      return true;
    } catch (error) {
      console.error(" Error requesting notification permissions:", error);
      return false;
    }
  }

  /**
   * Get the Expo Push Token for this device
   */
  async getExpoPushToken() {
    try {
      if (!Device.isDevice) {
        console.log(" Cannot get push token on simulator/emulator");
        return null;
      }

      // Get the project ID from app.json
      const projectId = "7382f853-be85-419a-a7f2-02f56e64c44b";

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log(" Expo Push Token:", token.data);
      return token.data;
    } catch (error) {
      console.error(" Error getting push token:", error);
      return null;
    }
  }

  /**
   * Get the native device FCM token (for Firebase Cloud Messaging V1)
   */
  async getDeviceFCMToken() {
    try {
      if (!Device.isDevice) {
        console.log(" Cannot get FCM token on simulator/emulator");
        return null;
      }

      const deviceToken = await Notifications.getDevicePushTokenAsync();
      
      console.log(" Device FCM Token:", deviceToken.data);
      return deviceToken.data;
    } catch (error) {
      console.error(" Error getting device FCM token:", error);
      return null;
    }
  }

  /**
   * Register device for push notifications and store token in Firestore
   */
  async registerForPushNotifications(userId) {
    try {
      console.log(" Registering device for push notifications...");

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      // Get both Expo Push Token (for foreground) and FCM Token (for background)
      const expoPushToken = await this.getExpoPushToken();
      const fcmToken = await this.getDeviceFCMToken();
      
      console.log(" Tokens retrieved:", {
        expo: expoPushToken ? "" : "",
        fcm: fcmToken ? "" : "",
      });

      if (!fcmToken) {
        console.log(" No FCM token available");
        return null;
      }

      // Store tokens in Firestore
      await this.storePushToken(userId, expoPushToken, fcmToken);

      // Set up notification listeners
      this.setupNotificationListeners();

      return { expoPushToken, fcmToken };
    } catch (error) {
      console.error(" Error registering for push notifications:", error);
      return null;
    }
  }

  /**
   * Store push token in Firestore user document
   */
  async storePushToken(userId, expoPushToken, fcmToken) {
    try {
      const firestore = firebase.firestore();
      const userRef = firestore.collection("users").doc(userId);

      // Use set with merge to create document if it doesn't exist
      await userRef.set({
        pushToken: expoPushToken, // Keep for backward compatibility
        fcmToken: fcmToken, // Native FCM token for Cloud Functions
        pushTokenUpdatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        devicePlatform: Platform.OS,
      }, { merge: true });

      console.log(" Push tokens stored in Firestore:", {
        expo: expoPushToken ? "" : "",
        fcm: fcmToken ? "" : "",
      });
    } catch (error) {
      console.error(" Error storing push token:", error);
      throw error;
    }
  }

  /**
   * Remove push token from Firestore (call on logout)
   */
  async removePushToken(userId) {
    try {
      const firestore = firebase.firestore();
      const userRef = firestore.collection("users").doc(userId);

      // Check if document exists before updating
      const doc = await userRef.get();
      if (doc.exists) {
        await userRef.update({
          pushToken: firebase.firestore.FieldValue.delete(),
          pushTokenUpdatedAt: firebase.firestore.FieldValue.delete(),
          devicePlatform: firebase.firestore.FieldValue.delete(),
        });
        console.log(" Push token removed from Firestore");
      } else {
        console.log(" User document doesn't exist, skipping token removal");
      }
    } catch (error) {
      console.error(" Error removing push token:", error);
    }
  }

  /**
   * Set up listeners for notifications
   */
  setupNotificationListeners() {
    // Handle notifications received while app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log(" Notification received in foreground:", notification);
      }
    );

    // Handle notification taps (when user taps on notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(" Notification tapped:", response);
        this.handleNotificationTap(response.notification);
      }
    );
  }

  /**
   * Handle notification tap - navigate to appropriate screen
   */
  handleNotificationTap(notification) {
    const data = notification.request.content.data;
    console.log(" Notification data:", data);

    // Navigation is handled by the app - store the notification data
    // The app can read this and navigate accordingly
    this.lastTappedNotification = data;
  }

  /**
   * Get and clear the last tapped notification
   */
  getLastTappedNotification() {
    const notification = this.lastTappedNotification;
    this.lastTappedNotification = null;
    return notification;
  }

  /**
   * Set a custom notification tap handler
   */
  setNotificationTapHandler(handler) {
    this.customTapHandler = handler;
    
    // Update the response listener to use the custom handler
    if (this.responseListener) {
      this.responseListener.remove();
    }
    
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(" Notification tapped:", response);
        const data = response.notification.request.content.data;
        
        if (this.customTapHandler) {
          this.customTapHandler(data);
        } else {
          this.handleNotificationTap(response.notification);
        }
      }
    );
  }

  /**
   * Clean up listeners
   */
  removeListeners() {
    if (this.notificationListener) {
      this.notificationListener.remove();
    }
    if (this.responseListener) {
      this.responseListener.remove();
    }
  }

  /**
   * Send a local notification (for testing)
   */
  async sendLocalNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error(" Error sending local notification:", error);
    }
  }

  /**
   * Get notification badge count
   */
  async getBadgeCount() {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count) {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications() {
    await Notifications.dismissAllNotificationsAsync();
  }
}

export default new PushNotificationService();

