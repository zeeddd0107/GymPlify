import React from "react";
import { View } from "react-native";
import { useAuth } from "@/src/context/AuthContext";
import { useSessionTimeout } from "@/src/hooks/useSessionTimeout";
import { SessionTimeoutWarning } from "./SessionTimeoutWarning";

export const SessionTimeoutWrapper = ({ children }) => {
  const { user } = useAuth();

  // Only initialize session timeout if user is authenticated
  const { showWarning, timeRemaining, extendSession, logoutNow, panResponder } =
    useSessionTimeout();

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
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
