import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SESSION_WARNING_TIME = 30 * 1000; // Show warning 30 seconds before timeout (at 14 minutes 30 seconds)

export const SessionTimeoutWarning = ({
  visible,
  timeRemaining,
  onExtend,
  onLogout,
}) => {
  console.log(
    "SessionTimeoutWarning: visible =",
    visible,
    "timeRemaining =",
    timeRemaining,
  );

  // Handle auto-logout when countdown reaches 0
  useEffect(() => {
    if (!visible || timeRemaining > 0) return;

    console.log(
      "SessionTimeoutWarning: Countdown expired, auto-logout triggered",
    );
    console.log("SessionTimeoutWarning: timeRemaining:", timeRemaining);
    onLogout();
  }, [visible, timeRemaining, onLogout]);

  if (!visible) {
    console.log("SessionTimeoutWarning: Not visible, returning null");
    return null;
  }

  console.log("SessionTimeoutWarning: Rendering warning modal");

  const minutes = Math.floor(timeRemaining / (60 * 1000));
  const seconds = Math.floor((timeRemaining % (60 * 1000)) / 1000);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Ionicons name="warning" size={24} color="#F59E0B" />
            <Text style={styles.title}>Session Timeout Warning</Text>
          </View>

          <Text style={styles.message}>
            You've been inactive for a while. Your session will automatically
            expire in{" "}
            <Text style={styles.timerText}>
              {minutes}:{seconds.toString().padStart(2, "0")}
            </Text>
            .{"\n\n"}Would you like to extend your session or logout now?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                console.log("SessionTimeoutWarning: Logout button pressed");
                onLogout();
              }}
            >
              <Text style={styles.logoutButtonText}>Logout Now</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.extendButton} onPress={onExtend}>
              <Text style={styles.extendButtonText}>Stay Logged In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 12,
  },
  message: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 24,
    textAlign: "left",
  },
  timerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#DC2626",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  logoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  extendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#2563EB",
    borderRadius: 6,
  },
  extendButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "white",
  },
});
