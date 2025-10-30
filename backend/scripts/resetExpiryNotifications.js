/**
 * Reset lastExpiryNotification for testing subscription expiry notifications
 * 
 * Usage: node resetExpiryNotifications.js [subscriptionId]
 * If no subscriptionId is provided, will reset all subscriptions with 3, 2, 1 days remaining or expired
 */

const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, "../config/serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

/**
 * Calculate remaining days for a subscription
 */
function calculateRemainingDays(endDate) {
  if (!endDate) return 0;
  
  const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
  const now = new Date();
  
  const endDateOnly = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
  );
  const nowOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  
  const diffTime = endDateOnly.getTime() - nowOnly.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Check if subscription is expired
 */
function isSubscriptionExpired(endDate) {
  if (!endDate) return false;
  const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
  const now = new Date();
  
  const endDateOnly = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
  );
  const nowOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  
  return endDateOnly < nowOnly;
}

async function resetExpiryNotifications(subscriptionId = null) {
  try {
    if (subscriptionId) {
      // Reset specific subscription
      const subscriptionRef = db.collection("subscriptions").doc(subscriptionId);
      const subscriptionDoc = await subscriptionRef.get();
      
      if (!subscriptionDoc.exists) {
        console.error(` Subscription ${subscriptionId} not found`);
        return;
      }
      
      await subscriptionRef.update({
        lastExpiryNotification: admin.firestore.FieldValue.delete(),
      });
      
      console.log(` Reset lastExpiryNotification for subscription ${subscriptionId}`);
    } else {
      // Reset all subscriptions that should trigger notifications
      const subscriptionsSnapshot = await db
        .collection("subscriptions")
        .where("status", "==", "active")
        .get();
      
      let resetCount = 0;
      
      for (const subscriptionDoc of subscriptionsSnapshot.docs) {
        const subscription = subscriptionDoc.data();
        const endDate = subscription.endDate;
        
        if (!endDate) continue;
        
        const remainingDays = calculateRemainingDays(endDate);
        const isExpired = isSubscriptionExpired(endDate);
        
        // Only reset if subscription has 3, 2, 1 days remaining or is expired
        if (isExpired || remainingDays <= 3) {
          await subscriptionDoc.ref.update({
            lastExpiryNotification: admin.firestore.FieldValue.delete(),
          });
          
          const userName = subscription.userDisplayName || subscription.userEmail || "Unknown";
          console.log(` Reset lastExpiryNotification for subscription ${subscriptionDoc.id} (${userName}, ${remainingDays} days remaining)`);
          resetCount++;
        }
      }
      
      console.log(`\n Reset ${resetCount} subscriptions`);
      console.log(`\nNow run the manual test function to send notifications:`);
      console.log(`POST https://us-central1-gymplify-554c8.cloudfunctions.net/checkSubscriptionExpiryManual`);
    }
  } catch (error) {
    console.error(" Error resetting expiry notifications:", error);
  } finally {
    process.exit(0);
  }
}

// Get subscription ID from command line arguments
const subscriptionId = process.argv[2] || null;

resetExpiryNotifications(subscriptionId);

