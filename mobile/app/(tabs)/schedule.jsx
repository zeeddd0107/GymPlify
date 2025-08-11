import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts } from "@/src/constants/Fonts";

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const TIME_SLOTS = [
  "7:30 AM - 8:30 AM",
  "9:30 AM - 10:30 AM",
  "4:00 PM - 5:00 PM",
  "5:30 PM - 6:30 PM",
  "6:30 PM - 7:30 PM",
  "7:30 PM - 8:30 PM",
];

// Helper function to get days in month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Helper function to get first day of month
const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

// Helper function to generate calendar grid
const generateCalendarGrid = (year, month) => {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const grid = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    grid.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    grid.push(day);
  }

  return grid;
};

export default function ScheduleScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("Select a Time");
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showIntermediateConfirmation, setShowIntermediateConfirmation] =
    useState(false);
  const insets = useSafeAreaInsets();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const calendarGrid = generateCalendarGrid(currentYear, currentMonth);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (!selectedDate || selectedTime === "Select a Time") {
      setShowErrorModal(true);
      return;
    }
    setShowIntermediateConfirmation(true);
  };

  // Group calendar grid into weeks
  const weeks = [];
  for (let i = 0; i < calendarGrid.length; i += 7) {
    weeks.push(calendarGrid.slice(i, i + 7));
  }

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.scheduleTitle}>Schedule Session</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Calendar Section */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <Text style={styles.monthYear}>
              {monthNames[currentMonth]} {currentYear}
            </Text>
            <View style={styles.calendarNav}>
              <Pressable style={styles.navButton} onPress={handlePrevMonth}>
                <Ionicons name="chevron-back" size={20} color="#666" />
              </Pressable>
              <Pressable style={styles.navButton} onPress={handleNextMonth}>
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
                {week.map((date, dateIndex) => (
                  <Pressable
                    key={dateIndex}
                    style={[
                      styles.dateCell,
                      date === selectedDate && styles.selectedDate,
                      !date && styles.emptyCell,
                    ]}
                    onPress={() => handleDateSelect(date)}
                    disabled={!date}
                  >
                    {date && (
                      <Text
                        style={[
                          styles.dateText,
                          date === selectedDate && styles.selectedDateText,
                        ]}
                      >
                        {date}
                      </Text>
                    )}
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Time Selection */}
        <View style={styles.timeSection}>
          <Pressable
            style={[
              styles.timeInput,
              !selectedDate && styles.timeInputDisabled,
            ]}
            onPress={() => selectedDate && setShowTimePicker(true)}
            disabled={!selectedDate}
          >
            <View>
              <Text style={styles.timePlaceholder}>Select a Time</Text>
              <Text
                style={[
                  styles.selectedTimeText,
                  !selectedDate && styles.selectedTimeTextDisabled,
                ]}
              >
                {selectedTime}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={selectedDate ? "#666" : "#ccc"}
            />
          </Pressable>
        </View>
      </ScrollView>

      {/* Continue Button at the bottom */}
      <View style={styles.continueButtonWrapper}>
        <Pressable style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </View>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTimePicker(false)}
        >
          <Pressable
            style={styles.timePickerModal}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowTimePicker(false)}>
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
              {TIME_SLOTS.map((time) => (
                <Pressable
                  key={time}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.selectedTimeSlot,
                  ]}
                  onPress={() => handleTimeSelect(time)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedTime === time && styles.selectedTimeSlotText,
                    ]}
                  >
                    {time}
                  </Text>
                </Pressable>
              ))}
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
                    setShowTimePicker(false);
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

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowConfirmationModal(false)}
        >
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
                <Text style={styles.detailLabel}>Location:</Text>
                <Text style={styles.detailValue}>GymPlify Studio</Text>
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
                onPress={() => setShowConfirmationModal(false)}
              >
                <Text style={styles.viewScheduleButtonText}>View Schedule</Text>
              </Pressable>

              <Pressable
                style={styles.bookAnotherButton}
                onPress={() => {
                  setShowConfirmationModal(false);
                  setSelectedDate(null);
                  setSelectedTime("Select a Time");
                }}
              >
                <Text style={styles.bookAnotherButtonText}>Book Another</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Error Modal */}
      <Modal
        visible={showErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowErrorModal(false)}
        >
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
            <Text style={styles.errorTitle}>Missing Information</Text>

            {/* Error Message */}
            <View style={styles.errorMessageContainer}>
              <Text style={styles.errorMessageText}>
                Please select both a date and time to continue with your
                booking.
              </Text>
            </View>

            {/* Missing Items List */}
            <View style={styles.missingItemsContainer}>
              <View style={styles.missingItem}>
                <Ionicons
                  name={selectedDate ? "checkmark-circle" : "close-circle"}
                  size={20}
                  color={selectedDate ? "#4CAF50" : "#FF6B6B"}
                />
                <Text
                  style={[
                    styles.missingItemText,
                    { color: selectedDate ? "#4CAF50" : "#FF6B6B" },
                  ]}
                >
                  {selectedDate ? "Date Selected" : "Date Required"}
                </Text>
              </View>

              <View style={styles.missingItem}>
                <Ionicons
                  name={
                    selectedTime !== "Select a Time"
                      ? "checkmark-circle"
                      : "close-circle"
                  }
                  size={20}
                  color={
                    selectedTime !== "Select a Time" ? "#4CAF50" : "#FF6B6B"
                  }
                />
                <Text
                  style={[
                    styles.missingItemText,
                    {
                      color:
                        selectedTime !== "Select a Time"
                          ? "#4CAF50"
                          : "#FF6B6B",
                    },
                  ]}
                >
                  {selectedTime !== "Select a Time"
                    ? "Time Selected"
                    : "Time Required"}
                </Text>
              </View>
            </View>

            {/* Action Button */}
            <View style={styles.errorButtonContainer}>
              <Pressable
                style={styles.errorButton}
                onPress={() => setShowErrorModal(false)}
              >
                <Text style={styles.errorButtonText}>Got It</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Intermediate Confirmation Modal */}
      <Modal
        visible={showIntermediateConfirmation}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowIntermediateConfirmation(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowIntermediateConfirmation(false)}
        >
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
              Confirm Booking
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
                <Text style={styles.intermediateDetailValue}>
                  {selectedTime}
                </Text>
              </View>

              <View style={styles.intermediateDetailRow}>
                <Ionicons name="location-outline" size={20} color="#4361EE" />
                <Text style={styles.intermediateDetailLabel}>Location:</Text>
                <Text style={styles.intermediateDetailValue}>
                  GymPlify Studio
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
                style={styles.cancelButton}
                onPress={() => setShowIntermediateConfirmation(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.confirmBookingButton}
                onPress={() => {
                  setShowIntermediateConfirmation(false);
                  setShowConfirmationModal(true);
                }}
              >
                <Text style={styles.confirmBookingButtonText}>Confirm</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9ff",
  },

  topBar: {
    backgroundColor: "white",
    alignItems: "center",
    paddingBottom: 10,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  scheduleTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 24,
    color: "#333",
  },

  trainerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },

  trainerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  trainerName: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    color: "#333",
  },
  appointmentTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 24,
    color: "#333",
  },
  durationInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  scrollContainer: {
    flex: 1,
  },
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
    color: "#333",
  },
  selectedDateText: {
    color: "white",
    fontFamily: Fonts.family.bold,
  },
  timeSection: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  timeInput: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  timeInputDisabled: {
    backgroundColor: "#f5f5f5",
    shadowOpacity: 0.05,
  },
  timePlaceholder: {
    fontFamily: Fonts.family.regular,
    fontSize: 12,
    color: "#999",
    marginBottom: 4,
  },
  selectedTimeText: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    color: "#333",
  },
  selectedTimeTextDisabled: {
    color: "#ccc",
  },
  continueButton: {
    backgroundColor: "#4361EE",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
  },
  continueButtonWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f8f9ff",
  },
  // Modal Styles
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
  // Grab handle and modal header
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 10,
  },
  modalTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 18,
    color: "#333",
  },
  selectedDateDisplay: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedDayText: {
    fontFamily: Fonts.family.bold,
    fontSize: 20,
    color: "#333",
    marginBottom: 4,
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
  grabHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    marginBottom: 10,
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

  // Confirmation Modal Styles
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
    borderWidth: 2,
    borderColor: "#4361EE",
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  viewScheduleButtonText: {
    color: "#4361EE",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },

  bookAnotherButton: {
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

  bookAnotherButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },

  // Error Modal Styles
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
    elevation: 4,
  },

  errorButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },

  // Intermediate Confirmation Modal Styles
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
});
