/**
 * Utility functions for subscription management
 */

/**
 * Calculate days left in a subscription
 * @param {Object} endDate - Firestore timestamp or Date object
 * @param {Object} startDate - Firestore timestamp or Date object
 * @returns {number} Days left in subscription
 */
export const calculateDaysLeft = (endDate, startDate) => {
  if (!endDate) return 0;

  const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
  const start = startDate?.toDate
    ? startDate.toDate()
    : startDate
      ? new Date(startDate)
      : new Date();
  const today = new Date();

  // Use the later of start date or today as the reference point
  const referenceDate = start > today ? start : today;

  // Set both dates to start of day for accurate comparison
  const endDateOnly = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
  );
  const referenceDateOnly = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );

  const diffTime = endDateOnly - referenceDateOnly;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays > 0 ? diffDays : 0;
};

/**
 * Check if a subscription is expired
 * @param {Object} endDate - Firestore timestamp or Date object
 * @returns {boolean} True if subscription is expired
 */
export const isSubscriptionExpired = (endDate) => {
  if (!endDate) return false;
  const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
  const today = new Date();

  // Set both dates to start of day for accurate comparison
  const endDateOnly = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
  );
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return endDateOnly < todayOnly;
};

/**
 * Get subscription status with automatic expired check
 * @param {Object} subscription - Subscription object
 * @returns {string} Subscription status
 */
export const getSubscriptionStatus = (subscription) => {
  // Check if subscription should be expired based on end date
  if (isSubscriptionExpired(subscription.endDate)) {
    return "expired";
  }

  // Check if days left is 0
  const daysLeft = calculateDaysLeft(
    subscription.endDate,
    subscription.startDate,
  );
  if (daysLeft === 0) {
    return "expired";
  }

  // If not expired, return the current status or default to active
  return subscription.status || "active";
};

/**
 * Create short version of userId for display
 * @param {string} userId - User ID string
 * @returns {string} Shortened user ID
 */
export const getShortUserId = (userId) => {
  if (!userId) return "N/A";
  // Take first 8 characters and last 4 characters, separated by "..."
  if (userId.length <= 12) return userId;
  return `${userId.substring(0, 8)}...${userId.substring(userId.length - 4)}`;
};

/**
 * Get display Member ID (custom for mobile users, short userId for web)
 * @param {Object} subscription - Subscription object
 * @returns {string} Display member ID
 */
export const getDisplayMemberId = (subscription) => {
  // For web (admin/staff), show short userId
  // For mobile users, show custom Member ID if available
  if (subscription.customMemberId) {
    return subscription.customMemberId;
  }
  return getShortUserId(subscription.userId);
};

/**
 * Format date for display
 * @param {Object} date - Firestore timestamp or Date object
 * @returns {string} Formatted date string
 */
export const formatSubscriptionDate = (date) => {
  if (!date) return "-";
  return date.toDate ? date.toDate().toLocaleDateString() : "-";
};

/**
 * Convert Firestore timestamp to date string for form inputs
 * @param {Object} timestamp - Firestore timestamp
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const timestampToDateString = (timestamp) => {
  if (!timestamp) return "";
  return timestamp.toDate ? timestamp.toDate().toISOString().split("T")[0] : "";
};

/**
 * Convert date string back to Firestore timestamp
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Object|null} Firestore timestamp or null
 */
export const dateStringToTimestamp = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString);
};
