import React from "react";

/**
 * StatusBadge Component
 * Displays status badges with consistent styling
 * @param {Object} props - Component props
 * @param {string} props.status - The status value
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size variant ('sm', 'md', 'lg')
 */
const StatusBadge = ({ status, className = "", size = "md" }) => {
  const getStatusDisplay = (status) => {
    switch (status) {
      case "good-condition":
        return {
          text: "Good Condition",
          style: "bg-green-100 text-green-700",
        };
      case "needs-maintenance":
        return {
          text: "Needs Maintenance",
          style: "bg-yellow-100 text-yellow-700",
        };
      case "under-repair":
        return {
          text: "Under Repair",
          style: "bg-orange-100 text-orange-700",
        };
      case "out-of-service":
        return {
          text: "Out of Service",
          style: "bg-red-100 text-red-700",
        };
      case "Published":
        return {
          text: "Published",
          style: "bg-green-100 text-green-700",
        };
      case "Draft":
        return {
          text: "Draft",
          style: "bg-yellow-100 text-yellow-700",
        };
      case "active":
        return {
          text: "Active",
          style: "bg-green-100 text-green-700",
        };
      case "inactive":
        return {
          text: "Inactive",
          style: "bg-gray-100 text-gray-700",
        };
      case "pending":
        return {
          text: "Pending",
          style: "bg-blue-100 text-blue-700",
        };
      case "completed":
        return {
          text: "Completed",
          style: "bg-green-100 text-green-700",
        };
      case "cancelled":
        return {
          text: "Cancelled",
          style: "bg-red-100 text-red-700",
        };
      default:
        return {
          text: status || "Unknown",
          style: "bg-gray-100 text-gray-700",
        };
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case "sm":
        return "px-1.5 py-0.5 text-xs";
      case "lg":
        return "px-4 py-2 text-base";
      case "md":
      default:
        return "px-2 py-0.5 text-xs sm:px-2.5 sm:py-1 sm:text-xs md:px-3 md:py-1 md:text-sm lg:px-3 lg:py-1 lg:text-sm";
    }
  };

  const statusInfo = getStatusDisplay(status);
  const sizeClasses = getSizeClasses(size);

  return (
    <span
      className={`inline-block rounded-full font-bold ${statusInfo.style} ${sizeClasses} ${className}`}
    >
      {statusInfo.text}
    </span>
  );
};

export default StatusBadge;
