import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

const ErrorModal = ({
  visible,
  onClose,
  selectedDate,
  selectedTime,
  isDateInPast,
  isTimeSlotInPast,
  currentYear,
  currentMonth,
}) => {
  // Determine the type of error
  const hasDate = !!selectedDate;
  const hasTime = !!selectedTime;
  const isPastDate =
    selectedDate &&
    isDateInPast &&
    isDateInPast(selectedDate, currentYear, currentMonth);
  const isPastTime =
    selectedDate &&
    !!selectedTime &&
    isTimeSlotInPast &&
    isTimeSlotInPast(selectedDate, selectedTime, currentYear, currentMonth);

  let errorTitle = "Missing Information";
  let errorMessage =
    "Please select both a date and time to continue with your booking.";

  if (isPastDate) {
    errorTitle = "Date in the Past";
    errorMessage =
      "You cannot schedule a session for a date that has already passed. Please select a future date.";
  } else if (isPastTime) {
    errorTitle = "Time in the Past";
    errorMessage =
      "You cannot schedule a session for a time that has already passed today. Please select a future time.";
  } else if (!hasDate && !hasTime) {
    errorTitle = "Missing Information";
    errorMessage =
      "Please select both a date and time to continue with your booking.";
  } else if (!hasDate) {
    errorTitle = "Date Required";
    errorMessage = "Please select a date to continue with your booking.";
  } else if (!hasTime) {
    errorTitle = "Time Required";
    errorMessage = "Please select a time to continue with your booking.";
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.errorModal}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Warning Icon */}
          <View style={styles.warningIconContainer}>
            <View style={styles.warningIcon}>
              <Ionicons name="warning" size={40} color="white" />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.errorTitle}>{errorTitle}</Text>

          {/* Error Message */}
          <View style={styles.errorMessageContainer}>
            <Text style={styles.errorMessageText}>{errorMessage}</Text>
          </View>

          {/* Missing Items List */}
          <View style={styles.missingItemsContainer}>
            <View style={styles.missingItem}>
              <Ionicons
                name={
                  hasDate && !isPastDate ? "checkmark-circle" : "close-circle"
                }
                size={20}
                color={hasDate && !isPastDate ? "#4CAF50" : "#FF6B6B"}
              />
              <Text
                style={[
                  styles.missingItemText,
                  { color: hasDate && !isPastDate ? "#4CAF50" : "#FF6B6B" },
                ]}
              >
                {hasDate && !isPastDate
                  ? "Date Selected"
                  : isPastDate
                    ? "Date in Past"
                    : "Date Required"}
              </Text>
            </View>

            <View style={styles.missingItem}>
              <Ionicons
                name={
                  hasTime && !isPastTime ? "checkmark-circle" : "close-circle"
                }
                size={20}
                color={hasTime && !isPastTime ? "#4CAF50" : "#FF6B6B"}
              />
              <Text
                style={[
                  styles.missingItemText,
                  {
                    color: hasTime && !isPastTime ? "#4CAF50" : "#FF6B6B",
                  },
                ]}
              >
                {hasTime && !isPastTime
                  ? "Time Selected"
                  : isPastTime
                    ? "Time in Past"
                    : "Time Required"}
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <View style={styles.errorButtonContainer}>
            <Pressable style={styles.errorButton} onPress={onClose}>
              <Text style={styles.errorButtonText}>Got It</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  errorModal: {
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
  warningIconContainer: {
    marginBottom: 20,
  },
  warningIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B6B",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  errorTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 24,
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  errorMessageContainer: {
    marginBottom: 24,
  },
  errorMessageText: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  missingItemsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  missingItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  missingItemText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    marginLeft: 12,
  },
  errorButtonContainer: {
    width: "100%",
  },
  errorButton: {
    backgroundColor: "#FF6B6B",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  errorButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
});

export default ErrorModal;
