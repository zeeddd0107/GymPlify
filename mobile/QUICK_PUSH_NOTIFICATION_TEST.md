# 🚀 Quick Push Notification Testing Guide

## ✅ No Prebuild Required!

Push notifications work with **Expo Go** on physical devices. Follow these simple steps:

---

## Step 1: Start the App

```bash
cd mobile
npx expo start
```

---

## Step 2: Open on Physical Device

1. **Android:**
   - Install **Expo Go** from Google Play Store
   - Scan the QR code from the terminal

2. **iOS:**
   - Install **Expo Go** from App Store
   - Scan the QR code from the terminal

⚠️ **MUST USE PHYSICAL DEVICE** - Simulators/emulators don't support push notifications!

---

## Step 3: Login & Grant Permission

1. Log in with a user account
2. You'll see a permission dialog
3. **Tap "Allow"** to grant notification permissions
4. Check the Metro Bundler console for:
   ```
   ✅ Push notification permission granted
   ✅ Expo Push Token: ExponentPushToken[xxxxx]
   ✅ Push token stored in Firestore
   ```

---

## Step 4: Verify Token in Firestore

1. Open Firebase Console → Firestore Database
2. Navigate to `users` collection
3. Find your user document (search by email)
4. Verify it has a `pushToken` field with value like: `ExponentPushToken[xxxxx]`

✅ If you see this, push notifications are ready to work!

---

## Step 5: Test - App in Foreground

1. **Keep mobile app OPEN** (stay on any screen)
2. **On web (as admin):**
   - Go to Requests page
   - Approve a pending subscription request
3. **Watch web browser console:**
   ```
   📝 Creating notification: {...}
   📤 Sending push notification to: ExponentPushToken[xxxxx]
   ✅ Push notification sent successfully
   ```
4. **Mobile should show:**
   - A notification banner at the top of the screen
   - Notification appears in the Notifications screen

✅ **Success!** Foreground notifications are working!

---

## Step 6: Test - App in Background

1. **Put mobile app in BACKGROUND:**
   - Press the Home button (don't swipe away)
   - App is running but not visible
2. **On web (as admin):**
   - Approve another subscription request
3. **Mobile should show:**
   - System notification in notification tray
   - Sound/vibration (if enabled)
4. **Tap the notification:**
   - App opens
   - Navigates to Subscriptions screen

✅ **Success!** Background notifications are working!

---

## Step 7: Test - App Closed

1. **CLOSE the mobile app COMPLETELY:**
   - Open recent apps (swipe up on Android, double-tap home on iOS)
   - Swipe away the app to close it
2. **On web (as admin):**
   - Approve another subscription request
3. **Mobile should show:**
   - System notification in notification tray
4. **Tap the notification:**
   - App launches
   - Navigates to Subscriptions screen

✅ **Success!** All push notification scenarios are working!

---

## Step 8: Test Badge Count

1. **Receive a few notifications** (repeat Step 7 a few times)
2. **Check the app icon:**
   - Should show a badge with the number of unread notifications
3. **Open app → Go to Notifications screen**
4. **Mark notifications as read:**
   - Tap on a notification to mark it as read
   - OR tap "Mark All as Read"
5. **Check badge again:**
   - Badge count should decrease
   - When all are read, badge should disappear

✅ **Success!** Badge management is working!

---

## 📊 What to Look For

### Web Console (Admin)
```
📝 Creating notification: {userId: "xxx", type: "subscription_approved", ...}
✅ Notification created with ID: xyz
📤 Sending push notification to: ExponentPushToken[xxxxx]
✅ Push notification sent successfully
```

### Mobile Console (User)
```
✅ Push notification permission granted
✅ Expo Push Token: ExponentPushToken[xxxxx]
✅ Push token stored in Firestore
🔔 Notification received in foreground
👆 Notification tapped
🔔 Notification tapped, navigating based on type: subscription_approved
```

---

## ❌ Troubleshooting

### "No permission dialog appears"
- Force close the app and reopen it
- Check device Settings → Apps → Expo Go → Notifications are enabled

### "Cannot get push token on simulator"
- You MUST use a physical device
- Simulators/emulators don't support push notifications

### "No push token found for user"
- Make sure you logged in on mobile app
- Check Firestore → users/{userId} has `pushToken` field
- Try logging out and back in

### "Push notification sent but not received"
- Check Expo status: https://status.expo.dev/
- Verify token format starts with `ExponentPushToken[`
- Make sure device has internet connection
- Check device notification settings

### "Notification received but doesn't navigate"
- Check mobile console for "👆 Notification tapped" log
- Verify the notification `type` field is set correctly

---

## 🎉 Success Criteria

You'll know push notifications are fully working when:

- ✅ Permission granted on mobile
- ✅ Push token saved to Firestore
- ✅ Web console shows "Push notification sent successfully"
- ✅ Notification appears when app is open (foreground)
- ✅ Notification appears when app is in background
- ✅ Notification appears when app is closed
- ✅ Tapping notification navigates to correct screen
- ✅ Badge count updates correctly
- ✅ All notifications visible in Notifications screen

---

## 🚀 Next Steps After Testing

Once everything works with Expo Go:

1. **For Development Builds:**
   - Get `google-services.json` from Firebase Console
   - Place it in `mobile/google-services.json`
   - Update `app.json` to include `"googleServicesFile": "./google-services.json"`
   - Run `npx expo prebuild` and `npx expo run:android`

2. **For Production:**
   - Build standalone app with EAS Build
   - Push notifications will continue to work seamlessly

---

## 💡 Tips

- Test with a real subscription request flow for the most realistic test
- Keep both web and mobile consoles visible to see the full flow
- Test on both WiFi and mobile data
- Try different notification types if you add more later

---

## 📞 Need Help?

If something isn't working:
1. Check BOTH console logs (web and mobile)
2. Verify Firestore has the push token
3. Make sure you're using a physical device
4. Try the Expo Push Notification tool: https://expo.dev/notifications

---

**Ready to test!** Just run `npx expo start` in the mobile directory and follow the steps above! 🎉




