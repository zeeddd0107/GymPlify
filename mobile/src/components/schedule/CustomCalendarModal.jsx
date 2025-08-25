import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

export default function CustomCalendarModal({
  visible,
  onClose,
  onDateSelect,
  currentYear,
  currentMonth,
  monthNames,
  dayNames,
}) {
  const [currentViewYear, setCurrentViewYear] = useState(currentYear);
  const [currentViewMonth, setCurrentViewMonth] = useState(currentMonth);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Generate calendar grid for the current month
  const generateCalendarGrid = () => {
    const firstDay = new Date(currentViewYear, currentViewMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const calendar = [];
    const currentDate = new Date(startDate);

    // Get today's date for comparison
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        const isPast = currentDate < todayStart;
        const dateObj = {
          date: new Date(currentDate),
          day: currentDate.getDate(),
          month: currentDate.getMonth(),
          year: currentDate.getFullYear(),
          isCurrentMonth: currentDate.getMonth() === currentViewMonth,
          isPast: isPast,
          isSelected:
            selectedDateInfo &&
            selectedDateInfo.day === currentDate.getDate() &&
            selectedDateInfo.month === currentDate.getMonth() &&
            selectedDateInfo.year === currentDate.getFullYear(),
        };
        weekDays.push(dateObj);
        currentDate.setDate(currentDate.getDate() + 1);
      }
      calendar.push(weekDays);
    }

    return calendar;
  };

  const handlePrevMonth = useCallback(() => {
    const today = new Date();
    const todayYear = today.getFullYear();

    // Don't allow navigation to past years
    if (currentViewYear < todayYear) {
      return;
    }

    if (currentViewMonth === 0) {
      setCurrentViewMonth(11);
      setCurrentViewYear(currentViewYear - 1);
    } else {
      setCurrentViewMonth(currentViewMonth - 1);
    }
  }, [currentViewYear, currentViewMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentViewMonth === 11) {
      setCurrentViewMonth(0);
      setCurrentViewYear(currentViewYear + 1);
    } else {
      setCurrentViewMonth(currentViewMonth + 1);
    }
  }, [currentViewYear, currentViewMonth]);

  const showWarningMessage = useCallback(
    (message) => {
      setWarningMessage(message);
      setShowWarning(true);

      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Auto hide after 1.5 seconds
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setShowWarning(false);
        });
      }, 1500);
    },
    [fadeAnim],
  );

  const handleDatePress = useCallback(
    (dateObj) => {
      if (!dateObj.isPast) {
        const dateInfo = {
          day: dateObj.day,
          month: dateObj.month,
          year: dateObj.year,
        };
        setSelectedDateInfo(dateInfo);
        onDateSelect(dateObj.day, dateObj.month, dateObj.year);
        // Don't close the modal - let user keep selecting or click OK/Cancel
      } else {
        showWarningMessage("Cannot select past dates");
      }
    },
    [onDateSelect],
  );

  const calendarGrid = useMemo(
    () => generateCalendarGrid(),
    [currentViewYear, currentViewMonth, selectedDateInfo],
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
            <View style={styles.headerLeft}>
              <Text style={styles.selectDateLabel}>Select Date</Text>
              <Text style={styles.selectedDateDisplay}>
                {selectedDateInfo
                  ? `${monthNames[selectedDateInfo.month]} ${selectedDateInfo.day}, ${selectedDateInfo.year}`
                  : `${monthNames[currentViewMonth]} ${new Date().getDate()}, ${currentViewYear}`}
              </Text>
            </View>
          </View>

          {/* Calendar Navigation */}
          <View style={styles.calendarNavigation}>
            <View style={styles.monthYearSection}>
              <Text style={styles.monthYearText}>
                {monthNames[currentViewMonth]} {currentViewYear}
              </Text>
            </View>
            <View style={styles.navigationArrows}>
              <Pressable style={styles.navArrow} onPress={handlePrevMonth}>
                <Ionicons name="chevron-back" size={20} color="#666" />
              </Pressable>
              <Pressable style={styles.navArrow} onPress={handleNextMonth}>
                <Ionicons name="chevron-forward" size={20} color="#666" />
              </Pressable>
            </View>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekdayLabels}>
            {dayNames.map((day, index) => (
              <Text key={index} style={styles.weekdayLabel}>
                {day.charAt(0)}
              </Text>
            ))}
          </View>

          {/* Warning Message */}
          {showWarning && (
            <Animated.View
              style={[styles.warningContainer, { opacity: fadeAnim }]}
            >
              <Ionicons name="warning" size={16} color="#FF6B6B" />
              <Text style={styles.warningText}>{warningMessage}</Text>
            </Animated.View>
          )}

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {calendarGrid.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((dateObj, dayIndex) => (
                  <Pressable
                    key={dayIndex}
                    style={[
                      styles.dateCell,
                      dateObj.isSelected && styles.selectedDateCell,
                      !dateObj.isCurrentMonth && styles.otherMonthDate,
                      dateObj.isPast && styles.pastDate,
                    ]}
                    onPress={() => handleDatePress(dateObj)}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        dateObj.isSelected && styles.selectedDateText,
                        !dateObj.isCurrentMonth && styles.otherMonthDateText,
                        dateObj.isPast && styles.pastDateText,
                      ]}
                    >
                      {dateObj.day}
                    </Text>
                  </Pressable>
                ))}
              </View>
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
                onClose();
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
    backgroundColor: "#F4F4F5",
    borderRadius: 16,
    padding: 20,
    width: "95%",
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
    alignItems: "flex-start",
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  selectDateLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  selectedDateDisplay: {
    fontFamily: Fonts.family.bold,
    fontSize: 20,
    color: "#333",
  },
  calendarNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthYearSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  monthYearText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "#333",
  },
  navigationArrows: {
    flexDirection: "row",
    gap: 16,
  },
  navArrow: {
    padding: 8,
  },
  weekdayLabels: {
    flexDirection: "row",
    marginBottom: 16,
  },
  weekdayLabel: {
    flex: 1,
    textAlign: "center",
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    color: "#333",
  },
  calendarGrid: {
    marginBottom: 24,
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  dateCell: {
    flex: 1,
    height: 45,
    width: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 40,
  },
  selectedDateCell: {
    backgroundColor: "#4361EE",
  },
  otherMonthDate: {
    opacity: 0.3,
  },
  dateText: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    color: "#333",
  },
  selectedDateText: {
    color: "white",
    fontFamily: Fonts.family.medium,
  },
  otherMonthDateText: {
    color: "#999",
  },
  pastDate: {
    backgroundColor: "#E0E0E0",
    opacity: 0.6,
  },
  pastDateText: {
    color: "#999",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFE5E5",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    color: "#FF6B6B",
    textAlign: "center",
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
