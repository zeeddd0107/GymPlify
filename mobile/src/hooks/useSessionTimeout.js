import { useEffect, useRef, useCallback, useState } from "react";
import { AppState, PanResponder } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minute in milliseconds (for testing)
const SESSION_WARNING_TIME = 30 * 1000; // Show warning 30 seconds before timeout (at 14 minutes 30 seconds)

export const useSessionTimeout = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const appStateRef = useRef(AppState.currentState);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_WARNING_TIME);
  const [showWarning, setShowWarning] = useState(false);

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

    // Reset time remaining
    setTimeRemaining(SESSION_WARNING_TIME);

    // Only hide warning if it's not already showing
    if (!showWarning) {
      setShowWarning(false);
    }

    // Set warning timeout (14 minutes 30 seconds)
    warningTimeoutRef.current = setTimeout(() => {
      console.log(
        "Session timeout: Warning triggered after 14 minutes 30 seconds of inactivity",
      );
      console.log("Session timeout: Current timeRemaining:", timeRemaining);
      setShowWarning(true);
    }, INACTIVITY_TIMEOUT - SESSION_WARNING_TIME);

    // Set logout timeout (15 minutes) - this will be handled by the warning countdown
    timeoutRef.current = setTimeout(() => {
      console.log(
        "Session timeout: Auto-logout due to inactivity (backup timeout)",
      );
      logoutNow();
    }, INACTIVITY_TIMEOUT);
  }, [user, showWarning, logoutNow]);

  const updateActivity = useCallback(() => {
    // Only update activity if user is authenticated and app is active
    if (!user || appStateRef.current !== "active") return;

    // Don't reset timeout if warning is already showing
    if (showWarning) return;

    console.log("Session timeout: User activity detected, resetting timeout");
    lastActivityRef.current = Date.now();
    resetTimeout();
  }, [user, showWarning]);

  const extendSession = useCallback(() => {
    setShowWarning(false);
    resetTimeout();
  }, []);

  const logoutNow = useCallback(async () => {
    console.log("Session timeout: Logout Now button clicked");
    setShowWarning(false);

    try {
      // Sign out from Firebase
      await signOut();
      console.log("Session timeout: Firebase sign out completed");

      // Clear AsyncStorage
      try {
        await AsyncStorage.clear();
        console.log("Session timeout: AsyncStorage cleared");
      } catch (storageError) {
        console.warn(
          "Session timeout: Failed to clear AsyncStorage:",
          storageError,
        );
      }

      // Navigate to auth screen
      router.replace("/auth");
      console.log("Session timeout: Navigated to auth screen");
    } catch (error) {
      console.error("Session timeout: Sign out failed:", error);

      // Even if Firebase signOut fails, try to clear local data and navigate
      try {
        await AsyncStorage.clear();
        router.replace("/auth");
        console.log("Session timeout: Fallback navigation completed");
      } catch (fallbackError) {
        console.error("Session timeout: Fallback failed:", fallbackError);
      }
    }
  }, [signOut, router]);

  // Create PanResponder to track user touches
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        updateActivity();
        return false; // Don't capture the touch, just track it
      },
      onMoveShouldSetPanResponder: () => {
        updateActivity();
        return false; // Don't capture the touch, just track it
      },
    }),
  ).current;

  // Update time remaining every second when warning is shown
  useEffect(() => {
    if (!showWarning) return;

    // When warning first appears, set the remaining time to SESSION_WARNING_TIME
    setTimeRemaining(SESSION_WARNING_TIME);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1000);
        console.log("Session timeout: countdown remaining:", newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  useEffect(() => {
    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App has come to the foreground
        updateActivity();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    // Initialize timeout if user is authenticated
    if (user) {
      resetTimeout();
    }

    // Cleanup function
    return () => {
      subscription?.remove();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [user, resetTimeout, updateActivity]);

  // Reset timeout when user changes
  useEffect(() => {
    if (user) {
      resetTimeout();
    } else {
      // Clear timeout when user logs out
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      setShowWarning(false);
    }
  }, [user, resetTimeout]);

  return {
    resetTimeout,
    updateActivity,
    extendSession,
    logoutNow,
    showWarning,
    timeRemaining,
    panResponder,
  };
};
