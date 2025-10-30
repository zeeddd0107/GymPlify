import { useEffect, useRef, useCallback, useState } from "react";
import { AppState } from "react-native";
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
  const isInitialMount = useRef(true);
  const previousUserId = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_WARNING_TIME);
  const [showWarning, setShowWarning] = useState(false);

  const resetTimeout = useCallback(() => {
    // Only set timeout if user is authenticated
    if (!user) return;

    // Don't reset if warning is already showing - this prevents the warning from being hidden
    if (showWarning) {
      return;
    }

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

    // Set warning timeout (14.5 minutes)
    const warningDelay = INACTIVITY_TIMEOUT - SESSION_WARNING_TIME;

    warningTimeoutRef.current = setTimeout(() => {
      console.log(
        "Session timeout: Warning triggered after 14.5 minutes of inactivity",
      );
      setShowWarning(true);
    }, warningDelay);

    // Set logout timeout (15 minutes) - this will be handled by the warning countdown
    timeoutRef.current = setTimeout(() => {
      console.log(
        "Session timeout: Auto-logout due to inactivity (backup timeout)",
      );
      // Use a direct import to avoid dependency issues
      import("@/src/services/authService").then(({ signOut: authSignOut }) => {
        authSignOut().then(() => {
          AsyncStorage.clear();
          router.replace("/auth");
        }).catch(() => {
          AsyncStorage.clear();
          router.replace("/auth");
        });
      });
    }, INACTIVITY_TIMEOUT);
  }, [user, showWarning, router]);

  const updateActivity = useCallback(() => {
    // Only update activity if user is authenticated and app is active
    if (!user || appStateRef.current !== "active") return;

    // Don't reset timeout if warning is already showing
    if (showWarning) {
      return;
    }

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

  // Remove PanResponder - we'll use simpler touch tracking in SessionTimeoutWrapper

  // Set initial time when warning first appears
  useEffect(() => {
    if (showWarning) {
      setTimeRemaining(SESSION_WARNING_TIME);
    }
  }, [showWarning]);

  // Update time remaining every second when warning is shown
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => {
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

    // Initialize timeout if user is authenticated (only log if not initial mount)
    const userId = user?.id;
    if (userId) {
      if (!isInitialMount.current) {
      console.log("Session timeout: User authenticated, initializing timeout");
      }
      resetTimeout();
    } else if (!isInitialMount.current) {
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
  }, [user?.id, resetTimeout, updateActivity]);

  // Reset timeout when user ID changes (not on every user object change)
  useEffect(() => {
    const userId = user?.id;
    
    // Skip logging during initial mount and storage restoration
    if (isInitialMount.current) {
      isInitialMount.current = false;
      previousUserId.current = userId;
      return;
    }
    
    // Only log if user ID actually changed (not just object reference)
    if (userId !== previousUserId.current) {
    if (userId) {
      console.log("Session timeout: User changed, resetting timeout");
      resetTimeout();
      } else if (previousUserId.current) {
        // Only log logout if there was a previous user (not during initial auth flow)
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
      previousUserId.current = userId;
    }
  }, [user?.id, resetTimeout]);

  return {
    resetTimeout,
    updateActivity,
    extendSession,
    logoutNow,
    showWarning,
    timeRemaining,
  };
};
