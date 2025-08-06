/**
 * Dashboard Service - Handles all dashboard-related data fetching and operations
 */

const mockMembershipData = {
  status: "Active",
  expiresAt: "2024-12-31",
  daysUntilExpiry: 45,
  plan: "Premium Monthly",
  planId: "premium_monthly",
  price: 99.99,
  billingCycle: "monthly",
};

const mockAttendanceData = {
  visitsThisWeek: 3,
  visitsThisMonth: 12,
  lastCheckIn: "2024-11-15 14:30",
  weeklyGoal: 4,
  monthlyGoal: 16,
  totalVisits: 156,
  averageVisitsPerWeek: 3.2,
};

const mockUpcomingSessions = [
  {
    id: 1,
    type: "Personal Training",
    coach: "Sarah Johnson",
    date: "2024-11-18",
    time: "10:00 AM",
    duration: "60 min",
    location: "Studio A",
    status: "confirmed",
  },
  {
    id: 2,
    type: "Group Class",
    coach: "Mike Chen",
    date: "2024-11-20",
    time: "6:00 PM",
    duration: "45 min",
    location: "Main Floor",
    status: "confirmed",
  },
  {
    id: 3,
    type: "Yoga Session",
    coach: "Emma Wilson",
    date: "2024-11-22",
    time: "9:00 AM",
    duration: "90 min",
    location: "Yoga Studio",
    status: "pending",
  },
];

const mockSubscriptions = [
  {
    id: 1,
    name: "Personal Training Sessions",
    remaining: 3,
    total: 10,
    validUntil: "2024-12-15",
    price: 800,
    type: "session_pack",
  },
  {
    id: 2,
    name: "Group Class Pass",
    remaining: 8,
    total: 12,
    validUntil: "2024-12-31",
    price: 120,
    type: "class_pack",
  },
  {
    id: 3,
    name: "Spa Access",
    remaining: 2,
    total: 5,
    validUntil: "2024-11-30",
    price: 150,
    type: "spa_pack",
  },
];

const mockNotifications = [
  {
    id: 1,
    title: "New Equipment Available",
    message: "Try our new rowing machines in Zone A",
    unread: true,
    timestamp: "2 hours ago",
    type: "announcement",
    priority: "medium",
  },
  {
    id: 2,
    title: "Holiday Hours",
    message: "Gym will be closed on Thanksgiving Day",
    unread: false,
    timestamp: "1 day ago",
    type: "announcement",
    priority: "high",
  },
  {
    id: 3,
    title: "Your Session is Tomorrow",
    message: "Don't forget your personal training session with Sarah at 10 AM",
    unread: true,
    timestamp: "3 hours ago",
    type: "reminder",
    priority: "high",
  },
];

const mockWorkoutTips = [
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

/**
 * Fetch user's membership information
 */
export const fetchMembershipData = async () => {
  try {
    // TODO: Replace with actual Firebase call
    // const doc = await firebase.firestore().collection('memberships').doc(userId).get();
    // return doc.data();

    return mockMembershipData;
  } catch (error) {
    console.error("Error fetching membership data:", error);
    throw error;
  }
};

/**
 * Fetch user's attendance data
 */
export const fetchAttendanceData = async () => {
  try {
    // TODO: Replace with actual Firebase call
    // const snapshot = await firebase.firestore()
    //   .collection('attendance')
    //   .where('userId', '==', userId)
    //   .orderBy('timestamp', 'desc')
    //   .limit(30)
    //   .get();

    return mockAttendanceData;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    throw error;
  }
};

/**
 * Fetch upcoming sessions
 */
export const fetchUpcomingSessions = async () => {
  try {
    // TODO: Replace with actual Firebase call
    // const snapshot = await firebase.firestore()
    //   .collection('sessions')
    //   .where('userId', '==', userId)
    //   .where('date', '>=', new Date())
    //   .orderBy('date')
    //   .limit(5)
    //   .get();

    return mockUpcomingSessions;
  } catch (error) {
    console.error("Error fetching upcoming sessions:", error);
    throw error;
  }
};

/**
 * Fetch active subscriptions
 */
export const fetchActiveSubscriptions = async () => {
  try {
    // TODO: Replace with actual Firebase call
    // const snapshot = await firebase.firestore()
    //   .collection('subscriptions')
    //   .where('userId', '==', userId)
    //   .where('status', '==', 'active')
    //   .get();

    return mockSubscriptions;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw error;
  }
};

/**
 * Fetch notifications
 */
export const fetchNotifications = async () => {
  try {
    // TODO: Replace with actual Firebase call
    // const snapshot = await firebase.firestore()
    //   .collection('notifications')
    //   .where('userId', '==', userId)
    //   .orderBy('timestamp', 'desc')
    //   .limit(10)
    //   .get();

    return mockNotifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Get workout tip of the day
 */
export const getWorkoutTip = () => {
  // TODO: Implement logic to get different tips based on date/user preferences
  const today = new Date().getDate();
  return mockWorkoutTips[today % mockWorkoutTips.length];
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    // TODO: Replace with actual Firebase call
    // await firebase.firestore()
    //   .collection('notifications')
    //   .doc(notificationId)
    //   .update({ unread: false });

    console.log(`Marked notification ${notificationId} as read`);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Check in user to gym
 */
export const checkInToGym = async (userId, qrData) => {
  try {
    const checkInData = {
      userId,
      timestamp: new Date().toISOString(),
      qrData,
      type: "gym_checkin",
      location: "main_entrance",
    };

    // TODO: Replace with actual Firebase call
    // await firebase.firestore().collection('attendance').add(checkInData);

    console.log("Check-in successful:", checkInData);
    return checkInData;
  } catch (error) {
    console.error("Error checking in:", error);
    throw error;
  }
};

/**
 * Check in user to session
 */
export const checkInToSession = async (userId, sessionId, qrData) => {
  try {
    const checkInData = {
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
      qrData,
      type: "session_checkin",
    };

    // TODO: Replace with actual Firebase call
    // await firebase.firestore().collection('session_attendance').add(checkInData);

    console.log("Session check-in successful:", checkInData);
    return checkInData;
  } catch (error) {
    console.error("Error checking in to session:", error);
    throw error;
  }
};

/**
 * Renew membership
 */
export const renewMembership = async (userId, planId) => {
  try {
    // TODO: Implement payment processing and membership renewal
    console.log(`Renewing membership for user ${userId} with plan ${planId}`);

    return {
      success: true,
      newExpiryDate: "2025-01-31",
      planId,
    };
  } catch (error) {
    console.error("Error renewing membership:", error);
    throw error;
  }
};

/**
 * Buy more sessions
 */
export const buyMoreSessions = async (userId, subscriptionType, quantity) => {
  try {
    // TODO: Implement payment processing and session purchase
    console.log(
      `Buying ${quantity} more sessions of type ${subscriptionType} for user ${userId}`,
    );

    return {
      success: true,
      newSessions: quantity,
      subscriptionType,
    };
  } catch (error) {
    console.error("Error buying sessions:", error);
    throw error;
  }
};
