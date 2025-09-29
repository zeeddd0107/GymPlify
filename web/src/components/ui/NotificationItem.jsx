import React from "react";
import { FaTimes, FaCheck } from "react-icons/fa";

const NotificationItem = ({
  notification,
  icon,
  colorClass,
  onMarkAsRead,
  onDelete,
}) => {
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return notificationTime.toLocaleDateString();
  };

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div
      className={`p-4 hover:bg-gray-50 transition-colors duration-150 ${!notification.read ? "bg-blue-50/30" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`p-2 rounded-full ${colorClass} flex-shrink-0`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h4
                className={`text-sm font-medium ${!notification.read ? "text-gray-900" : "text-gray-700"}`}
              >
                {notification.title}
              </h4>
              <p
                className="text-sm text-gray-600 mt-1 overflow-hidden"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {formatTimeAgo(notification.timestamp)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {!notification.read && (
                <button
                  onClick={handleMarkAsRead}
                  className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors duration-200"
                  title="Mark as read"
                >
                  <FaCheck className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                title="Delete notification"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Unread indicator */}
          {!notification.read && (
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
