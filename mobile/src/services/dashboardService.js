import { firestore } from "@/src/services/firebase";

/**
 * Dashboard Service - Handles all dashboard-related data fetching and operations
 */

/**
 * Fetch user's membership information
 */
export const fetchMembershipData = async (userId) => {
  try {
    // Get the user's subscriptions from subscriptions collection (not just active ones)
    const snapshot = await firestore
      .collection("subscriptions")
      .where("userId", "==", userId)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      const subscriptionDoc = snapshot.docs[0];
      const subscriptionData = subscriptionDoc.data();

      // Calculate days until expiry
      let endDate;
      if (subscriptionData.endDate?.toDate) {
        endDate = subscriptionData.endDate.toDate();
      } else if (subscriptionData.endDate) {
        endDate = new Date(subscriptionData.endDate);
      } else {
        endDate = new Date();
      }

      const today = new Date();
      const daysUntilExpiry = Math.ceil(
        (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Determine status based on expiry date and original subscription status
      let status = subscriptionData.status || "Active";

      // Override status based on expiry date if the subscription has expired
      if (daysUntilExpiry < 0) {
        status = "Expired";
      } else if (daysUntilExpiry <= 3 && daysUntilExpiry >= 0) {
        status = "Expiring Soon";
      } else if (daysUntilExpiry > 7) {
        status = "Active";
      }

      // Handle cancelled subscriptions
      if (subscriptionData.status === "cancelled") {
        status = "Cancelled";
      }

      // Transform subscription data to membership format
      const result = {
        status: status,
        expiresAt: subscriptionData.endDate
          ? subscriptionData.endDate?.toDate
            ? new Date(subscriptionData.endDate.toDate())
                .toISOString()
                .split("T")[0]
            : new Date(subscriptionData.endDate).toISOString().split("T")[0]
          : null,
        daysUntilExpiry: daysUntilExpiry,
        plan: subscriptionData.name || "Premium Membership",
        planId: subscriptionData.type || "premium",
        price: subscriptionData.price || 0,
        billingCycle: subscriptionData.billingCycle || "monthly",
        subscriptionId: subscriptionDoc.id,
        // Don't spread subscriptionData here as it might override our calculated status
        // ...subscriptionData,
      };

      return result;
    }

    return null;
  } catch (error) {
    console.error("Error fetching membership data:", error);
    throw error;
  }
};

/**
 * Fetch user's attendance data
 */
export const fetchAttendanceData = async (userId) => {
  try {
    const snapshot = await firestore
      .collection("attendance")
      .where("userId", "==", userId)
      .limit(30)
      .get();

    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Helper function to normalize timestamp
    const normalizeTimestamp = (timestamp) => {
      if (!timestamp) return new Date(0);
      if (timestamp.toDate) return timestamp.toDate();
      return new Date(timestamp);
    };

    // Sort in memory instead of in query to avoid index requirements
    const sortedDocs = docs.sort((a, b) => {
      const timeA = normalizeTimestamp(a.checkInTime || a.timestamp);
      const timeB = normalizeTimestamp(b.checkInTime || b.timestamp);
      return timeB.getTime() - timeA.getTime(); // Sort by most recent first
    });

    // Transform attendance data into the format the UI expects
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const visitsThisWeek = sortedDocs.filter((doc) => {
      const checkInTime = normalizeTimestamp(doc.checkInTime || doc.timestamp);
      return checkInTime >= oneWeekAgo;
    }).length;

    const visitsThisMonth = sortedDocs.filter((doc) => {
      const checkInTime = normalizeTimestamp(doc.checkInTime || doc.timestamp);
      return checkInTime >= oneMonthAgo;
    }).length;

    const lastCheckIn =
      sortedDocs.length > 0
        ? normalizeTimestamp(
            sortedDocs[0].checkInTime || sortedDocs[0].timestamp,
          ).toLocaleString()
        : null;

    return {
      visitsThisWeek,
      visitsThisMonth,
      lastCheckIn,
      weeklyGoal: 4,
      monthlyGoal: 16,
      totalVisits: sortedDocs.length,
      averageVisitsPerWeek:
        visitsThisMonth > 0 ? Math.round((visitsThisMonth / 4) * 10) / 10 : 0,
      recentCheckIns: sortedDocs.slice(0, 10), // Keep recent check-ins for detailed view
    };
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    throw error;
  }
};

/**
 * Fetch upcoming sessions
 */
export const fetchUpcomingSessions = async (userId) => {
  try {
    const snapshot = await firestore
      .collection("sessions")
      .where("userId", "==", userId)
      .limit(20) // Increased limit since we're filtering in memory
      .get();

    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter and sort in memory to avoid index requirements
    const now = new Date();
    console.log("Fetched sessions:", docs.length, "sessions");
    console.log("Current time:", now);

    const filteredSessions = docs
      .filter((doc) => {
        // Only include scheduled sessions
        if (doc.status !== "scheduled") {
          return false;
        }

        // Check for scheduledDate (from schedule screen) or startTime/date (legacy)
        const sessionDate = doc.scheduledDate || doc.startTime || doc.date;
        if (!sessionDate) {
          console.log("Session", doc.id, "has no date field");
          return false;
        }

        // Handle Firestore Timestamp objects
        const dateToCheck = sessionDate.toDate
          ? sessionDate.toDate()
          : new Date(sessionDate);
        const isUpcoming = dateToCheck > now;
        console.log(
          "Session",
          doc.id,
          "date:",
          dateToCheck,
          "isUpcoming:",
          isUpcoming,
        );
        return isUpcoming;
      })
      .sort((a, b) => {
        const timeA = a.scheduledDate || a.startTime || a.date || 0;
        const timeB = b.scheduledDate || b.startTime || b.date || 0;

        // Handle Firestore Timestamp objects for sorting
        const dateA = timeA.toDate ? timeA.toDate() : new Date(timeA);
        const dateB = timeB.toDate ? timeB.toDate() : new Date(timeB);
        return dateA - dateB;
      })
      .slice(0, 5);

    console.log("Filtered upcoming sessions:", filteredSessions.length);
    return filteredSessions;
  } catch (error) {
    console.error("Error fetching upcoming sessions:", error);
    throw error;
  }
};

/**
 * Fetch active subscriptions
 */
export const fetchActiveSubscriptions = async (userId) => {
  try {
    const snapshot = await firestore
      .collection("subscriptions")
      .where("userId", "==", userId)
      .get();

    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Return all subscriptions, not just active ones, so we can calculate proper status
    return docs;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw error;
  }
};

/**
 * Fetch notifications
 */
export const fetchNotifications = async (userId) => {
  try {
    const snapshot = await firestore
      .collection("notifications")
      .where("userId", "==", userId)
      .limit(20)
      .get();

    const docs = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort in memory instead of in query to avoid index requirements
    return docs
      .sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return new Date(timeB) - new Date(timeA);
      })
      .slice(0, 10);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await firestore
      .collection("notifications")
      .doc(notificationId)
      .update({ unread: false });

    console.log(`Marked notification ${notificationId} as read`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Check in to gym
 */
export const checkInToGym = async (userId, location = "Main Gym") => {
  try {
    const checkInData = {
      userId,
      location,
      checkInTime: firestore.FieldValue.serverTimestamp(), // Use consistent field name
      timestamp: firestore.FieldValue.serverTimestamp(), // Keep for backward compatibility
      type: "gym_checkin",
    };

    await firestore.collection("attendance").add(checkInData);

    console.log("Check-in successful:", checkInData);
    return true;
  } catch (error) {
    console.error("Error during check-in:", error);
    throw error;
  }
};

/**
 * Check in to a session
 */
export const checkInToSession = async (userId, sessionId, sessionName) => {
  try {
    const checkInData = {
      userId,
      sessionId,
      sessionName,
      timestamp: firestore.FieldValue.serverTimestamp(),
      type: "session_checkin",
    };

    await firestore.collection("session_attendance").add(checkInData);

    console.log("Session check-in successful:", checkInData);
    return true;
  } catch (error) {
    console.error("Error during session check-in:", error);
    throw error;
  }
};

/**
 * Get workout tip of the day
 */
export const getWorkoutTip = () => {
  // For now, return a static tip. This could be enhanced to fetch from Firebase
  const tips = [
    {
      title: "💪 Workout Tip of the Day",
      tip: "Focus on form over weight. Proper technique prevents injuries and builds strength more effectively.",
      category: "strength",
    },
    {
      title: "🏃‍♂️ Cardio Tip",
      tip: "Start with a 5-minute warm-up to gradually increase your heart rate and prepare your muscles.",
      category: "cardio",
    },
    {
      title: "🧘‍♀️ Recovery Tip",
      tip: "Stretch for at least 10 minutes after your workout to improve flexibility and reduce muscle soreness.",
      category: "recovery",
    },
  ];

  const today = new Date().getDate();
  return tips[today % tips.length];
};
