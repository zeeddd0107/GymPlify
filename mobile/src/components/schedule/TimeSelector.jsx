import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

const TimeSelector = ({
  selectedDate,
  selectedTime,
  onShowTimePicker,
  isTimeSlotInPast,
  currentYear,
  currentMonth,
}) => {
  const isTimeInPast =
    !!selectedDate &&
    !!selectedTime &&
    isTimeSlotInPast(selectedDate, selectedTime, currentYear, currentMonth);

  return (
    <View style={styles.timeSection}>
      <Pressable
        style={[
          styles.timeInput,
          !selectedDate && styles.timeInputDisabled,
          isTimeInPast && styles.timeInputWarning,
        ]}
        onPress={() => selectedDate && onShowTimePicker()}
        disabled={!selectedDate}
      >
        <View>
          <Text
            style={[
              styles.selectedTimeText,
              !selectedDate && styles.selectedTimeTextDisabled,
              isTimeInPast && styles.selectedTimeTextWarning,
            ]}
          >
            {selectedTime || "No Time is selected yet"}
          </Text>
          {isTimeInPast && (
            <Text style={styles.warningText}>
              ⚠️ This time has already passed for today
            </Text>
          )}
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={selectedDate ? "#666" : "#ccc"}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  timeSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  timeInput: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.23,
    shadowRadius: 6,
    elevation: 3,
  },
  timeInputDisabled: {
    backgroundColor: "#f5f5f5",
    shadowOpacity: 0.05,
  },
  timeInputWarning: {
    borderColor: "red",
    borderWidth: 1,
  },
  selectedTimeText: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    color: "#333",
  },
  selectedTimeTextDisabled: {
    color: "#ccc",
  },
  selectedTimeTextWarning: {
    color: "red",
  },
  warningText: {
    fontFamily: Fonts.family.regular,
    fontSize: 12,
    color: "red",
    marginTop: 4,
  },
});

export default TimeSelector;
