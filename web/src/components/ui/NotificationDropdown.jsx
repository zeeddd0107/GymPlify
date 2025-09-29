import React, { useState, useRef, useEffect } from "react";
import {
  FaBell,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaInfoCircle,
  FaUser,
  FaCalendarCheck,
  FaClipboardList,
} from "react-icons/fa";
import NotificationItem from "./NotificationItem";

const NotificationDropdown = ({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "checkin":
        return <FaCalendarCheck className="w-4 h-4" />;
      case "checkout":
        return <FaCalendarCheck className="w-4 h-4" />;
      case "subscription":
        return <FaUser className="w-4 h-4" />;
      case "equipment":
        return <FaClipboardList className="w-4 h-4" />;
      case "warning":
        return <FaExclamationTriangle className="w-4 h-4" />;
      case "info":
        return <FaInfoCircle className="w-4 h-4" />;
      default:
        return <FaInfoCircle className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "checkin":
        return "text-green-600 bg-green-50";
      case "checkout":
        return "text-blue-600 bg-blue-50";
      case "subscription":
        return "text-purple-600 bg-purple-50";
      case "equipment":
        return "text-orange-600 bg-orange-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors duration-200"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => {
                    onMarkAllAsRead();
                    setIsOpen(false);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Mark all as read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FaBell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    icon={getNotificationIcon(notification.type)}
                    colorClass={getNotificationColor(notification.type)}
                    onMarkAsRead={onMarkAsRead}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
