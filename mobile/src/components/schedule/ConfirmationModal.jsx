import React, { useEffect } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { StatusBar, setStatusBarStyle } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Fonts } from "@/src/constants/Fonts";

const ConfirmationModal = ({
  visible,
  onClose,
  selectedDate,
  selectedTime,
  currentYear,
  currentMonth,
  monthNames,
  getWorkoutInfo,
}) => {
  const router = useRouter();

  const handleViewSchedule = () => {
    onClose(); // Close the modal first
    router.push("/(tabs)/sessions"); // Navigate to Sessions tab
  };

  useEffect(() => {
    if (visible) {
      setStatusBarStyle("light", true);
    } else {
      setStatusBarStyle("dark", true);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      onShow={() => setStatusBarStyle("light", true)}
      onDismiss={() => setStatusBarStyle("dark", true)}
    >
      <StatusBar style="light" backgroundColor="rgba(0,0,0,0.8)" animated />
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.confirmationModal}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="white" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.confirmationTitle}>Booking Confirmed!</Text>

          {/* Session Details */}
          <View style={styles.sessionDetailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#4361EE" />
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>
                {selectedDate} {monthNames[currentMonth]} {currentYear}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#4361EE" />
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>{selectedTime}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={20} color="#4361EE" />
              <Text style={styles.detailLabel}>Workout:</Text>
              <Text style={styles.detailValue}>
                {getWorkoutInfo(selectedDate)
                  ? getWorkoutInfo(selectedDate).type
                  : "Rest"}
              </Text>
            </View>
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <Text style={styles.additionalInfoText}>
              You'll receive a confirmation email shortly. Please arrive 10
              minutes before your session.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.confirmationButtons}>
            <Pressable
              style={styles.viewScheduleButton}
              onPress={handleViewSchedule}
            >
              <Text style={styles.viewScheduleButtonText}>View Schedule</Text>
            </Pressable>

            <Pressable style={styles.okayButton} onPress={onClose}>
              <Text style={styles.okayButtonText}>Okay</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },
  confirmationModal: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4361EE",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4361EE",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  confirmationTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 24,
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
  },
  sessionDetailsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  detailLabel: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "#666",
    marginLeft: 12,
    marginRight: 8,
    minWidth: 60,
  },
  detailValue: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  additionalInfo: {
    backgroundColor: "#f8f9ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  additionalInfoText: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  confirmationButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  viewScheduleButton: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4361EE",
  },
  viewScheduleButtonText: {
    color: "#4361EE",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
  okayButton: {
    flex: 1,
    backgroundColor: "#4361EE",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  okayButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
});

export default ConfirmationModal;
