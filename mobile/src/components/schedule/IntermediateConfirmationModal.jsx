import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { StatusBar, setStatusBarStyle } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

const IntermediateConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  selectedDate,
  selectedTime,
  currentYear,
  currentMonth,
  monthNames,
  getWorkoutInfo,
  isConfirming = false,
}) => {
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
          style={styles.intermediateConfirmationModal}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Question Icon */}
          <View style={styles.questionIconContainer}>
            <View style={styles.questionIcon}>
              <Ionicons name="help-circle" size={40} color="white" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.intermediateConfirmationTitle}>
            Confirm Session?
          </Text>

          {/* Session Details */}
          <View style={styles.intermediateSessionDetails}>
            <View style={styles.intermediateDetailRow}>
              <Ionicons name="calendar-outline" size={20} color="#4361EE" />
              <Text style={styles.intermediateDetailLabel}>Date:</Text>
              <Text style={styles.intermediateDetailValue}>
                {selectedDate} {monthNames[currentMonth]} {currentYear}
              </Text>
            </View>

            <View style={styles.intermediateDetailRow}>
              <Ionicons name="time-outline" size={20} color="#4361EE" />
              <Text style={styles.intermediateDetailLabel}>Time:</Text>
              <Text style={styles.intermediateDetailValue}>{selectedTime}</Text>
            </View>

            <View style={styles.intermediateDetailRow}>
              <Ionicons name="location-outline" size={20} color="#4361EE" />
              <Text style={styles.intermediateDetailLabel}>Workout:</Text>
              <Text style={styles.intermediateDetailValue}>
                {getWorkoutInfo(selectedDate)
                  ? getWorkoutInfo(selectedDate).type
                  : "Rest"}
              </Text>
            </View>
          </View>

          {/* Confirmation Message */}
          <View style={styles.intermediateConfirmationMessage}>
            <Text style={styles.intermediateConfirmationText}>
              Are you sure you want to book this session?
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.intermediateConfirmationButtons}>
            <Pressable
              style={[
                styles.cancelButton,
                isConfirming && styles.disabledButton,
              ]}
              onPress={onClose}
              disabled={isConfirming}
            >
              <Text
                style={[
                  styles.cancelButtonText,
                  isConfirming && styles.disabledButtonText,
                ]}
              >
                Cancel
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.confirmBookingButton,
                isConfirming && styles.loadingButton,
              ]}
              onPress={onConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.confirmBookingButtonText}>
                    Confirming...
                  </Text>
                </View>
              ) : (
                <Text style={styles.confirmBookingButtonText}>Confirm</Text>
              )}
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
  intermediateConfirmationModal: {
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
  questionIconContainer: {
    marginBottom: 20,
  },
  questionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF9500",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF9500",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  intermediateConfirmationTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 24,
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
  },
  intermediateSessionDetails: {
    width: "100%",
    marginBottom: 24,
  },
  intermediateDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  intermediateDetailLabel: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "#666",
    marginLeft: 12,
    marginRight: 8,
    minWidth: 60,
  },
  intermediateDetailValue: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  intermediateConfirmationMessage: {
    marginBottom: 24,
  },
  intermediateConfirmationText: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  intermediateConfirmationButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4361EE",
  },
  cancelButtonText: {
    color: "#4361EE",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
  confirmBookingButton: {
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
  confirmBookingButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    opacity: 0.5,
  },
  loadingButton: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});

export default IntermediateConfirmationModal;
