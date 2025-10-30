# Debug: Mobile Notifications Not Showing

## 🔍 Step-by-Step Debugging

I've added comprehensive logging. Follow these steps:

### Step 1: Check Mobile Console Logs

**Open Metro console** (where you run the mobile app) and look for these logs:

#### When app starts/user logs in:
```
📡 useNotifications: Subscribing to notifications for user: [USER_ID]
📡 NotificationService: Setting up listener for userId: [USER_ID]
```

#### When listener receives data:
```
🔔 NotificationService: Snapshot received, docs: [NUMBER]
📋 Notification: { id: '...', type: '...', title: '...', userId: '...' }
🔔 useNotifications: Received notifications: [NUMBER]
```

**If you DON'T see these logs:**
- The hook isn't being called
- User might not be logged in properly

---

### Step 2: Test Subscription Approval

1. **Mobile App**: Request a subscription
2. **Web App**: Approve the subscription
3. **Web Browser Console**: Should show:
   ```
   📝 Creating approval notification for: { userId: '...', subscriptionName: '...', ... }
   📝 Creating notification: { userId: '...', type: 'subscription_approved', ... }
   ✅ Notification created with ID: [NOTIFICATION_ID]
   ✅ User notification sent for subscription approval
   ```

4. **Mobile Console**: Should immediately show:
   ```
   🔔 NotificationService: Snapshot received, docs: 1
   📋 Notification: { id: '...', type: 'subscription_approved', ... }
   🔔 useNotifications: Received notifications: 1
   ```

---

### Step 3: Check Firestore Directly

1. Go to **Firebase Console** → **Firestore Database**
2. Open `notifications` collection
3. Look for a document with:
   - `userId`: Should match the mobile user's UID
   - `type`: "subscription_approved"
   - `read`: false
   - `timestamp`: Recent

**If notification exists but mobile not showing:**
- The userId might not match
- Firestore listener might have an issue

---

### Step 4: Verify User IDs Match

#### In Mobile Console, find:
```
📡 useNotifications: Subscribing to notifications for user: [MOBILE_USER_ID]
```

#### In Web Console, find:
```
📝 Creating approval notification for: { userId: '[WEB_USER_ID]', ... }
```

**Do they match?**
- ✅ **YES** → Continue to Step 5
- ❌ **NO** → THIS IS THE PROBLEM!

---

### Step 5: Check for Firestore Index

If you see an error like:
```
❌ Error subscribing to notifications: [FirebaseError: The query requires an index...]
```

**Solution:**
1. Click the link in the error message
2. Firebase will create the index automatically
3. Wait 2-3 minutes for index to build
4. Restart mobile app

---

## 🐛 Common Issues

### Issue 1: User IDs Don't Match

**Problem:** Web creates notification for `userId: "abc123"`, but mobile listens for `userId: "xyz789"`

**How to check:**
- Mobile: `console.log("User ID:", user.uid)` in useNotifications hook
- Web: Check the `requestData.userId` when approving

**Fix:** Make sure you're using the same user account that requested the subscription

---

### Issue 2: Firestore Index Missing

**Problem:** Query needs an index for `userId` + `orderBy timestamp`

**Solution:**
```bash
# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

Or click the link in the error message.

---

### Issue 3: Listener Not Starting

**Problem:** Mobile console shows:
```
⚠️ useNotifications: No user.uid available
```

**Fix:** User isn't logged in properly. Check AuthContext.

---

### Issue 4: Permission Denied

**Problem:** Console shows:
```
❌ Error subscribing to notifications: [FirebaseError: Missing or insufficient permissions]
```

**Check Firestore Rules:**
```javascript
match /notifications/{notificationId} {
  allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
  allow create: if isAuthenticated();
}
```

**Fix:**
```bash
firebase deploy --only firestore:rules
```

---

## ✅ Success Checklist

After fixing, you should see:

### Mobile Console:
```
📡 useNotifications: Subscribing to notifications for user: oGTvmKu0WYgUNwaHbsgFnRqbwL02
📡 NotificationService: Setting up listener for userId: oGTvmKu0WYgUNwaHbsgFnRqbwL02
🔔 NotificationService: Snapshot received, docs: 1
📋 Notification: {
  id: 'xyz123',
  type: 'subscription_approved',
  title: 'Subscription Approved! 🎉',
  userId: 'oGTvmKu0WYgUNwaHbsgFnRqbwL02'
}
🔔 useNotifications: Received notifications: 1
```

### Web Console:
```
📝 Creating approval notification for: {
  userId: 'oGTvmKu0WYgUNwaHbsgFnRqbwL02',
  subscriptionName: 'Basic Monthly',
  subscriptionId: 'sub123'
}
✅ Notification created with ID: notif123
✅ User notification sent for subscription approval
```

### Firestore Database:
```
notifications/notif123
  userId: "oGTvmKu0WYgUNwaHbsgFnRqbwL02"
  type: "subscription_approved"
  title: "Subscription Approved! 🎉"
  message: "Your Basic Monthly subscription has been approved..."
  read: false
  timestamp: [recent]
```

---

## 🎯 What to Share

Please share these logs:

1. **Mobile console output** (when you open the app)
2. **Web console output** (when you approve)
3. **Firestore screenshot** of the notifications collection
4. **Any error messages**

This will help identify exactly where the issue is!

