import React, { useMemo, useCallback, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { StatusBar, setStatusBarStyle } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

export default function CustomTimePickerModal({
  visible,
  onClose,
  onTimeSelect,
  selectedTime,
  selectedDate,
  currentYear,
  currentMonth,
  capacityMap = {},
  maxCapacity = 5,
}) {
  const timeSlots = useMemo(
    () => [
      "7:30 AM - 8:30 AM",
      "9:30 AM - 10:30 AM",
      "4:00 PM - 5:00 PM",
      "5:30 PM - 6:30 PM",
      "6:30 PM - 7:30 PM",
      "7:30 PM - 8:30 PM",
    ],
    [],
  );

  // Helper function to check if a time slot is in the past for today
  const isTimeSlotInPast = useCallback((timeSlot) => {
    if (!selectedDate || !timeSlot) return false;

    const today = new Date();

    // Check if the selected date is today by comparing the actual dates
    const selectedDateObj = new Date(currentYear, currentMonth, selectedDate);
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const isToday = selectedDateObj.getTime() === todayStart.getTime();

    if (!isToday) return false;

    try {
      // Parse the time slot (e.g., "4:00 PM - 5:00 PM")
      const startPart = timeSlot.split("-")[0].trim(); // "4:00 PM"
      const [time, meridiem] = startPart.split(" ");
      let [hours, minutes] = time.split(":").map((t) => parseInt(t, 10));

      if (meridiem?.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (meridiem?.toUpperCase() === "AM" && hours === 12) hours = 0;

      const timeSlotDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        hours,
        minutes,
      );
      return timeSlotDate < today;
    } catch (error) {
      console.error("Error parsing time slot:", error);
      return false;
    }
  }, [selectedDate, currentYear, currentMonth]);

  const handleTimeSelect = useCallback(
    (time) => {
      // Don't allow selection of past time slots
      if (isTimeSlotInPast(time)) {
        return;
      }
      onTimeSelect(time);
      // Don't close the modal - let user keep selecting until they click X or outside
    },
    [onTimeSelect, isTimeSlotInPast],
  );

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
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      onShow={() => setStatusBarStyle("light", true)}
      onDismiss={() => setStatusBarStyle("dark", true)}
    >
      <StatusBar style="light" animated />
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Select Time</Text>
          </View>

          {/* Time Options */}
          <View style={styles.timeOptions}>
            {timeSlots.map((time, index) => {
              const isPast = isTimeSlotInPast(time);
              const isFull = (capacityMap?.[time] || 0) >= maxCapacity;
              const isSelected = selectedTime === time;
              const isDisabled = isPast || isFull;
              
              return (
                <Pressable
                  key={index}
                  style={[
                    styles.timeOption,
                    isSelected && styles.timeOptionSelected,
                    isDisabled && styles.timeOptionDisabled,
                  ]}
                  onPress={() => handleTimeSelect(time)}
                  disabled={isDisabled}
                >
                  <Text
                    style={[
                      styles.timeOptionText,
                      isSelected && styles.timeOptionTextSelected,
                      isDisabled && styles.timeOptionTextDisabled,
                    ]}
                  >
                    {time}{isFull ? "  (Full)" : ""}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={styles.okButton}
              onPress={() => {
                if (selectedTime) {
                  onClose();
                }
              }}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  modalContainer: {
    backgroundColor: "#F4F4F5", // Light creamy yellow background
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0", // Light gray horizontal line
  },
  headerTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 18,
    color: "#333", // Dark gray text
  },
  timeOptions: {
    gap: 12,
  },
  timeOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  timeOptionSelected: {
    backgroundColor: "#4361EE", // Blue background for selected
    borderColor: "#4361EE",
  },
  timeOptionDisabled: {
    backgroundColor: "#F5F5F5", // Light gray background for disabled
    borderColor: "#E0E0E0",
    opacity: 0.5,
  },
  timeOptionText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "#333", // Black text for unselected
    textAlign: "center",
  },
  timeOptionTextSelected: {
    color: "white", // White text for selected
  },
  timeOptionTextDisabled: {
    color: "#999", // Gray text for disabled
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minWidth: 100,
  },
  cancelButtonText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "#4361EE",
  },
  okButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  okButtonText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "#4361EE",
  },
});
