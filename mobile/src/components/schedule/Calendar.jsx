import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const Calendar = ({
  currentYear,
  currentMonth,
  calendarGrid,
  selectedDate,
  monthNames,
  isWeekend,
  isDateInPast,
  onPrevMonth,
  onNextMonth,
  onDateSelect,
}) => {
  // Group calendar grid into weeks
  const weeks = [];
  for (let i = 0; i < calendarGrid.length; i += 7) {
    weeks.push(calendarGrid.slice(i, i + 7));
  }

  return (
    <View style={styles.calendarSection}>
      <View style={styles.calendarHeader}>
        <Text style={styles.monthYear}>
          {monthNames[currentMonth]} {currentYear}
        </Text>
        <View style={styles.calendarNav}>
          <Pressable style={styles.navButton} onPress={onPrevMonth}>
            <Ionicons name="chevron-back" size={20} color="#666" />
          </Pressable>
          <Pressable style={styles.navButton} onPress={onNextMonth}>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
        </View>
      </View>

      {/* Days of Week */}
      <View style={styles.daysHeader}>
        {DAYS_OF_WEEK.map((day) => (
          <Text key={day} style={styles.dayHeader}>
            {day}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.calendarRow}>
            {week.map((date, dateIndex) => {
              const isPast =
                date && isDateInPast(date, currentYear, currentMonth);
              const isDisabled = !date || isPast;

              return (
                <Pressable
                  key={dateIndex}
                  style={[
                    styles.dateCell,
                    date === selectedDate && styles.selectedDate,
                    !date && styles.emptyCell,
                    isPast && styles.pastDate,
                  ]}
                  onPress={() => onDateSelect(date)}
                  disabled={isDisabled}
                >
                  {date && (
                    <Text
                      style={[
                        styles.dateText,
                        date === selectedDate && styles.selectedDateText,
                        isWeekend(date, currentYear, currentMonth) &&
                          date !== selectedDate &&
                          !isPast &&
                          styles.weekendDateText,
                        isPast && styles.pastDateText,
                      ]}
                    >
                      {date}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendarSection: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthYear: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 22,
    color: "#333",
  },
  calendarNav: {
    flexDirection: "row",
  },
  navButton: {
    padding: 8,
    marginLeft: 8,
  },
  daysHeader: {
    flexDirection: "row",
    marginBottom: 16,
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontFamily: Fonts.family.medium,
    fontSize: 12,
    color: "#666",
  },
  calendarGrid: {
    gap: 8,
  },
  calendarRow: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-start",
  },
  dateCell: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    margin: 1,
  },
  emptyCell: {
    backgroundColor: "transparent",
    margin: 1,
    width: 40,
    height: 40,
  },
  selectedDate: {
    backgroundColor: "#4361EE",
    borderRadius: 8,
    width: 40,
    height: 40,
  },
  dateText: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
  },
  selectedDateText: {
    color: "white",
    fontFamily: Fonts.family.bold,
  },
  weekendDateText: {
    color: "#FF6B6B",
  },
  pastDate: {
    backgroundColor: "#E0E0E0",
    opacity: 0.7,
  },
  pastDateText: {
    color: "#9E9E9E",
  },
});

export default Calendar;
