import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

export default function CustomTimePickerModal({
  visible,
  onClose,
  onTimeSelect,
  selectedTime,
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

  const handleTimeSelect = useCallback(
    (time) => {
      onTimeSelect(time);
      // Don't close the modal - let user keep selecting until they click X or outside
    },
    [onTimeSelect],
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent={false}
    >
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
            {timeSlots.map((time, index) => (
              <Pressable
                key={index}
                style={[
                  styles.timeOption,
                  selectedTime === time && styles.timeOptionSelected,
                ]}
                onPress={() => handleTimeSelect(time)}
              >
                <Text
                  style={[
                    styles.timeOptionText,
                    selectedTime === time && styles.timeOptionTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </Pressable>
            ))}
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
    backgroundColor: "rgba(0, 0, 0, 0.6)",
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
  timeOptionText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "#333", // Black text for unselected
    textAlign: "center",
  },
  timeOptionTextSelected: {
    color: "white", // White text for selected
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
