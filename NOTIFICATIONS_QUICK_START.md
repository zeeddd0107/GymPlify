# Notifications System - Quick Start Guide

## 🎯 What Was Implemented

A **real-time in-app notification system** for both web and mobile that automatically notifies:
- **Admins** when users request subscriptions
- **Users** when their subscriptions are approved/rejected

---

## 🚀 Quick Test

### Test Flow (5 minutes)

1. **Mobile App** - Request a subscription as a user
2. **Web App** - Login as admin → See notification bell → Click to view request
3. **Web App** - Approve the subscription request  
4. **Mobile App** - Open Notifications screen → See approval notification

---

## 📱 For Mobile Users

### View Notifications
Navigate to the **Notifications** screen in your app to see:
- Subscription approval/rejection notifications
- Real-time updates (no need to refresh)
- Unread count badge
- "Mark all as read" button

### What You'll See
- ✅ "Your Basic Monthly subscription has been approved and is now active" (Green)
- ❌ "Your subscription request was not approved..." (Red)

---

## 💻 For Web Admins

### View Notifications
Look for the **bell icon** 🔔 in the navbar:
- Red badge shows unread count
- Click to open dropdown
- See all recent notifications
- "Mark all as read" option

### What You'll See
- 📋 "John Doe requested Basic Monthly" (Indigo)
- Click notification → Marks as read
- Click action URL → Navigate to Requests page

---

## 🔧 For Developers

### Web - Display Notification Bell
```jsx
import { NotificationDropdown } from "@/components/ui";
import { useNotifications } from "@/components/hooks/useNotifications";

function Navbar() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification } = 
    useNotifications();

  return (
    <NotificationDropdown
      notifications={notifications}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onDelete={deleteNotification}
    />
  );
}
```

### Mobile - Get Unread Count
```javascript
import { useNotifications } from "@/src/hooks/notifications/useNotifications";

function TabBar() {
  const { unreadCount } = useNotifications();
  
  return <Badge count={unreadCount} />;
}
```

### Send Custom Notification
```javascript
import notificationService from "@/services/notificationService";

// To specific user
await notificationService.createNotification({
  userId: "user123",
  type: "info",
  title: "Welcome!",
  message: "Thanks for joining GymPlify",
  priority: "normal",
});

// To all admins
await notificationService.notifyAllAdmins({
  type: "warning",
  title: "System Alert",
  message: "Server maintenance tonight at 11 PM",
  priority: "high",
});
```

---

## 📊 Notification Types

| Type | Icon | Color | When Used |
|------|------|-------|-----------|
| `subscription_request` | 📋 | Indigo | User requests subscription |
| `subscription_approved` | ✅ | Green | Admin approves subscription |
| `subscription_rejected` | ❌ | Red | Admin rejects subscription |
| `subscription_extended` | 🔄 | Purple | Subscription extended |

---

## ✅ What Works Now

- ✅ Real-time notifications (no refresh needed)
- ✅ Subscription request → Admin notification
- ✅ Subscription approval → User notification
- ✅ Subscription rejection → User notification
- ✅ Mark as read/unread
- ✅ Delete notifications
- ✅ Unread count badges
- ✅ Persistent notification history

---

## 🔮 Future Enhancement: Push Notifications

Currently implemented: **In-app notifications only** (when app is open)

To add push notifications (when app is closed):
1. Setup Firebase Cloud Messaging (FCM)
2. Mobile: Install `expo-notifications`
3. Web: Configure `firebase/messaging`
4. Store FCM tokens in user documents
5. Send push via Cloud Functions

**This can be added later without changing current implementation!**

---

## 🐛 Troubleshooting

### Notifications not showing?
1. Check Firestore rules are deployed
2. Verify user is authenticated
3. Check browser console for errors
4. Ensure `notifications` collection exists in Firestore

### Real-time updates not working?
1. Check internet connection
2. Verify Firestore listeners are active
3. Check cleanup on component unmount

### Admin not receiving notifications?
1. Verify user has `role: "admin"` in Firestore users collection
2. Check `notifyAllAdmins()` function logs

---

## 📚 Full Documentation

See `NOTIFICATIONS_IMPLEMENTATION.md` for complete technical details.

---

## 🎨 Customization Examples

### Change Notification Colors
Edit `web/src/components/ui/NotificationDropdown.jsx`:
```javascript
const getNotificationColor = (type) => {
  switch (type) {
    case "subscription_approved":
      return "text-green-600 bg-green-50"; // Change to your colors
    // ...
  }
};
```

### Add New Notification Type
1. Add type to `notificationService.js`
2. Add color/icon to `NotificationDropdown.jsx`
3. Use `createNotification()` with new type

---

## 🎉 You're All Set!

The notification system is ready to use. Test it out and enjoy real-time updates! 🚀

