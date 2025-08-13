import React from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

const TimePickerModal = ({
  visible,
  onClose,
  selectedDate,
  selectedTime,
  timeSlots,
  currentYear,
  currentMonth,
  monthNames,
  dayNames,
  onTimeSelect,
  isTimeSlotInPast,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.timePickerModal}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <View style={styles.modalHeader}>
            <Pressable onPress={onClose}>
              <View style={styles.grabHandle} />
            </Pressable>
          </View>

          {/* Selected Date Display */}
          {selectedDate && (
            <View style={styles.selectedDateDisplayCentered}>
              <Text style={styles.selectedDayTextCentered}>
                {
                  dayNames[
                    new Date(currentYear, currentMonth, selectedDate).getDay()
                  ]
                }
              </Text>
              <Text style={styles.selectedDateTextCentered}>
                {monthNames[currentMonth]} {selectedDate}, {currentYear}
              </Text>
            </View>
          )}

          <ScrollView style={styles.timeSlotsContainer}>
            {timeSlots.map((time) => {
              const isPast =
                selectedDate &&
                isTimeSlotInPast(selectedDate, time, currentYear, currentMonth);
              const isDisabled = isPast;

              return (
                <Pressable
                  key={time}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.selectedTimeSlot,
                    isPast && styles.pastTimeSlot,
                  ]}
                  onPress={() => !isDisabled && onTimeSelect(time)}
                  disabled={isDisabled}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedTime === time && styles.selectedTimeSlotText,
                      isPast && styles.pastTimeSlotText,
                    ]}
                  >
                    {time}
                  </Text>
                  {isPast && <Text style={styles.pastTimeLabel}>Past</Text>}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Confirm Button */}
          <View style={styles.confirmButtonContainer}>
            <Pressable
              style={[
                styles.confirmButton,
                !selectedTime && styles.confirmButtonDisabled,
              ]}
              onPress={() => {
                if (selectedTime) {
                  onClose();
                }
              }}
              disabled={!selectedTime}
            >
              <Text
                style={[
                  styles.confirmButtonText,
                  !selectedTime && styles.confirmButtonTextDisabled,
                ]}
              >
                Confirm
              </Text>
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
  timePickerModal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 0,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 10,
  },
  grabHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    marginBottom: 10,
  },
  selectedDateDisplayCentered: {
    alignItems: "center",
    paddingTop: 0,
  },
  selectedDayTextCentered: {
    fontFamily: Fonts.family.bold,
    fontSize: 20,
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  selectedDateTextCentered: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  timeSlotsContainer: {
    padding: 20,
  },
  timeSlot: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#f8f9ff",
  },
  selectedTimeSlot: {
    backgroundColor: "#4361EE",
  },
  timeSlotText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  selectedTimeSlotText: {
    color: "white",
    fontFamily: Fonts.family.bold,
  },
  pastTimeSlot: {
    backgroundColor: "#e0e0e0",
    opacity: 0.7,
  },
  pastTimeSlotText: {
    color: "#999",
  },
  pastTimeLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 4,
  },
  confirmButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#4361EE",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0.05,
  },
  confirmButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
  },
  confirmButtonTextDisabled: {
    color: "#999",
  },
});

export default TimePickerModal;
