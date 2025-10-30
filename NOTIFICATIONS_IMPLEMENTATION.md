# Notification System Implementation

## Overview
A complete in-app notification system has been implemented for both web and mobile platforms. This system follows industry-standard practices using Firebase Firestore for real-time notifications.

## Architecture

### Technology Stack
- **Database**: Firestore (`notifications` collection)
- **Real-time Updates**: Firestore `onSnapshot` listeners
- **Notifications**: In-app notifications (push notifications with FCM can be added later)

### Approach
We're using a **hybrid approach** with three layers:
1. **Firestore Storage** - Persistent notification history
2. **Real-time Listeners** - Instant in-app updates via Firestore snapshots
3. **FCM (Future)** - Can be added for push notifications when app is closed

---

## What Was Implemented

### 1. Backend & Database

#### Firestore Rules Updated
**File**: `firestore.rules`

Users can now:
- ✅ Read their own notifications
- ✅ Update their own notifications (mark as read)
- ✅ Delete their own notifications
- ✅ Admins have full access to all notifications

#### Notification Data Structure
```javascript
notifications/{notificationId}
  - userId: "user123"
  - type: "subscription_request" | "subscription_approved" | "subscription_rejected" | "subscription_extended"
  - title: "New Subscription Request"
  - message: "John Doe requested Basic Monthly subscription"
  - requestId: "request123" (optional)
  - subscriptionId: "sub123" (optional)
  - priority: "high" | "normal" | "low"
  - actionUrl: "/requests" (optional)
  - read: false
  - timestamp: serverTimestamp()
  - readAt: timestamp (when marked as read)
```

---

### 2. Web Application

#### Services Created/Updated

**File**: `web/src/services/notificationService.js` ✅ Enhanced
- `subscribeToNotifications(userId, callback)` - Real-time listener
- `createNotification(data)` - Create notification
- `markAsRead(notificationId)` - Mark single notification as read
- `markAllAsRead(userId)` - Mark all user notifications as read
- `deleteNotification(notificationId)` - Delete notification
- **NEW** `createSubscriptionRequestNotification()` - Notify admin about request
- **NEW** `createSubscriptionApprovedNotification()` - Notify user about approval
- **NEW** `createSubscriptionRejectedNotification()` - Notify user about rejection
- **NEW** `createSubscriptionExtendedNotification()` - Notify user about extension
- **NEW** `notifyAllAdmins()` - Send notifications to all admins

**File**: `web/src/components/hooks/useNotifications.js` ✅ Updated
- Now uses real Firestore data instead of mock data
- Real-time updates via `subscribeToNotifications()`
- Automatic cleanup on unmount

**File**: `web/src/components/ui/NotificationDropdown.jsx` ✅ Enhanced
- Added support for new notification types:
  - `subscription_request` (indigo badge)
  - `subscription_approved` (green badge)
  - `subscription_rejected` (red badge)
  - `subscription_extended` (purple badge)

**File**: `web/src/services/requestService.js` ✅ Integrated
- Sends notification to user when subscription is approved
- Sends notification to user when subscription is rejected

**File**: `web/src/services/subscriptionRequestListener.js` ✅ NEW
- Real-time listener for new subscription requests
- Automatically notifies all admins when new requests are created
- Starts when admin logs in, stops when admin logs out

**File**: `web/src/context/AuthProvider.jsx` ✅ Updated
- Starts subscription request listener when admin logs in
- Stops listener when admin logs out or on unmount

---

### 3. Mobile Application

#### Services Created

**File**: `mobile/src/services/notificationService.js` ✅ NEW
- Same API as web notification service
- Uses Firebase Firestore for mobile
- Handles all CRUD operations for notifications

**File**: `mobile/src/services/subscriptionService.js` ✅ Updated
- Creates pending subscription request
- Admin notifications are handled by the web app listener (see below)

#### Hooks Created

**File**: `mobile/src/hooks/notifications/useNotifications.js` ✅ NEW
- Real-time notification updates
- Mark as read functionality
- Delete notifications
- Get unread count

**File**: `mobile/src/hooks/notifications/index.js` ✅ NEW
- Exports `useNotifications` hook

#### UI Updated

**File**: `mobile/app/notifications.jsx` ✅ Updated
- Now uses real notification service instead of mock data
- Real-time updates via `useNotifications()` hook
- Proper timestamp formatting with `formatTimeAgo()`
- Mark as read functionality integrated

**File**: `mobile/src/services/index.js` ✅ Updated
- Exports `notificationService`

---

## Notification Flows

### Flow 1: User Requests Subscription (Mobile → Web)

```
1. User submits subscription request in mobile app
   ↓
2. Pending subscription created in Firestore
   ↓
3. Web app (admin side) detects new request via real-time listener
   ↓
4. Notification automatically created for ALL admins
   Type: "subscription_request"
   Message: "John Doe requested Basic Monthly"
   ↓
5. Admin sees notification in NotificationDropdown (web)
   - Bell icon shows unread count
   - Notification appears in dropdown
   - Clicking notification marks it as read
```

**Note**: Admin notifications are created on the web app side using a real-time listener. This approach avoids Firestore permission issues where clients cannot query for admin users.

### Flow 2: Admin Approves Subscription (Web → Mobile)

```
1. Admin approves subscription request in web app
   ↓
2. Subscription activated in Firestore
   ↓
3. Notification sent to user (mobile)
   Type: "subscription_approved"
   Message: "Your Basic Monthly subscription has been approved and is now active"
   ↓
4. User sees notification in mobile app
   - Can view in Notifications screen
   - Receives real-time update
   - Can mark as read
```

### Flow 3: Admin Rejects Subscription (Web → Mobile)

```
1. Admin rejects subscription request in web app
   ↓
2. Pending subscription marked as rejected
   ↓
3. Notification sent to user (mobile)
   Type: "subscription_rejected"
   Message: "Your Basic Monthly subscription request was not approved..."
   ↓
4. User sees notification in mobile app
```

---

## How to Use

### For Web Developers

#### Display Notification Bell in Navbar
```jsx
import { NotificationDropdown } from "@/components/ui";
import { useNotifications } from "@/components/hooks/useNotifications";

function Navbar() {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  return (
    <nav>
      {/* Your navbar content */}
      <NotificationDropdown
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
      />
    </nav>
  );
}
```

#### Send Custom Notification
```javascript
import notificationService from "@/services/notificationService";

// Send to specific user
await notificationService.createNotification({
  userId: "user123",
  type: "info",
  title: "New Feature Available",
  message: "Check out our new workout tracker!",
  priority: "normal",
});

// Send to all admins
await notificationService.notifyAllAdmins({
  type: "warning",
  title: "System Alert",
  message: "Server maintenance scheduled for tonight",
  priority: "high",
});
```

### For Mobile Developers

#### Display Notifications Screen
The notifications screen is already set up at `mobile/app/notifications.jsx`. Users can navigate to it from your app.

#### Use Notification Hook
```javascript
import { useNotifications } from "@/src/hooks/notifications/useNotifications";

function MyComponent() {
  const { 
    notifications, 
    loading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  return (
    <View>
      <Text>You have {unreadCount} unread notifications</Text>
      {/* Display notifications */}
    </View>
  );
}
```

#### Display Unread Badge
```javascript
import { useNotifications } from "@/src/hooks/notifications/useNotifications";

function TabBarIcon() {
  const { unreadCount } = useNotifications();

  return (
    <View>
      <Icon name="bell" />
      {unreadCount > 0 && (
        <Badge count={unreadCount} />
      )}
    </View>
  );
}
```

---

## Notification Types

| Type | Used For | Recipient | Color (Web) |
|------|----------|-----------|-------------|
| `subscription_request` | User requests subscription | Admins | Indigo |
| `subscription_approved` | Admin approves subscription | User | Green |
| `subscription_rejected` | Admin rejects subscription | User | Red |
| `subscription_extended` | Subscription extended | User | Purple |
| `checkin` | User checks in | Admins | Green |
| `checkout` | User checks out | Admins | Blue |
| `equipment` | Equipment maintenance | Admins | Orange |
| `warning` | System warnings | Admins/Users | Yellow |
| `info` | General info | Users | Blue |

---

## Future Enhancements (Not Implemented Yet)

### Phase 3: Firebase Cloud Messaging (FCM)
1. **Setup FCM** in Firebase Console
2. **Mobile**: Use `expo-notifications` library
3. **Web**: Use `firebase/messaging` for web push
4. **Store FCM tokens** in user documents
5. **Send push notifications** when app is closed/backgrounded

### Example FCM Implementation
```javascript
// Future: Send push notification
import { getMessaging, sendNotification } from 'firebase-admin/messaging';

async function sendPushNotification(userId, notification) {
  const userDoc = await firestore.collection('users').doc(userId).get();
  const fcmToken = userDoc.data().fcmToken;
  
  if (fcmToken) {
    await messaging.send({
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.message,
      },
      data: notification,
    });
  }
}
```

### Additional Features to Consider
- ✅ Notification preferences (which types to receive)
- ✅ Email notifications for critical events
- ✅ Notification history pagination
- ✅ Notification categories/filtering
- ✅ Sound/vibration settings
- ✅ Scheduled notifications
- ✅ Notification templates

---

## Testing

### Test the Implementation

1. **Create a subscription request** (Mobile)
   - Open mobile app
   - Request a subscription
   - Check that pending subscription is created

2. **Check admin notifications** (Web)
   - Login as admin
   - Look for notification bell icon
   - Should see "John Doe requested Basic Monthly"
   - Click to mark as read

3. **Approve subscription** (Web)
   - Go to Requests page
   - Approve the subscription request
   - Check that notification was sent

4. **Check user notification** (Mobile)
   - Open Notifications screen
   - Should see "Your subscription has been approved"
   - Tap to mark as read

---

## Files Modified/Created

### Web
- ✅ `web/src/services/notificationService.js` (Enhanced)
- ✅ `web/src/services/requestService.js` (Updated)
- ✅ `web/src/components/hooks/useNotifications.js` (Updated)
- ✅ `web/src/components/ui/NotificationDropdown.jsx` (Enhanced)
- ✅ `web/src/services/index.js` (Already exported)

### Mobile
- ✅ `mobile/src/services/notificationService.js` (NEW)
- ✅ `mobile/src/services/subscriptionService.js` (Updated)
- ✅ `mobile/src/hooks/notifications/useNotifications.js` (NEW)
- ✅ `mobile/src/hooks/notifications/index.js` (NEW)
- ✅ `mobile/app/notifications.jsx` (Updated)
- ✅ `mobile/src/services/index.js` (Updated)

### Backend
- ✅ `firestore.rules` (Updated)

---

## Summary

✅ **Firestore-based notification system** with real-time updates  
✅ **Subscription request notifications** to admins  
✅ **Subscription approval/rejection notifications** to users  
✅ **Web and mobile support** with consistent APIs  
✅ **Real-time listeners** for instant updates  
✅ **Mark as read/unread** functionality  
✅ **Delete notifications** capability  
✅ **Unread count badges**  
✅ **Scalable architecture** ready for FCM integration  

The system is production-ready for in-app notifications. FCM can be added later for push notifications when the app is in the background.

