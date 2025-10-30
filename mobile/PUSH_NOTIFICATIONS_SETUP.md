# 📱 Push Notifications Setup Guide

## Overview

This guide explains the push notification system for GymPlify mobile app. The system is built using **Expo Notifications** and integrates with Firebase Firestore for notification storage.

---

## 🏗️ Architecture

### Flow Diagram

```
User Action (Web) → Firestore Notification → Push Notification (Expo) → Mobile Device
```

### Components

1. **Mobile App (`pushNotificationService.js`)**
   - Requests notification permissions
   - Registers device with Expo Push Notifications
   - Stores push token in Firestore
   - Handles incoming notifications
   - Manages notification taps and navigation

2. **Web App (`notificationService.js`)**
   - Creates Firestore notification documents
   - Retrieves user's push token from Firestore
   - Sends push notifications via Expo Push API

3. **Firestore Collections**
   - `notifications`: Stores in-app notification history
   - `users`: Stores user's `pushToken` field

---

## 🚀 Setup Instructions

### 1. Mobile App Configuration

The mobile app is already configured in `app.json`:

```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/images/icon.png",
        "color": "#FF6B6B",
        "sounds": ["./assets/notification.wav"]
      }
    ]
  ]
}
```

### 2. Android Setup (Required for Physical Device Testing)

For Android, you need the `google-services.json` file:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **General**
4. Scroll to **Your apps** → Select Android app (or add one if not exists)
5. Download `google-services.json`
6. Place it in `mobile/google-services.json`

### 3. iOS Setup (Required for iOS Testing)

For iOS, you need the `GoogleService-Info.plist` file:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **General**
4. Scroll to **Your apps** → Select iOS app (or add one if not exists)
5. Download `GoogleService-Info.plist`
6. Place it in `mobile/GoogleService-Info.plist`

Additionally, you need to configure APNs (Apple Push Notification service):
1. In Firebase Console, go to **Project Settings** → **Cloud Messaging**
2. Under **iOS app configuration**, upload your APNs authentication key

---

## 📝 How It Works

### 1. User Login (Mobile)

When a user logs into the mobile app:

```javascript
// AuthProvider.jsx
pushNotificationService.registerForPushNotifications(userId)
```

This:
- Requests notification permission from user
- Gets an Expo Push Token (e.g., `ExponentPushToken[xxx]`)
- Stores the token in Firestore: `users/{userId}.pushToken`

### 2. Admin Approves Subscription (Web)

When an admin approves a subscription:

```javascript
// requestService.js
await notificationService.createSubscriptionApprovedNotification(
  userId,
  subscriptionName,
  subscriptionId
);
```

This creates:
1. **Firestore notification document** (for in-app notification list)
2. **Push notification** sent via Expo Push API (for device notification)

### 3. User Receives Notification (Mobile)

The mobile device receives the notification in three scenarios:

#### A. App in Foreground
- Shows as banner at top of screen
- Handled by `Notifications.setNotificationHandler()`

#### B. App in Background
- Shows as system notification
- Tapping opens the app

#### C. App Closed
- Shows as system notification
- Tapping opens the app

When tapped, the app navigates based on notification type:
```javascript
// _layout.jsx
switch (data.type) {
  case "subscription_approved":
    router.push("/subscriptions");
    break;
  default:
    router.push("/notifications");
}
```

---

## 🧪 Testing Push Notifications

### Prerequisites
- **Physical device** (Android or iOS) - Simulators/emulators don't support push notifications
- Expo Go app OR Development build

### Testing Steps

#### 1. Test In-App Notifications First
Before testing push notifications, verify in-app notifications work:

1. Log in as a user on mobile
2. Request a subscription
3. Log in as admin on web
4. Approve the subscription
5. Check if notification appears in mobile app's notification screen

✅ **If this works**, proceed to push notification testing.

#### 2. Enable Push Notifications on Mobile

1. **Close and restart the mobile app**
2. On first launch after login, you should see a permission dialog
3. **Grant notification permission**
4. Check the console for:
   ```
   ✅ Push notification permission granted
   ✅ Expo Push Token: ExponentPushToken[xxx]
   ✅ Push token stored in Firestore
   ```

#### 3. Verify Token in Firestore

1. Open Firebase Console → Firestore Database
2. Go to `users` collection → Find your user document
3. Verify it has a `pushToken` field with value like `ExponentPushToken[xxx]`

#### 4. Test Push Notification - Foreground

1. Keep mobile app **open** and on any screen
2. On web (as admin), approve a subscription request
3. Watch web console for:
   ```
   📝 Creating notification: {...}
   📤 Sending push notification to: ExponentPushToken[xxx]
   ✅ Push notification sent successfully
   ```
4. Mobile should show notification banner at top

#### 5. Test Push Notification - Background

1. Put mobile app in **background** (press Home button, don't close)
2. On web (as admin), approve another subscription request
3. Mobile should show system notification
4. Tap notification → App should open and navigate to subscriptions screen

#### 6. Test Push Notification - App Closed

1. **Close the mobile app completely** (swipe away from recent apps)
2. On web (as admin), approve another subscription request
3. Mobile should show system notification
4. Tap notification → App should launch and navigate to subscriptions screen

---

## 🔧 Troubleshooting

### Problem: No permission dialog appears

**Solution:**
- Uninstall and reinstall the app
- Check device settings → Apps → GymPlify → Notifications are allowed

### Problem: Console shows "Cannot get push token on simulator/emulator"

**Solution:**
- Push notifications only work on **physical devices**
- Use a real Android or iOS device for testing

### Problem: Push token not saving to Firestore

**Solution:**
- Check Firestore rules allow `users/{userId}` updates
- Check console for errors
- Verify user is logged in (`user.id` exists)

### Problem: Web shows "No push token found for user"

**Solution:**
- User must log in to mobile app at least once
- Check Firestore → `users/{userId}` has `pushToken` field
- Try logging out and back in on mobile

### Problem: Push notification fails with error

**Solutions:**
- Verify token format: must start with `ExponentPushToken[`
- Check Expo status: [https://status.expo.dev/](https://status.expo.dev/)
- Verify `projectId` in `pushNotificationService.js` matches your Expo project

### Problem: Notification received but app doesn't navigate

**Solution:**
- Check `_layout.jsx` has notification tap handler
- Check console for "🔔 Notification tapped" log
- Verify notification data includes `type` field

---

## 🎨 Customization

### Change Notification Sound

1. Add your custom sound file to `mobile/assets/sounds/notification.wav`
2. Update `app.json`:
   ```json
   {
     "plugins": [
       [
         "expo-notifications",
         {
           "sounds": ["./assets/sounds/notification.wav"]
         }
       ]
     ]
   }
   ```

### Change Notification Icon (Android)

1. Create a white icon on transparent background
2. Save as `notification-icon.png` in `mobile/assets/images/`
3. Update `app.json`:
   ```json
   {
     "plugins": [
       [
         "expo-notifications",
         {
           "icon": "./assets/images/notification-icon.png"
         }
       ]
     ]
   }
   ```

### Add New Notification Types

1. **Web side** - Add new notification method:
   ```javascript
   // web/src/services/notificationService.js
   async createSessionReminderNotification(userId, sessionName, sessionTime) {
     return this.createNotification({
       userId,
       type: "session_reminder",
       title: "Session Reminder",
       message: `Your ${sessionName} session starts at ${sessionTime}`,
       priority: "high",
     });
   }
   ```

2. **Mobile side** - Add navigation case:
   ```javascript
   // mobile/app/_layout.jsx
   case "session_reminder":
     router.push("/(tabs)/sessions");
     break;
   ```

---

## 📊 Notification Badge Count

The app automatically manages the notification badge:
- Badge shows number of **unread** notifications
- Badge updates in real-time
- Badge clears when notifications are marked as read

This is handled in `useNotifications.js`:
```javascript
useEffect(() => {
  pushNotificationService.setBadgeCount(unreadCount);
}, [unreadCount]);
```

---

## 🔒 Security

### Push Token Security

- Push tokens are **not sensitive** - they only allow sending notifications to a specific device
- Tokens are stored in Firestore with user document (protected by Firestore rules)
- Tokens are removed on logout

### Firestore Rules

Ensure your `firestore.rules` allows:
```
match /users/{userId} {
  allow read, update: if request.auth.uid == userId;
}

match /notifications/{notificationId} {
  allow read: if request.auth.uid == resource.data.userId;
  allow create: if isAuthenticated();
}
```

---

## 🚀 Production Deployment

### For Expo Go (Development)

Push notifications work with Expo Go using Expo Push Notification service.

### For Standalone App (Production)

When building for production:

1. **Android:**
   - Ensure `google-services.json` is included
   - Build with EAS Build: `eas build --platform android`

2. **iOS:**
   - Ensure `GoogleService-Info.plist` is included
   - Configure APNs in Firebase Console
   - Build with EAS Build: `eas build --platform ios`

---

## 📚 Additional Resources

- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Expo Push Notification Tool (for testing)](https://expo.dev/notifications)

---

## ✅ Checklist

Before considering push notifications complete:

- [ ] Mobile app requests permission on login
- [ ] Push token stored in Firestore `users` collection
- [ ] Web app can send push notifications
- [ ] Notifications received when app is open
- [ ] Notifications received when app is in background
- [ ] Notifications received when app is closed
- [ ] Tapping notification navigates to correct screen
- [ ] Notification badge count updates correctly
- [ ] Tested on physical Android device
- [ ] Tested on physical iOS device (if applicable)

---

## 💡 Notes

- Push notifications only work on **physical devices** (not simulators/emulators)
- The Expo Push Token is device-specific - logging in on a different device will generate a new token
- Multiple devices can have tokens for the same user
- Old tokens should be cleaned up when devices haven't been used for a while (optional enhancement)

---

**Need Help?**
Check the console logs - they're very detailed and will help you identify any issues!




