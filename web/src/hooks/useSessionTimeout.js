import { useEffect, useRef, useCallback, useState } from "react";
import authService from "@/services/authService";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes
const SESSION_WARNING_TIME = 30 * 1000; // Show warning 30 seconds before timeout (at 14 minutes 30 seconds)

export const useSessionTimeout = (user) => {
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const showWarningRef = useRef(false);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_WARNING_TIME);
  const [showWarning, setShowWarning] = useState(false);

  const signOut = useCallback(() => {
    authService.signOut();
  }, []);

  const logoutNow = useCallback(() => {
    console.log("Session timeout: Logout Now button clicked");
    showWarningRef.current = false;
    setShowWarning(false);
    signOut();
  }, [signOut]);

  // Cleanup function to clear all timeouts and reset state
  const cleanup = useCallback(() => {
    console.log("Session timeout: Cleaning up timeouts and state");
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
    showWarningRef.current = false;
    setShowWarning(false);
    setTimeRemaining(SESSION_WARNING_TIME);
  }, []);

  const resetTimeout = useCallback(() => {
    // Only set timeout if user is authenticated
    if (!user) return;

    console.log(
      "Session timeout: Setting timeout for 15 minutes (warning at 14 minutes 30 seconds)",
    );

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Reset last activity time to now
    lastActivityRef.current = Date.now();

    // Reset time remaining to full timeout
    setTimeRemaining(SESSION_WARNING_TIME);

    // Hide warning when resetting timeout
    showWarningRef.current = false;
    setShowWarning(false);

    // Set warning timeout (30 seconds before 15 minutes = 14 minutes 30 seconds)
    warningTimeoutRef.current = setTimeout(() => {
      console.log(
        "Session timeout: Warning triggered after 14 minutes 30 seconds of inactivity",
      );
      showWarningRef.current = true;
      setShowWarning(true);
    }, INACTIVITY_TIMEOUT - SESSION_WARNING_TIME);

    // Set logout timeout (15 minutes)
    timeoutRef.current = setTimeout(() => {
      console.log(
        "Session timeout: Auto-logout due to inactivity (backup timeout)",
      );
      logoutNow();
    }, INACTIVITY_TIMEOUT);
  }, [user, logoutNow]);

  const updateActivity = useCallback(() => {
    // Only update activity if user is authenticated
    if (!user) return;

    // Don't reset timeout if warning is already showing
    if (showWarningRef.current) return;

    console.log("Session timeout: User activity detected, resetting timeout");
    lastActivityRef.current = Date.now();
    resetTimeout();
  }, [user, resetTimeout]);

  const extendSession = useCallback(() => {
    showWarningRef.current = false;
    setShowWarning(false);
    resetTimeout();
  }, [resetTimeout]);

  // Update time remaining every second when warning is shown
  useEffect(() => {
    if (!showWarning) return;

    // When warning first appears, set the remaining time to SESSION_WARNING_TIME
    setTimeRemaining(SESSION_WARNING_TIME);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1000);
        console.log("Session timeout: countdown remaining:", newTime);

        // Auto-logout when countdown reaches 0
        if (newTime <= 0) {
          console.log(
            "Session timeout: Countdown expired, auto-logout triggered",
          );
          logoutNow();
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning, logoutNow]);

  // Set up event listeners for user activity
  useEffect(() => {
    if (!user) return;

    // List of events that indicate user activity
    const activityEvents = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Add event listeners
    activityEvents.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    // Initialize timeout
    resetTimeout();

    // Cleanup function
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
      cleanup();
    };
  }, [user, resetTimeout, updateActivity, cleanup]);

  // Reset timeout when user changes
  useEffect(() => {
    if (user) {
      console.log("Session timeout: User logged in, initializing timeout");
      resetTimeout();
    } else {
      console.log("Session timeout: User logged out, cleaning up");
      cleanup();
    }
  }, [user, resetTimeout, cleanup]);

  return {
    resetTimeout,
    updateActivity,
    extendSession,
    logoutNow,
    showWarning,
    timeRemaining,
  };
};
