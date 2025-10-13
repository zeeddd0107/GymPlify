import { useEffect, useRef, useCallback, useState } from "react";
import { AppState, PanResponder } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minute in milliseconds
const SESSION_WARNING_TIME = 30 * 1000; // Show warning 30 seconds before timeout (at 30 seconds)

export const useSessionTimeout = () => {
  const { user, signOut: _signOut } = useAuth();
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

    // Don't reset if warning is already showing - this prevents the warning from being hidden
    if (showWarning) {
      console.log("Session timeout: Warning is showing, skipping reset");
      return;
    }

    console.log(
      "Session timeout: Setting timeout for 15 minute (warning at 30 seconds)",
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

    // Hide warning when resetting timeout
    setShowWarning(false);

    // Set warning timeout (30 seconds)
    const warningDelay = INACTIVITY_TIMEOUT - SESSION_WARNING_TIME;
    console.log(
      `Session timeout: Warning will trigger in ${warningDelay}ms (${warningDelay / 1000} seconds)`,
    );

    warningTimeoutRef.current = setTimeout(() => {
      console.log(
        "Session timeout: Warning triggered after 30 seconds of inactivity",
      );
      setShowWarning(true);
    }, warningDelay);

    // Set logout timeout (1 minute) - this will be handled by the warning countdown
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
    if (showWarning) {
      console.log("Session timeout: Warning is showing, ignoring activity");
      return;
    }

    console.log("Session timeout: User activity detected, resetting timeout");
    lastActivityRef.current = Date.now();
    resetTimeout();
  }, [user, showWarning, resetTimeout]);

  const extendSession = useCallback(() => {
    console.log("Session timeout: Extending session, hiding warning");
    setShowWarning(false);
    // Force reset timeout by temporarily setting showWarning to false
    setTimeout(() => {
      resetTimeout();
    }, 0);
  }, [resetTimeout]);

  const logoutNow = useCallback(async () => {
    console.log("Session timeout: Logout Now button clicked");
    setShowWarning(false);

    try {
      // Use the authService signOut function which includes lastLogout tracking
      const { signOut: authSignOut } = await import(
        "@/src/services/authService"
      );
      await authSignOut();
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
  }, [router]);

  // Create PanResponder to track user touches
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        console.log("Session timeout: Touch detected (onStart)");
        updateActivity();
        return false; // Don't capture the touch, just track it
      },
      onMoveShouldSetPanResponder: () => {
        console.log("Session timeout: Touch detected (onMove)");
        updateActivity();
        return false; // Don't capture the touch, just track it
      },
    }),
  ).current;

  // Set initial time when warning first appears
  useEffect(() => {
    if (showWarning) {
      console.log(
        "Session timeout: Warning appeared, setting time to 30 seconds",
      );
      setTimeRemaining(SESSION_WARNING_TIME);
    }
  }, [showWarning]);

  // Update time remaining every second when warning is shown
  useEffect(() => {
    if (!showWarning) return;

    console.log("Session timeout: Starting countdown interval");
    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1000);
        console.log(
          "Session timeout: countdown remaining:",
          newTime / 1000,
          "seconds",
        );
        return newTime;
      });
    }, 1000);

    return () => {
      console.log("Session timeout: Clearing countdown interval");
      clearInterval(interval);
    };
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
      console.log("Session timeout: User authenticated, initializing timeout");
      resetTimeout();
    } else {
      console.log(
        "Session timeout: No user authenticated, skipping timeout initialization",
      );
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
      console.log("Session timeout: User changed, resetting timeout");
      resetTimeout();
    } else {
      console.log("Session timeout: User logged out, clearing timeouts");
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
