# Troubleshooting Subscription Expiry Notifications

## Issue: Notifications Not Showing in Mobile App

### ✅ What Was Fixed

1. **Cloud Functions Deployed**
   - `checkSubscriptionExpiry` - Scheduled daily at 9 AM UTC
   - `checkSubscriptionExpiryManual` - Manual test endpoint
   - Both functions are working and sending notifications

2. **Mobile App Updated**
   - Added icons and colors for `subscription_expiring_soon` and `subscription_expired` notification types
   - Notification tap handler is set up to navigate to `/subscriptions`

3. **Notifications Sent Successfully**
   - 4 notifications were sent during testing:
     - Syd Recs - 2 days remaining
     - Jazz - 1 day remaining
     - Tatiana Gallardo - 2 days remaining  
     - Syd Recs - 1 day remaining

### 🔍 How to Verify Notifications Are Working

#### 1. Check Firestore Console

Go to Firebase Console → Firestore → `notifications` collection

Look for notifications with:
- `type: "subscription_expiring_soon"` or `type: "subscription_expired"`
- Recent `timestamp` field
- Correct `userId`

#### 2. Check Mobile App Console Logs

Look for these logs in the mobile app:
```
📡 NotificationService: Setting up listener for userId: [userId]
🔔 NotificationService: Snapshot received, docs: [count]
🔔 useNotifications: Received notifications: [count]
```

#### 3. Check Notification Service Logs

If notifications are created but not showing, check:
- `📬 New notification - triggering LOCAL push`
- `⏭️ Notification received while app in background`
- `⏭️ Notification already notified, skipping push`

### 🐛 Common Issues

#### Issue 1: Notifications Created but Not Showing in App

**Possible Causes:**
- Firestore index missing (check Firebase Console for index errors)
- User ID mismatch (`user.uid` vs `user.id`)
- Timestamp field missing or null
- Listener not set up correctly

**Solution:**
1. Check Firebase Console → Firestore → Indexes
2. Check if there's an error in the query
3. Verify `userId` matches between notification and user document
4. Check mobile app console logs for errors

#### Issue 2: Notifications Appear Then Disappear

**Possible Causes:**
- App refresh/reset clears notification state
- Notifications being deleted
- Firestore listener disconnecting

**Solution:**
1. Check if notifications still exist in Firestore
2. Verify the listener is still active (check console logs)
3. Check if there's any code deleting notifications

#### Issue 3: Push Notifications Not Showing

**Possible Causes:**
- FCM token missing or invalid
- App permission not granted
- Notification handler not set up

**Solution:**
1. Check Firestore → `users/{userId}` → `fcmToken` field exists
2. Check app notification permissions
3. Verify `pushNotificationService` is initialized

### 📋 Testing Steps

#### Test 1: Reset and Resend Notifications

```bash
# 1. Reset notification tracking
cd backend/scripts
node resetExpiryNotifications.js

# 2. Trigger manual function
# In PowerShell:
Invoke-WebRequest -Uri "https://us-central1-gymplify-554c8.cloudfunctions.net/checkSubscriptionExpiryManual" -Method POST
```

#### Test 2: Check Specific User's Notifications

1. Go to Firebase Console → Firestore
2. Open `notifications` collection
3. Filter by `userId` (e.g., `jeclvp6TXgXSXYFiMHSN5DF5Sv12` for Syd Recs)
4. Check if notification documents exist with recent timestamps

#### Test 3: Check Mobile App

1. Open mobile app
2. Go to Notifications screen
3. Check console logs for:
   - `📡 useNotifications: Subscribing to notifications`
   - `🔔 useNotifications: Received notifications: [count]`
4. Pull down to refresh notifications

### 🔧 Manual Verification

#### Check if Notification Exists in Firestore

```javascript
// In Firebase Console → Firestore → Run this query:
db.collection("notifications")
  .where("type", "in", ["subscription_expiring_soon", "subscription_expired"])
  .where("timestamp", ">", new Date(Date.now() - 24 * 60 * 60 * 1000))
  .get()
```

#### Check User's FCM Token

```javascript
// In Firebase Console → Firestore:
db.collection("users")
  .doc("[userId]")
  .get()
  // Check if fcmToken field exists and is not empty
```

### ✅ Expected Behavior

1. **When subscription expires or is about to expire:**
   - Notification document created in Firestore `notifications` collection
   - Push notification sent via FCM (if app is in background)
   - Local notification shown (if app is in foreground)
   - Notification appears in mobile app's Notifications screen

2. **Notification Details:**
   - Type: `subscription_expiring_soon` or `subscription_expired`
   - Icon: ⏰ (time-outline) or ⚠️ (warning)
   - Color: Orange (#f59e0b) or Red (#ef4444)
   - Tap action: Navigates to `/subscriptions` screen

### 🆘 Still Not Working?

1. **Check Firebase Console Logs:**
   - Functions → Logs → `checkSubscriptionExpiryManual`
   - Look for errors or warnings

2. **Check Mobile App Logs:**
   - Look for any error messages
   - Check if listener is connecting properly

3. **Verify Firestore Rules:**
   - Ensure users can read their own notifications
   - Check if there are any permission errors

4. **Check Subscription Status:**
   - Verify subscriptions have `status: "active"`
   - Verify subscriptions have `endDate` field
   - Verify `lastExpiryNotification` is reset if testing

### 📞 Debugging Checklist

- [ ] Cloud Functions deployed successfully
- [ ] Notifications created in Firestore
- [ ] User has FCM token in their user document
- [ ] Mobile app notification listener is active
- [ ] No Firestore index errors
- [ ] User ID matches between notification and user
- [ ] Notification timestamp is valid
- [ ] App has notification permissions
- [ ] Console logs show notifications being received

