# Notification System Testing Guide

## 🧪 How to Test the Notification System

### Prerequisites
1. **Web app running** - Admin logged in
2. **Mobile app running** - User logged in
3. **Browser console open** (F12) on web app

---

## Test 1: Subscription Request Notification (Mobile → Web)

### Steps:
1. **Web App (Admin)**
   - Login as admin
   - Open browser console (F12)
   - Look for: `"📡 Started listening for subscription requests"`
   - Look for: `"📡 Subscription request listener initialized, monitoring for new requests..."`

2. **Mobile App (User)**
   - Request a subscription (any plan)
   - Watch the console

3. **Mobile Console** - Should show:
   ```
   ✅ Pending subscription created: [ID]
   ✅ Subscription request created - admins will be notified via web app
   ```

4. **Web Browser Console** - Should show:
   ```
   🔔 New subscription request detected: [ID]
   ✅ Admin notified about new subscription request: [ID]
   ```

5. **Web App (Admin)**
   - Click the bell icon 🔔 in navbar
   - Should see notification: "John Doe requested [Plan Name]"

### ❌ If Not Working:
- **No listener started?** → Refresh the web page and check console again
- **No detection?** → The listener might need to be restarted. Logout and login again as admin.
- **Permission error?** → Check Firestore rules are deployed

---

## Test 2: Subscription Approval Notification (Web → Mobile)

### Steps:
1. **Web App (Admin)**
   - Go to Requests page
   - Approve a pending subscription request
   - Open browser console

2. **Web Browser Console** - Should show:
   ```
   ✅ User notification sent for subscription approval
   ```

3. **Mobile App (User)**
   - Go to Notifications screen
   - Should see: "Your [Plan Name] subscription has been approved and is now active"

### ❌ If Not Working:
- **No console log?** → Check browser console for errors
- **Permission error?** → Check Firestore rules allow creating notifications
- **Mobile not showing?** → Check if `useNotifications` hook is working

---

## Debugging Checklist

### Web App
- [ ] Admin is logged in
- [ ] Console shows listener started: `"📡 Started listening for subscription requests"`
- [ ] Console shows listener initialized: `"📡 Subscription request listener initialized..."`
- [ ] No errors in console
- [ ] Firestore rules are deployed

### Mobile App
- [ ] User is logged in
- [ ] Can create subscription requests successfully
- [ ] Console shows success messages
- [ ] No permission errors

### Firestore
- [ ] Check `notifications` collection exists in Firestore console
- [ ] Check rules allow authenticated users to create notifications
- [ ] Check if notifications are actually being created

---

## Manual Test: Create Notification Directly

### Test in Browser Console (Web App as Admin):

```javascript
// Import the notification service (if available in console)
// Otherwise, create a test notification via Firestore

const testNotification = {
  userId: "YOUR_USER_ID", // Replace with actual user ID from mobile
  type: "subscription_approved",
  title: "Test Notification",
  message: "This is a test notification",
  priority: "high",
  timestamp: new Date(),
  read: false
};

// Add to Firestore manually
// Then check mobile app notifications screen
```

---

## Common Issues

### Issue 1: Admin not receiving notifications
**Cause**: Listener not started or skipped first load
**Solution**: 
1. Refresh web page
2. Logout and login again
3. Check browser console for `"📡 Started listening"`

### Issue 2: User not receiving approval notifications
**Cause**: Permission errors or notification not created
**Solution**:
1. Check browser console for errors when approving
2. Check Firestore `notifications` collection
3. Verify notification was created with correct userId

### Issue 3: Notifications not showing in UI
**Cause**: Real-time listener not working
**Solution**:
1. Check `useNotifications` hook is being called
2. Verify Firestore listener is active
3. Check user.uid matches notification userId

---

## Firestore Console Verification

1. Go to Firebase Console → Firestore Database
2. Check `notifications` collection
3. Verify documents are being created with:
   - Correct `userId`
   - Correct `type` ("subscription_request", "subscription_approved", etc.)
   - `read: false`
   - `timestamp` field

---

## Success Criteria

✅ **Mobile → Web**: Admin receives notification within 1-2 seconds of user requesting subscription
✅ **Web → Mobile**: User receives notification within 1-2 seconds of admin approving
✅ **Both**: Notifications appear in UI
✅ **Both**: Mark as read works
✅ **Both**: Unread count updates

---

## Quick Debug Commands

### Check Firestore Notifications (Firebase CLI)
```bash
firebase firestore:get notifications --limit 5
```

### Check Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Force Refresh Web App
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear cache and reload

---

If issues persist, check the browser console and mobile console for specific error messages.

