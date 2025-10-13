/**
 * Date utility functions for subscription management
 * Handles exact month calculations for different month lengths
 */

/**
 * Calculate exactly one month from a given date
 * Handles edge cases like Jan 31 -> Feb 28/29, Feb 29 -> Mar 29 (non-leap year)
 */
export const addExactMonth = (startDate) => {
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
 * Calculate the number of days between two dates
 */
export const getDaysDifference = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - start;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get remaining days until subscription expires
 */
export const getRemainingDays = (subscription) => {
  if (!subscription.endDate) return 0;

  const now = new Date();
  const endDate = subscription.endDate.toDate
    ? subscription.endDate.toDate()
    : new Date(subscription.endDate);
  const diffTime = endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return Math.max(0, diffDays);
};

/**
 * Check if a subscription is expired
 */
export const isSubscriptionExpired = (subscription) => {
  if (!subscription.endDate) return false;

  const now = new Date();
  const endDate = subscription.endDate.toDate
    ? subscription.endDate.toDate()
    : new Date(subscription.endDate);
  return now > endDate;
};

/**
 * Create subscription dates for different plan types
 */
export const createSubscriptionDates = (planId, startDate = new Date()) => {
  const start = new Date(startDate);

  switch (planId) {
    case "walkin":
      // Walk-in session: 1 day
      return {
        startDate: start,
        endDate: new Date(start.getTime() + 24 * 60 * 60 * 1000), // +1 day
      };

    case "monthly":
    case "coaching-group":
      // Monthly plans: exactly one calendar month
      return {
        startDate: start,
        endDate: addExactMonth(start),
      };

    case "coaching-solo":
      // Solo coaching: exactly one calendar month (same as coaching-group)
      return {
        startDate: start,
        endDate: addExactMonth(start),
      };

    default:
      // Default to one month
      return {
        startDate: start,
        endDate: addExactMonth(start),
      };
  }
};

/**
 * Format date for display
 */
export const formatSubscriptionDate = (date) => {
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Get subscription status based on dates
 */
export const getSubscriptionStatus = (subscription) => {
  if (!subscription.endDate) return "unknown";

  const now = new Date();
  const endDate = subscription.endDate.toDate
    ? subscription.endDate.toDate()
    : new Date(subscription.endDate);

  if (now > endDate) return "expired";
  if (
    now < subscription.startDate?.toDate
      ? subscription.startDate.toDate()
      : new Date(subscription.startDate)
  )
    return "pending";
  return "active";
};
