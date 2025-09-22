import React, { useState, useEffect } from "react";

const SESSION_WARNING_TIME = 30 * 1000; // Show warning 30 seconds before timeout

export const SessionTimeoutWarning = ({
  visible,
  timeRemaining,
  onExtend,
  onLogout,
}) => {
  const [displayTime, setDisplayTime] = useState(timeRemaining);

  // Update display time every second for countdown
  useEffect(() => {
    if (!visible) return;

    const interval = setInterval(() => {
      setDisplayTime((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [visible]);

  // Handle auto-logout when countdown reaches 0
  useEffect(() => {
    if (!visible || displayTime > 0) return;

    console.log(
      "SessionTimeoutWarning: Countdown expired, auto-logout triggered",
    );
    console.log("SessionTimeoutWarning: displayTime:", displayTime);
    onLogout();
  }, [visible, displayTime, onLogout]);

  // Reset display time when timeRemaining changes, but only if warning is visible
  useEffect(() => {
    if (visible) {
      console.log(
        "SessionTimeoutWarning: timeRemaining changed to:",
        timeRemaining,
      );
      setDisplayTime(timeRemaining);
    }
  }, [timeRemaining, visible]);

  if (!visible) return null;

  const minutes = Math.floor(displayTime / (60 * 1000));
  const seconds = Math.floor((displayTime % (60 * 1000)) / 1000);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-lg">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-yellow-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Session Timeout Warning
            </h3>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 text-left">
            You've been inactive for a while. Your session will automatically
            expire in{" "}
            <span className="font-bold text-red-600">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </span>
            .{"\n\n"}Would you like to extend your session or logout now?
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={() => {
              console.log("SessionTimeoutWarning: Logout button pressed");
              onLogout();
            }}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary text-sm"
          >
            Logout Now
          </button>
          <button
            onClick={onExtend}
            className="px-5 py-2.5 rounded-xl text-white bg-primary hover:bg-secondary text-sm"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};
