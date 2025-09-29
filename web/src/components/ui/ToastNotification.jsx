import React, { useEffect, useState } from "react";
import {
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
  FaExclamationCircle,
} from "react-icons/fa";

/**
 * Reusable ToastNotification Component
 * @param {Object} props - Component props
 * @param {boolean} props.isVisible - Whether the toast is visible
 * @param {Function} props.onClose - Function to close the toast
 * @param {string} props.message - The message to display
 * @param {string} props.type - Type of toast: 'success', 'error', 'warning', 'info' (default: 'success')
 * @param {number} props.duration - Auto-dismiss duration in milliseconds (default: 3000)
 * @param {string} props.position - Position: 'top-right', 'top-left', 'bottom-right', 'bottom-left' (default: 'top-right')
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showCloseButton - Whether to show close button (default: true)
 * @param {React.ReactNode} props.icon - Custom icon (overrides default type icon)
 */
const ToastNotification = ({
  isVisible,
  onClose,
  message,
  type = "success",
  duration = 3000,
  position = "top-right",
  className = "",
  showCloseButton = true,
  icon = null,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-dismiss functionality with animation
  useEffect(() => {
    if (isVisible && duration > 0) {
      // Start animation
      setIsAnimating(true);

      const timer = setTimeout(() => {
        // Start exit animation
        setIsAnimating(false);

        // Close after animation completes
        setTimeout(() => {
          onClose();
        }, 300); // Match animation duration
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  // Handle manual close with animation
  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  // Don't render if not visible
  if (!isVisible) return null;

  // Get type-specific styling
  const getTypeStyles = (toastType) => {
    switch (toastType) {
      case "success":
        return {
          borderColor: "border-green-500",
          iconBg: "bg-green-600",
          icon: <FaCheck className="w-3 h-3 sm:w-4 sm:h-4 text-white" />,
        };
      case "error":
        return {
          borderColor: "border-red-500",
          iconBg: "bg-red-600",
          icon: (
            <FaExclamationCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          ),
        };
      case "warning":
        return {
          borderColor: "border-yellow-500",
          iconBg: "bg-yellow-600",
          icon: (
            <FaExclamationTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          ),
        };
      case "info":
        return {
          borderColor: "border-blue-500",
          iconBg: "bg-blue-600",
          icon: <FaInfoCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />,
        };
      default:
        return {
          borderColor: "border-gray-500",
          iconBg: "bg-gray-600",
          icon: <FaInfoCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />,
        };
    }
  };

  // Get position-specific styling
  const getPositionStyles = (pos) => {
    switch (pos) {
      case "top-left":
        return "top-4 left-4";
      case "top-right":
        return "top-4 right-4";
      case "bottom-left":
        return "bottom-4 left-4";
      case "bottom-right":
        return "bottom-4 right-4";
      default:
        return "top-4 right-4";
    }
  };

  const typeStyles = getTypeStyles(type);
  const positionStyles = getPositionStyles(position);

  return (
    <div
      className={`fixed ${positionStyles} z-[60] bg-white rounded-lg border-l-4 ${typeStyles.borderColor} px-3 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2 sm:gap-3 max-w-xs sm:max-w-sm shadow-lg transition-all duration-300 ease-in-out transform ${className} ${
        isAnimating
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      }`}
      style={{ boxShadow: "5px 5px 8px rgba(0, 0, 0, 0.1)" }}
    >
      {/* Icon */}
      <div
        className={`${typeStyles.iconBg} rounded-full p-1.5 sm:p-2 flex-shrink-0 transition-transform duration-300 ${
          isAnimating ? "scale-100 rotate-0" : "scale-75 rotate-12"
        }`}
      >
        {icon || typeStyles.icon}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div
          className={`font-semibold text-gray-600 text-xs sm:text-sm break-words transition-all duration-300 ${
            isAnimating
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0"
          }`}
        >
          {message}
        </div>
      </div>

      {/* Close button */}
      {showCloseButton && (
        <button
          onClick={handleClose}
          className={`text-gray-700 hover:text-gray-900 transition-all duration-200 flex-shrink-0 p-1 rounded-full hover:bg-gray-100 ${
            isAnimating ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
          title="Close notification"
        >
          <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
  );
};

export default ToastNotification;
