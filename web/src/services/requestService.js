import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  where,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  serverTimestamp,
  arrayUnion as _arrayUnion,
} from "firebase/firestore";
import { db } from "@/config/firebase";

// Helper function to add exactly one month (handles edge cases like Jan 31 -> Feb 28/29)
const addExactMonth = (startDate) => {
  const date = new Date(startDate);
  const originalDay = date.getDate();

  // Add one month
  date.setMonth(date.getMonth() + 1);

  // If the day doesn't exist in the target month, set to last day of that month
  if (date.getDate() !== originalDay) {
    // Go to the last day of the target month
    date.setDate(0);
  }

  return date;
};

/**
 * Fetch all pending subscription requests
 */
export const fetchPendingSubscriptions = async () => {
  try {
    const q = query(
      collection(db, "pendingSubscriptions"),
      orderBy("requestDate", "desc"),
    );

    const querySnapshot = await getDocs(q);
    const requests = [];

    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
        requestDate: doc.data().requestDate?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        approvedDate:
          doc.data().approvedDate?.toDate?.() ||
          doc.data().approvedAt?.toDate?.() ||
          null,
      });
    });

    return requests;
  } catch (error) {
    console.error("Error fetching pending subscriptions:", error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates of pending subscriptions
 */
export const subscribeToPendingSubscriptions = (callback) => {
  const q = query(
    collection(db, "pendingSubscriptions"),
    orderBy("requestDate", "desc"),
  );

  return onSnapshot(q, (querySnapshot) => {
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
        requestDate: doc.data().requestDate?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        approvedDate:
          doc.data().approvedDate?.toDate?.() ||
          doc.data().approvedAt?.toDate?.() ||
          null,
      });
    });
    callback(requests);
  });
};

/**
 * Approve a pending subscription request
 */
export const approvePendingSubscription = async (requestId) => {
  try {
    // Get the pending subscription request
    const requestRef = doc(db, "pendingSubscriptions", requestId);
    const requestDoc = await getDoc(requestRef);

    if (!requestDoc.exists()) {
      throw new Error("Subscription request not found");
    }

    const requestData = requestDoc.data();

    // Get subscription plan details
    const planRef = doc(db, "subscriptionPlans", requestData.planId);
    const planDoc = await getDoc(planRef);

    if (!planDoc.exists()) {
      throw new Error("Subscription plan not found");
    }

    const planData = planDoc.data();
    const newPlan = planData.name || "Unknown";

    // Check if user already has an active subscription
    const userRef = doc(db, "users", requestData.userId);
    const userDoc = await getDoc(userRef);

    let subscriptionRef;
    let isExtension = false;

    if (userDoc.exists()) {
      const userData = userDoc.data();

      if (userData.activeSubscriptionId) {
        const activeSubscriptionRef = doc(
          db,
          "subscriptions",
          userData.activeSubscriptionId,
        );
        const activeSubscriptionDoc = await getDoc(activeSubscriptionRef);

        if (activeSubscriptionDoc.exists()) {
          const activeSubscriptionData = activeSubscriptionDoc.data();
          const currentPlan = activeSubscriptionData.planName || "Unknown";

          // Check if the active subscription is still valid (not expired)
          const now = new Date();
          const endDate =
            activeSubscriptionData.endDate?.toDate?.() || new Date();

          if (endDate > now) {
            // User has an active subscription - check if this is an extension
            const isCurrentWalkin =
              currentPlan.toLowerCase().includes("walkin") ||
              currentPlan.toLowerCase().includes("walk-in");
            const isNewWalkin =
              newPlan.toLowerCase().includes("walkin") ||
              newPlan.toLowerCase().includes("walk-in");
            const isNewMonthly = newPlan.toLowerCase().includes("monthly");
            const isCurrentMonthly = currentPlan
              .toLowerCase()
              .includes("monthly");
            const isNewCoaching =
              newPlan.toLowerCase().includes("coaching") ||
              newPlan.toLowerCase().includes("solo");
            const isCurrentCoaching =
              currentPlan.toLowerCase().includes("coaching") ||
              currentPlan.toLowerCase().includes("solo");

            if (isCurrentWalkin && isNewWalkin) {
              isExtension = true;
              console.log("✅ Processing Walk-in to Walk-in extension");

              // Calculate extension details
              const currentEndDate =
                activeSubscriptionData.endDate?.toDate?.() || new Date();
              const now = new Date();

              // Calculate remaining time from current Walk-in
              const currentRemainingTime = Math.max(
                0,
                currentEndDate.getTime() - now.getTime(),
              );

              // Calculate period left for new Walk-in (1 day = 24 hours)
              const newWalkinPeriod = 24 * 60 * 60 * 1000; // 1 day in milliseconds

              // Total extension time = current remaining + new Walk-in period
              const totalExtensionTime = currentRemainingTime + newWalkinPeriod;

              // Calculate new end date
              const newEndDate = new Date(now.getTime() + totalExtensionTime);

              // Create a NEW subscription record for the extension
              const extensionSubscriptionData = {
                userId: requestData.userId,
                userEmail: requestData.userEmail,
                userDisplayName: requestData.userDisplayName,
                planId: requestData.planId,
                planName: requestData.planName,
                price: requestData.price,
                status: "active",
                startDate: now, // Start from current time
                endDate: newEndDate,
                daysRemaining: Math.ceil(
                  totalExtensionTime / (24 * 60 * 60 * 1000),
                ),
                paymentMethod: requestData.paymentMethod || "counter",
                approvedBy: "admin",
                approvedAt: new Date(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                // Add extension metadata
                extensionType: "walkin_to_walkin",
                previousSubscriptionId: activeSubscriptionRef.id,
                previousEndDate: activeSubscriptionData.endDate,
                currentRemainingDays: Math.ceil(
                  currentRemainingTime / (24 * 60 * 60 * 1000),
                ),
                newWalkinDays: 1,
                totalExtensionDays: Math.ceil(
                  totalExtensionTime / (24 * 60 * 60 * 1000),
                ),
                reason: "Additional Walk-in session purchased",
              };

              // Create new subscription document
              subscriptionRef = await addDoc(
                collection(db, "subscriptions"),
                extensionSubscriptionData,
              );

              // Update user document with new active subscription reference
              const userRef = doc(db, "users", requestData.userId);
              const userDoc = await getDoc(userRef);
              const userData = userDoc.data();
              const existingHistory = userData.subscriptionHistory || [];

              // Add new subscription ID to history
              const updatedHistory = [...existingHistory, subscriptionRef.id];
              await updateDoc(userRef, {
                activeSubscriptionId: subscriptionRef.id,
                subscriptionHistory: updatedHistory,
                updatedAt: serverTimestamp(),
              });

              console.log("📝 Created new Walk-in extension subscription:", {
                newSubscriptionId: subscriptionRef.id,
                previousSubscriptionId: activeSubscriptionRef.id,
                totalExtensionDays:
                  extensionSubscriptionData.totalExtensionDays,
              });

              console.log(
                "📚 Added new Walk-in extension to subscription history:",
                {
                  subscriptionId: subscriptionRef.id,
                  historyLength: updatedHistory.length,
                },
              );

              console.log("✅ Walk-in subscription extended successfully");
            } else if (isCurrentWalkin && isNewMonthly) {
              isExtension = true;
              console.log("✅ Processing Walk-in to Monthly extension");

              // Calculate extension details
              const currentEndDate =
                activeSubscriptionData.endDate?.toDate?.() || new Date();
              const now = new Date();

              // Calculate remaining time from current Walk-in
              const currentRemainingTime = Math.max(
                0,
                currentEndDate.getTime() - now.getTime(),
              );

              // Calculate period left for new Monthly subscription (1 full month)
              const newMonthlyPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

              // Total extension time = current remaining + new Monthly period
              const totalExtensionTime =
                currentRemainingTime + newMonthlyPeriod;

              // Calculate new end date
              const newEndDate = new Date(now.getTime() + totalExtensionTime);

              // Create a NEW subscription record for the extension
              const extensionSubscriptionData = {
                userId: requestData.userId,
                userEmail: requestData.userEmail,
                userDisplayName: requestData.userDisplayName,
                planId: requestData.planId,
                planName: requestData.planName,
                price: requestData.price,
                status: "active",
                startDate: now, // Start from current time
                endDate: newEndDate,
                daysRemaining: Math.ceil(
                  totalExtensionTime / (24 * 60 * 60 * 1000),
                ),
                paymentMethod: requestData.paymentMethod || "counter",
                approvedBy: "admin",
                approvedAt: new Date(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                // Add extension metadata
                extensionType: "walkin_to_monthly",
                previousSubscriptionId: activeSubscriptionRef.id,
                previousEndDate: activeSubscriptionData.endDate,
                currentRemainingDays: Math.ceil(
                  currentRemainingTime / (24 * 60 * 60 * 1000),
                ),
                newMonthlyDays: 30,
                totalExtensionDays: Math.ceil(
                  totalExtensionTime / (24 * 60 * 60 * 1000),
                ),
                reason: "Walk-in upgraded to Monthly subscription",
              };

              // Create new subscription document
              subscriptionRef = await addDoc(
                collection(db, "subscriptions"),
                extensionSubscriptionData,
              );

              // Update user document with new active subscription reference
              const userRef = doc(db, "users", requestData.userId);
              const userDoc = await getDoc(userRef);
              const userData = userDoc.data();
              const existingHistory = userData.subscriptionHistory || [];

              // Add new subscription ID to history
              const updatedHistory = [...existingHistory, subscriptionRef.id];
              await updateDoc(userRef, {
                activeSubscriptionId: subscriptionRef.id,
                subscriptionHistory: updatedHistory,
                updatedAt: serverTimestamp(),
              });

              console.log(
                "📝 Created new Walk-in to Monthly extension subscription:",
                {
                  newSubscriptionId: subscriptionRef.id,
                  previousSubscriptionId: activeSubscriptionRef.id,
                  totalExtensionDays:
                    extensionSubscriptionData.totalExtensionDays,
                },
              );

              console.log(
                "📚 Added new Walk-in to Monthly extension to subscription history:",
                {
                  subscriptionId: subscriptionRef.id,
                  historyLength: updatedHistory.length,
                },
              );

              console.log(
                "✅ Walk-in to Monthly subscription extended successfully",
              );
            } else if (isCurrentMonthly && isNewCoaching) {
              // Monthly to Coaching/Solo upgrade - REPLACE current subscription
              console.log(
                "✅ Processing Monthly to Coaching/Solo upgrade - REPLACING subscription",
              );

              // Mark current monthly subscription as replaced
              await updateDoc(activeSubscriptionRef, {
                status: "replaced",
                replacedBy: "upgrade_to_coaching",
                replacedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });

              console.log(
                "📝 Marked current monthly subscription as replaced:",
                activeSubscriptionRef.id,
              );

              // Create new coaching/solo subscription starting now
              const now = new Date();
              const endDate = new Date();

              // Set end date based on coaching plan type
              if (planData.period === "per month") {
                endDate.setDate(now.getDate() + (planData.daysRemaining || 31));
              }

              const upgradeSubscriptionData = {
                userId: requestData.userId,
                userEmail: requestData.userEmail,
                userDisplayName: requestData.userDisplayName,
                planId: requestData.planId,
                planName: requestData.planName,
                price: requestData.price,
                status: "active",
                startDate: now,
                endDate: endDate,
                daysRemaining: planData.daysRemaining || 31,
                paymentMethod: requestData.paymentMethod || "counter",
                approvedBy: "admin",
                approvedAt: new Date(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                upgradeType: "monthly_to_coaching",
                previousSubscriptionId: activeSubscriptionRef.id,
                previousPlanName: currentPlan,
                reason: "Upgraded from monthly to coaching program",
              };

              subscriptionRef = await addDoc(
                collection(db, "subscriptions"),
                upgradeSubscriptionData,
              );

              // Update user document with new active subscription reference and replace in history
              const userRef = doc(db, "users", requestData.userId);
              const userDoc = await getDoc(userRef);
              const userData = userDoc.data();
              const existingHistory = userData.subscriptionHistory || [];

              // Replace the old monthly subscription ID with the new coaching subscription ID
              const updatedHistory = existingHistory.map((id) =>
                id === activeSubscriptionRef.id ? subscriptionRef.id : id,
              );

              await updateDoc(userRef, {
                activeSubscriptionId: subscriptionRef.id,
                subscriptionHistory: updatedHistory,
                updatedAt: serverTimestamp(),
              });

              console.log(
                "📚 Replaced Monthly subscription with Coaching upgrade in subscription history:",
                {
                  oldSubscriptionId: activeSubscriptionRef.id,
                  newSubscriptionId: subscriptionRef.id,
                  historyLength: updatedHistory.length,
                },
              );

              console.log(
                "✅ Monthly to Coaching subscription upgraded successfully",
              );
            } else if (isCurrentWalkin && isNewCoaching) {
              // Walk-in to Coaching/Solo upgrade - REPLACE current subscription
              console.log(
                "✅ Processing Walk-in to Coaching/Solo upgrade - REPLACING subscription",
              );

              // Mark current walk-in subscription as replaced
              await updateDoc(activeSubscriptionRef, {
                status: "replaced",
                replacedBy: "upgrade_to_coaching",
                replacedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });

              console.log(
                "📝 Marked current walk-in subscription as replaced:",
                activeSubscriptionRef.id,
              );

              // Create new coaching/solo subscription starting now
              const now = new Date();
              const endDate = new Date();

              // Set end date based on coaching plan type
              if (planData.period === "per month") {
                endDate.setDate(now.getDate() + (planData.daysRemaining || 31));
              }

              const upgradeSubscriptionData = {
                userId: requestData.userId,
                userEmail: requestData.userEmail,
                userDisplayName: requestData.userDisplayName,
                planId: requestData.planId,
                planName: requestData.planName,
                price: requestData.price,
                status: "active",
                startDate: now,
                endDate: endDate,
                daysRemaining: planData.daysRemaining || 31,
                maxSessions: planData.maxSessions || null, // Add session tracking for solo coaching
                usedSessions: 0, // Initialize used sessions
                paymentMethod: requestData.paymentMethod || "counter",
                approvedBy: "admin",
                approvedAt: new Date(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                upgradeType: "walkin_to_coaching",
                previousSubscriptionId: activeSubscriptionRef.id,
                previousPlanName: currentPlan,
                reason: "Upgraded from walk-in to coaching program",
              };

              subscriptionRef = await addDoc(
                collection(db, "subscriptions"),
                upgradeSubscriptionData,
              );

              // Update user document with new active subscription reference and replace in history
              const userRef = doc(db, "users", requestData.userId);
              const userDoc = await getDoc(userRef);
              const userData = userDoc.data();
              const existingHistory = userData.subscriptionHistory || [];

              // Replace the old walk-in subscription ID with the new coaching subscription ID
              const updatedHistory = existingHistory.map((id) =>
                id === activeSubscriptionRef.id ? subscriptionRef.id : id,
              );

              await updateDoc(userRef, {
                activeSubscriptionId: subscriptionRef.id,
                subscriptionHistory: updatedHistory,
                updatedAt: serverTimestamp(),
              });

              console.log(
                "📚 Replaced Walk-in subscription with Coaching upgrade in subscription history:",
                {
                  oldSubscriptionId: activeSubscriptionRef.id,
                  newSubscriptionId: subscriptionRef.id,
                  historyLength: updatedHistory.length,
                },
              );

              console.log(
                "✅ Walk-in to Coaching subscription upgraded successfully",
              );
            } else if (isCurrentMonthly && isNewMonthly) {
              // Monthly to Monthly extension - MERGE remaining days
              console.log(
                "✅ Processing Monthly to Monthly extension - MERGING days",
              );

              // Calculate remaining time from current monthly subscription
              const currentEndDate =
                activeSubscriptionData.endDate?.toDate?.() || new Date();
              const now = new Date();

              // Use the same date calculation logic as mobile app (start of day comparison)
              const currentEndDateOnly = new Date(
                currentEndDate.getFullYear(),
                currentEndDate.getMonth(),
                currentEndDate.getDate(),
              );
              const nowOnly = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );

              const remainingTime = Math.max(
                0,
                currentEndDateOnly.getTime() - nowOnly.getTime(),
              );
              const remainingDays = Math.ceil(
                remainingTime / (24 * 60 * 60 * 1000),
              );

              // Calculate new monthly period - use exact calendar month
              const currentMonthlyEndDate = new Date(
                nowOnly.getTime() + remainingTime,
              );
              const newMonthlyEndDate = addExactMonth(currentMonthlyEndDate);
              const newMonthlyPeriod =
                newMonthlyEndDate.getTime() - currentMonthlyEndDate.getTime();

              // Total extension time = current remaining + new monthly period
              const totalExtensionTime = remainingTime + newMonthlyPeriod;

              // Calculate new end date
              const newEndDate = new Date(
                nowOnly.getTime() + totalExtensionTime,
              );

              // Calculate the actual remaining days from now to the new end date
              const actualRemainingDays = Math.ceil(
                totalExtensionTime / (24 * 60 * 60 * 1000),
              );

              // Update the EXISTING subscription to extend it (don't create a new one)
              const extensionData = {
                endDate: newEndDate,
                daysRemaining: actualRemainingDays, // Actual remaining days from now to end date
                updatedAt: serverTimestamp(),
                // Track extension details
                extensionType: "monthly_to_monthly",
                extensionDate: serverTimestamp(),
                currentRemainingDays: Math.max(0, remainingDays),
                newMonthlyDays: Math.ceil(
                  newMonthlyPeriod / (24 * 60 * 60 * 1000),
                ),
                totalExtensionDays: actualRemainingDays,
                reason: "Extended monthly subscription with additional days",
              };

              // Update the existing subscription
              await updateDoc(activeSubscriptionRef, extensionData);

              // Use the existing subscription reference
              subscriptionRef = activeSubscriptionRef;

              console.log(
                "✅ Monthly to Monthly subscription extended successfully",
              );
              console.log("📊 Monthly Extension Summary:", {
                originalMonthlyEndDate: currentEndDate,
                newMonthlyEndDate: newEndDate,
                remainingDays: Math.max(0, remainingDays),
                newMonthlyDays: Math.ceil(
                  newMonthlyPeriod / (24 * 60 * 60 * 1000),
                ),
                totalExtensionDays: actualRemainingDays,
                subscriptionId: subscriptionRef.id,
                planData: {
                  daysRemaining: planData.daysRemaining,
                  period: planData.period,
                },
              });
            } else if (
              (activeSubscriptionData.planId === "coaching-solo" ||
                (currentPlan.toLowerCase().includes("coaching") &&
                  currentPlan.toLowerCase().includes("solo"))) &&
              (requestData.planId === "coaching-solo" ||
                newPlan.toLowerCase().includes("solo"))
            ) {
              // Solo to Solo extension - MERGE remaining sessions
              console.log(
                "✅ Processing Solo to Solo extension - MERGING sessions",
              );

              // Calculate remaining time from current solo subscription
              const currentEndDate =
                activeSubscriptionData.endDate?.toDate?.() || new Date();
              const now = new Date();

              // Use the same date calculation logic as mobile app (start of day comparison)
              const currentEndDateOnly = new Date(
                currentEndDate.getFullYear(),
                currentEndDate.getMonth(),
                currentEndDate.getDate(),
              );
              const nowOnly = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );

              const remainingTime = Math.max(
                0,
                currentEndDateOnly.getTime() - nowOnly.getTime(),
              );
              const remainingDays = Math.ceil(
                remainingTime / (24 * 60 * 60 * 1000),
              );

              // Calculate remaining sessions from current solo subscription
              const currentMaxSessions =
                activeSubscriptionData.maxSessions || 10;
              const currentUsedSessions =
                activeSubscriptionData.usedSessions || 0;
              const remainingSessions = Math.max(
                0,
                currentMaxSessions - currentUsedSessions,
              );

              // Get new solo plan session limit
              const newMaxSessions = planData.maxSessions || 10;

              // Calculate new solo period - use exact calendar month like other monthly plans
              // For solo coaching, we'll add exactly one calendar month from the current end date
              const currentSoloEndDate = new Date(
                nowOnly.getTime() + remainingTime,
              );
              const newSoloEndDate = addExactMonth(currentSoloEndDate);
              const newSoloPeriod =
                newSoloEndDate.getTime() - currentSoloEndDate.getTime();

              // Total extension time = current remaining + new solo period
              const totalExtensionTime = remainingTime + newSoloPeriod;

              // Calculate new end date
              const newEndDate = new Date(
                nowOnly.getTime() + totalExtensionTime,
              );

              // Calculate merged session data
              const totalMergedSessions = remainingSessions + newMaxSessions;

              // Calculate the actual remaining days from now to the new end date
              const actualRemainingDays = Math.ceil(
                totalExtensionTime / (24 * 60 * 60 * 1000),
              );

              // Update the EXISTING subscription to extend it (don't create a new one)
              const extensionData = {
                endDate: newEndDate,
                daysRemaining: actualRemainingDays, // Actual remaining days from now to end date
                maxSessions: totalMergedSessions, // Merged sessions: remaining + new
                // Keep existing usedSessions (don't reset)
                updatedAt: serverTimestamp(),
                // Track extension details
                extensionType: "solo_to_solo",
                extensionDate: serverTimestamp(),
                currentRemainingDays: Math.max(0, remainingDays),
                newSoloDays: Math.ceil(newSoloPeriod / (24 * 60 * 60 * 1000)),
                totalExtensionDays: actualRemainingDays,
                // Session merge details
                currentRemainingSessions: remainingSessions,
                newSoloSessions: newMaxSessions,
                totalMergedSessions: totalMergedSessions,
                reason:
                  "Extended solo coaching program with merged remaining sessions",
              };

              // Update the existing subscription
              await updateDoc(activeSubscriptionRef, extensionData);

              // Use the existing subscription reference
              subscriptionRef = activeSubscriptionRef;

              console.log("✅ Solo to Solo subscription extended successfully");
              console.log("📊 Solo Extension Summary:", {
                originalSoloEndDate: currentEndDate,
                newSoloEndDate: newEndDate,
                remainingDays: Math.max(0, remainingDays),
                newSoloDays: Math.ceil(newSoloPeriod / (24 * 60 * 60 * 1000)),
                totalExtensionDays: actualRemainingDays,
                actualRemainingDays: actualRemainingDays,
                // Session merge details
                currentRemainingSessions: remainingSessions,
                newSoloSessions: newMaxSessions,
                totalMergedSessions: totalMergedSessions,
                subscriptionId: subscriptionRef.id,
                planData: {
                  daysRemaining: planData.daysRemaining,
                  period: planData.period,
                  maxSessions: planData.maxSessions,
                },
              });
            } else if (isCurrentCoaching && isNewWalkin) {
              // Coaching/Solo to Walk-in - NOT ALLOWED
              console.log(
                "✅ Matched Coaching/Solo to Walk-in case - NOT ALLOWED",
              );
              throw new Error(
                "This user has an active coaching program subscription. They must wait until their coaching program ends before purchasing walk-in sessions.",
              );
            } else if (isCurrentCoaching && isNewMonthly) {
              // Coaching/Solo to Monthly - NOT ALLOWED
              console.log(
                "✅ Matched Coaching/Solo to Monthly case - NOT ALLOWED",
              );
              throw new Error(
                "This user has an active coaching program subscription. They must wait until their coaching program ends before purchasing a monthly plan.",
              );
            } else if (
              (activeSubscriptionData.planId === "coaching-group" ||
                (currentPlan.toLowerCase().includes("coaching") &&
                  currentPlan.toLowerCase().includes("group"))) &&
              (requestData.planId === "coaching-group" ||
                (newPlan.toLowerCase().includes("coaching") &&
                  newPlan.toLowerCase().includes("group")))
            ) {
              // Coaching-Group to Coaching-Group extension - MERGE remaining days
              console.log(
                "✅ Processing Coaching-Group to Coaching-Group extension - MERGING days",
              );

              // Calculate remaining time from current coaching-group subscription
              const currentEndDate =
                activeSubscriptionData.endDate?.toDate?.() || new Date();
              const now = new Date();

              // Use the same date calculation logic as mobile app (start of day comparison)
              const currentEndDateOnly = new Date(
                currentEndDate.getFullYear(),
                currentEndDate.getMonth(),
                currentEndDate.getDate(),
              );
              const nowOnly = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
              );

              const remainingTime = Math.max(
                0,
                currentEndDateOnly.getTime() - nowOnly.getTime(),
              );
              const remainingDays = Math.ceil(
                remainingTime / (24 * 60 * 60 * 1000),
              );

              // Calculate new coaching-group period - use exact calendar month
              const currentCoachingEndDate = new Date(
                nowOnly.getTime() + remainingTime,
              );
              const newCoachingEndDate = addExactMonth(currentCoachingEndDate);
              const newCoachingPeriod =
                newCoachingEndDate.getTime() - currentCoachingEndDate.getTime();

              // Total extension time = current remaining + new coaching-group period
              const totalExtensionTime = remainingTime + newCoachingPeriod;

              // Calculate new end date
              const newEndDate = new Date(
                nowOnly.getTime() + totalExtensionTime,
              );

              // Calculate the actual remaining days from now to the new end date
              const actualRemainingDays = Math.ceil(
                totalExtensionTime / (24 * 60 * 60 * 1000),
              );

              // Update the EXISTING subscription to extend it (don't create a new one)
              const extensionData = {
                endDate: newEndDate,
                daysRemaining: actualRemainingDays, // Actual remaining days from now to end date
                updatedAt: serverTimestamp(),
                // Track extension details
                extensionType: "coaching_group_to_coaching_group",
                extensionDate: serverTimestamp(),
                currentRemainingDays: Math.max(0, remainingDays),
                newCoachingDays: Math.ceil(
                  newCoachingPeriod / (24 * 60 * 60 * 1000),
                ),
                totalExtensionDays: actualRemainingDays,
                reason: "Extended group coaching program with additional days",
              };

              // Update the existing subscription
              await updateDoc(activeSubscriptionRef, extensionData);

              // Use the existing subscription reference
              subscriptionRef = activeSubscriptionRef;

              console.log(
                "✅ Coaching-Group to Coaching-Group subscription extended successfully",
              );
              console.log("📊 Coaching-Group Extension Summary:", {
                originalCoachingEndDate: currentEndDate,
                newCoachingEndDate: newEndDate,
                remainingDays: Math.max(0, remainingDays),
                newCoachingDays: Math.ceil(
                  newCoachingPeriod / (24 * 60 * 60 * 1000),
                ),
                totalExtensionDays: actualRemainingDays,
                subscriptionId: subscriptionRef.id,
                planData: {
                  daysRemaining: planData.daysRemaining,
                  period: planData.period,
                },
              });
            } else if (
              (activeSubscriptionData.planId === "coaching-group" ||
                (currentPlan.toLowerCase().includes("coaching") &&
                  currentPlan.toLowerCase().includes("group"))) &&
              (requestData.planId === "coaching-solo" ||
                newPlan.toLowerCase().includes("solo"))
            ) {
              // Coaching-Group to Solo - NOT ALLOWED
              console.log(
                "✅ Matched Coaching-Group to Solo case - NOT ALLOWED",
              );
              throw new Error(
                "This user has an active group coaching program subscription. They must wait until their group coaching program ends before switching to solo coaching.",
              );
            } else if (
              (activeSubscriptionData.planId === "coaching-solo" ||
                (currentPlan.toLowerCase().includes("coaching") &&
                  currentPlan.toLowerCase().includes("solo"))) &&
              (requestData.planId === "coaching-group" ||
                (newPlan.toLowerCase().includes("coaching") &&
                  newPlan.toLowerCase().includes("group")))
            ) {
              // Solo to Coaching-Group - NOT ALLOWED
              console.log(
                "✅ Matched Solo to Coaching-Group case - NOT ALLOWED",
              );
              throw new Error(
                "This user has an active solo coaching program subscription. They must wait until their solo coaching program ends before switching to group coaching.",
              );
            } else {
              // This is not a supported extension - block it
              throw new Error(
                "This user already has an active subscription. Please wait for their current subscription to expire before approving a new one.",
              );
            }
          }
        }
      }
    }

    // If not an extension, create a new subscription
    if (!isExtension) {
      // Calculate subscription dates
      const startDate = new Date();
      const endDate = new Date();

      // Set end date based on plan type
      if (planData.period === "per session") {
        // For session-based plans, end date is same as start date
        endDate.setDate(startDate.getDate() + 1); // 1 day for session
      } else if (planData.period === "per month") {
        // For monthly plans, add the daysRemaining days
        endDate.setDate(startDate.getDate() + (planData.daysRemaining || 31));
      }

      // Create subscription document
      const subscriptionData = {
        userId: requestData.userId,
        userEmail: requestData.userEmail,
        userDisplayName: requestData.userDisplayName,
        planId: requestData.planId,
        planName: requestData.planName,
        price: requestData.price,
        status: "active",
        startDate: startDate,
        endDate: endDate,
        daysRemaining: planData.daysRemaining || 31,
        maxSessions: planData.maxSessions || null, // Add session tracking for solo coaching
        usedSessions: 0, // Initialize used sessions
        paymentMethod: requestData.paymentMethod || "counter",
        approvedBy: "admin", // You can get this from auth context
        approvedAt: new Date(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Add subscription to subscriptions collection
      subscriptionRef = await addDoc(
        collection(db, "subscriptions"),
        subscriptionData,
      );

      // Update user document with active subscription reference and add to history
      const userRef = doc(db, "users", requestData.userId);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      const existingHistory = userData?.subscriptionHistory || [];

      // Add new subscription ID to history if not already present
      const updatedHistory = existingHistory.includes(subscriptionRef.id)
        ? existingHistory
        : [...existingHistory, subscriptionRef.id];

      await setDoc(
        userRef,
        {
          activeSubscriptionId: subscriptionRef.id,
          subscriptionHistory: updatedHistory,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      console.log("📚 Added new subscription to subscription history:", {
        subscriptionId: subscriptionRef.id,
        historyLength: updatedHistory.length,
      });

      console.log(
        "✅ New subscription created successfully:",
        subscriptionRef.id,
      );
    }

    // Update the pending subscription request status
    await updateDoc(requestRef, {
      status: "approved",
      approvedAt: serverTimestamp(),
      approvedDate: new Date(),
      updatedAt: serverTimestamp(),
      subscriptionId: subscriptionRef.id, // Link to created subscription
    });

    return { success: true, subscriptionId: subscriptionRef.id };
  } catch (error) {
    console.error("Error approving subscription:", error);
    throw error;
  }
};

/**
 * Reject a pending subscription request
 */
export const rejectPendingSubscription = async (requestId) => {
  try {
    const requestRef = doc(db, "pendingSubscriptions", requestId);
    await updateDoc(requestRef, {
      status: "rejected",
      rejectedAt: new Date(),
      updatedAt: new Date(),
    });
    return true;
  } catch (error) {
    console.error("Error rejecting subscription:", error);
    throw error;
  }
};

/**
 * Delete a pending subscription request
 */
export const deletePendingSubscription = async (requestId) => {
  try {
    const requestRef = doc(db, "pendingSubscriptions", requestId);
    await deleteDoc(requestRef);
    return true;
  } catch (error) {
    console.error("Error deleting subscription:", error);
    throw error;
  }
};

/**
 * Get pending subscriptions by status
 */
export const getPendingSubscriptionsByStatus = async (status) => {
  try {
    const q = query(
      collection(db, "pendingSubscriptions"),
      where("status", "==", status),
      orderBy("requestDate", "desc"),
    );

    const querySnapshot = await getDocs(q);
    const requests = [];

    querySnapshot.forEach((doc) => {
      requests.push({
        id: doc.id,
        ...doc.data(),
        requestDate: doc.data().requestDate?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
        approvedDate:
          doc.data().approvedDate?.toDate?.() ||
          doc.data().approvedAt?.toDate?.() ||
          null,
      });
    });

    return requests;
  } catch (error) {
    console.error("Error fetching pending subscriptions by status:", error);
    throw error;
  }
};

/**
 * Get user's subscription history
 */
export const getUserSubscriptionHistory = async (userId) => {
  try {
    // Get user document to retrieve subscription history
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return [];
    }

    const userData = userDoc.data();
    const subscriptionHistory = userData.subscriptionHistory || [];

    if (subscriptionHistory.length === 0) {
      return [];
    }

    // Fetch all subscription documents from history
    const subscriptionPromises = subscriptionHistory.map((subscriptionId) =>
      getDoc(doc(db, "subscriptions", subscriptionId)),
    );

    const subscriptionDocs = await Promise.all(subscriptionPromises);

    // Filter out non-existent subscriptions and format data
    const history = subscriptionDocs
      .filter((doc) => doc.exists())
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startDate: doc.data().startDate?.toDate?.() || new Date(),
        endDate: doc.data().endDate?.toDate?.() || new Date(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      }))
      .sort((a, b) => b.startDate - a.startDate); // Sort by start date, newest first

    console.log("📚 Retrieved subscription history:", {
      userId,
      historyCount: history.length,
      subscriptionIds: subscriptionHistory,
    });

    return history;
  } catch (error) {
    console.error("Error fetching user subscription history:", error);
    throw error;
  }
};
