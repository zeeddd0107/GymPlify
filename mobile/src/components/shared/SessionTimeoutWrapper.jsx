import React from "react";
import { View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { useSessionTimeout } from "@/src/hooks/useSessionTimeout";
import { SessionTimeoutWarning } from "./SessionTimeoutWarning";

export const SessionTimeoutWrapper = ({ children }) => {
  const { user } = useAuth();

  // Only initialize session timeout if user is authenticated
  const { showWarning, timeRemaining, extendSession, logoutNow, updateActivity } =
    useSessionTimeout();

  // Reduced logging - only log when warning is actually shown
  if (showWarning && user) {
  console.log(
      "SessionTimeoutWrapper: Warning active, timeRemaining =",
    timeRemaining,
  );
  }

  // Track any touch/press events on the app
  const handleInteraction = () => {
    if (user) {
      updateActivity();
    }
  };

  return (
    <View
      style={{ flex: 1 }}
      onStartShouldSetResponder={() => true}
      onResponderGrant={handleInteraction}
      onResponderMove={handleInteraction}
      onTouchStart={handleInteraction}
    >
      {children}
      {user && (
        <SessionTimeoutWarning
          visible={showWarning}
          timeRemaining={timeRemaining}
          onExtend={extendSession}
          onLogout={logoutNow}
        />
      )}
    </View>
  );
};
