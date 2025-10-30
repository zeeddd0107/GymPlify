# Subscription Expiry Notifications Guide

## Overview

Automated push and in-app notifications are sent when subscriptions are about to expire (3, 2, 1 days remaining) and when they expire.

## Features

- ✅ **Push notifications** via FCM (Firebase Cloud Messaging)
- ✅ **In-app notifications** via Firestore notifications collection
- ✅ **Daily automated check** at 9:00 AM UTC
- ✅ **Duplicate prevention** - tracks which notifications have been sent

## Cloud Functions

### 1. Scheduled Function: `checkSubscriptionExpiry`
- **Schedule**: Daily at 9:00 AM UTC (`"0 9 * * *"`)
- **Purpose**: Automatically checks all active subscriptions and sends notifications

### 2. Manual Test Function: `checkSubscriptionExpiryManual`
- **Type**: HTTP endpoint
- **Purpose**: Test the expiry check manually without waiting for scheduled time
- **Usage**: 
  ```bash
  # Get your function URL from Firebase Console
  curl -X POST https://[region]-[project].cloudfunctions.net/checkSubscriptionExpiryManual
  ```

## Deployment

### Step 1: Deploy Cloud Functions

```bash
cd functions
npm install  # Make sure dependencies are installed
firebase deploy --only functions:checkSubscriptionExpiry,functions:checkSubscriptionExpiryManual
```

### Step 2: Verify Deployment

1. Go to Firebase Console → Functions
2. Look for `checkSubscriptionExpiry` (scheduled) and `checkSubscriptionExpiryManual` (HTTP)
3. Check logs to see if scheduled function is running

## Testing

### Option 1: Manual Test (Recommended for Testing)

1. **Get your function URL**:
   - Firebase Console → Functions → `checkSubscriptionExpiryManual`
   - Copy the URL

2. **Call the function**:
   ```bash
   curl -X POST https://[region]-[project].cloudfunctions.net/checkSubscriptionExpiryManual
   ```
   
   Or use a browser:
   - Open the URL in browser (GET request works too)
   - Check the response JSON

3. **Check logs**:
   - Firebase Console → Functions → Logs
   - Look for: `🔔 Manual subscription expiry check triggered...`
   - Check: `📋 Checking subscription...` logs for each subscription

### Option 2: Wait for Scheduled Run

- Function runs daily at 9:00 AM UTC
- Check Firebase Console → Functions → Logs after 9 AM UTC

### Option 3: Test with Specific Subscription

1. Find a subscription that expires in 3, 2, or 1 days
2. Temporarily modify the subscription's `endDate` in Firestore to test
3. Call the manual function
4. Check if notification is created

## Notification Types

### 3 Days Remaining
- **Type**: `subscription_expiring_soon`
- **Title**: "Subscription Expiring Soon ⏰"
- **Message**: "Your [Plan Name] subscription expires in 3 days. Renew now to continue enjoying gym services."

### 2 Days Remaining
- **Type**: `subscription_expiring_soon`
- **Title**: "Subscription Expiring Soon ⏰"
- **Message**: "Your [Plan Name] subscription expires in 2 days. Renew now to continue enjoying gym services."

### 1 Day Remaining
- **Type**: `subscription_expiring_soon`
- **Title**: "Subscription Expiring Tomorrow ⏰"
- **Message**: "Your [Plan Name] subscription expires in 1 day. Renew now to avoid interruption."

### Expired
- **Type**: `subscription_expired`
- **Title**: "Subscription Expired ⚠️"
- **Message**: "Your [Plan Name] subscription has expired. Please renew to continue using gym services."

## How It Works

1. **Daily Check**: Cloud Function runs at 9 AM UTC
2. **Query Active Subscriptions**: Gets all subscriptions with `status: "active"`
3. **Calculate Remaining Days**: Uses start-of-day comparison for accuracy
4. **Check Thresholds**: Checks if subscription has 3, 2, 1 days remaining or is expired
5. **Duplicate Prevention**: Checks `lastExpiryNotification.daysRemaining` on subscription document
6. **Send Notification**: Creates Firestore notification document
7. **Trigger Push**: `sendPushNotification` Cloud Function automatically sends FCM push
8. **Track Sent**: Updates subscription with `lastExpiryNotification` to prevent duplicates

## Troubleshooting

### No Notifications Being Sent

1. **Check if function is deployed**:
   ```bash
   firebase functions:list
   ```

2. **Check function logs**:
   ```bash
   firebase functions:log --only checkSubscriptionExpiry
   ```

3. **Verify subscriptions exist**:
   - Check Firestore → subscriptions collection
   - Ensure subscriptions have `status: "active"`
   - Ensure subscriptions have `endDate` field

4. **Check notification tracking**:
   - Look at subscription documents
   - Check `lastExpiryNotification` field
   - If it exists, notification was already sent for that threshold

5. **Test manually**:
   - Use `checkSubscriptionExpiryManual` HTTP function
   - Check the response JSON for details

### Notifications Not Showing in Mobile App

1. **Check if notification document was created**:
   - Firestore → notifications collection
   - Look for documents with `type: "subscription_expiring_soon"` or `type: "subscription_expired"`

2. **Check FCM token**:
   - Firestore → users collection → user document
   - Ensure user has `fcmToken` field populated

3. **Check mobile app logs**:
   - Look for notification listener logs
   - Check for FCM push notification logs

### Function Not Running

1. **Check Firebase billing**:
   - Scheduled functions require Blaze plan (pay-as-you-go)

2. **Check function status**:
   - Firebase Console → Functions
   - Ensure function shows as "Active"

3. **Check cron schedule**:
   - Verify schedule: `"0 9 * * *"` (9 AM UTC daily)
   - Can be changed to `"* * * * *"` for testing (runs every minute)

## Resetting Notification Tracking for Testing

If you need to resend notifications for testing:

### Option 1: Use the Reset Script

```bash
cd backend/scripts
node resetExpiryNotifications.js
```

This will reset `lastExpiryNotification` for all subscriptions with 3, 2, 1 days remaining or expired.

To reset a specific subscription:
```bash
node resetExpiryNotifications.js [subscriptionId]
```

### Option 2: Manual Reset in Firestore

1. Open Firestore Console
2. Go to `subscriptions` collection
3. Find subscription document
4. Delete or modify `lastExpiryNotification` field
5. Call manual function again

## Example Subscription Document After Notification

```json
{
  "userId": "user123",
  "planName": "Monthly Subscription",
  "status": "active",
  "endDate": [Firestore Timestamp],
  "lastExpiryNotification": {
    "daysRemaining": 3,
    "notifiedAt": [Firestore Timestamp]
  }
}
```

## Next Steps

1. **Deploy the functions**:
   ```bash
   cd functions
   firebase deploy --only functions:checkSubscriptionExpiry,functions:checkSubscriptionExpiryManual
   ```

2. **Test manually**:
   - Use the manual test function URL
   - Check Firebase Console logs

3. **Verify notifications**:
   - Check Firestore notifications collection
   - Check mobile app notifications screen
   - Verify push notifications are received

