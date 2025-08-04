import React from "react";

/**
 * Reusable component for displaying subscription status with appropriate styling
 * @param {Object} props - Component props
 * @param {string} props.status - The subscription status
 * @param {Object} props.subscription - The full subscription object for status calculation
 * @param {Function} props.getSubscriptionStatus - Function to calculate status
 */
const SubscriptionStatusBadge = ({
  status,
  subscription,
  getSubscriptionStatus,
}) => {
  // Calculate the actual status (handles expired logic)
  const actualStatus = getSubscriptionStatus
    ? getSubscriptionStatus(subscription)
    : status;

  // Define status styles
  const statusStyles = {
    active: "bg-green-100 text-green-700",
    expired: "bg-red-100 text-red-700",
    cancelled: "bg-yellow-100 text-yellow-700",
    suspended: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
        statusStyles[actualStatus] || statusStyles.active
      }`}
    >
      {actualStatus}
    </span>
  );
};

export default SubscriptionStatusBadge;
