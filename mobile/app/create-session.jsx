import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import { useSchedule } from "@/src/hooks";
import {
  WorkoutLegend,
  Calendar,
  TimeSelector,
  TimePickerModal,
  ConfirmationModal,
  ErrorModal,
  IntermediateConfirmationModal,
} from "@/src/components/schedule";

export default function CreateSessionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const {
    // State
    selectedDate,
    selectedTime,
    showTimePicker,
    showConfirmationModal,
    showErrorModal,
    showIntermediateConfirmation,
    isConfirming,
    currentYear,
    currentMonth,
    calendarGrid,

    // Constants
    WORKOUT_SCHEDULE,
    TIME_SLOTS,
    monthNames,
    dayNames,

    // Functions
    isWeekend,
    getWorkoutInfo,
    handlePrevMonth,
    handleNextMonth,
    handleDateSelect,
    handleTimeSelect,
    handleContinue,
    handleConfirmBooking,

    // Validation functions
    isDateInPast,
    isTimeSlotInPast,
    isDateTimeValid,

    // Setters
    setShowTimePicker,
    setShowConfirmationModal,
    setShowErrorModal,
    setShowIntermediateConfirmation,
    sessionType,
    setSessionType,
    descriptions,
    setDescriptions,
  } = useSchedule();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Create Session
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top + 60}
      >
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
        >
          {/* Workout Legend */}
          <WorkoutLegend
            workoutSchedule={WORKOUT_SCHEDULE}
            dayNames={dayNames}
          />

          {/* Calendar Section */}
          <Calendar
            currentYear={currentYear}
            currentMonth={currentMonth}
            calendarGrid={calendarGrid}
            selectedDate={selectedDate}
            monthNames={monthNames}
            isWeekend={isWeekend}
            isDateInPast={isDateInPast}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onDateSelect={handleDateSelect}
          />

          {/* Time Selection */}
          <View style={styles.labelRow}>
            <Text style={styles.typeLabel}>Select a Time</Text>
          </View>
          <TimeSelector
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onTimeSelect={handleTimeSelect}
            onShowTimePicker={() => setShowTimePicker(true)}
            isTimeSlotInPast={isTimeSlotInPast}
            currentYear={currentYear}
            currentMonth={currentMonth}
          />

          {/* Session Type Selection */}
          <View style={styles.typeSection}>
            <Text style={styles.typeLabel}>Session Type</Text>
            <View style={styles.typeOptions}>
              <Pressable
                style={[
                  styles.typeOption,
                  sessionType === "solo" && styles.typeOptionSelected,
                ]}
                onPress={() => setSessionType("solo")}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={sessionType === "solo" ? "white" : "#4361EE"}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    sessionType === "solo" && styles.typeOptionTextSelected,
                  ]}
                >
                  Solo
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.typeOption,
                  sessionType === "group" && styles.typeOptionSelected,
                ]}
                onPress={() => setSessionType("group")}
              >
                <Ionicons
                  name="people-outline"
                  size={18}
                  color={sessionType === "group" ? "white" : "#4361EE"}
                />
                <Text
                  style={[
                    styles.typeOptionText,
                    sessionType === "group" && styles.typeOptionTextSelected,
                  ]}
                >
                  Group
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Descriptions */}
          <View style={styles.descriptionSection}>
            <Text style={styles.typeLabel}>Descriptions</Text>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add any notes (optional)"
              placeholderTextColor="#999"
              value={descriptions}
              onChangeText={setDescriptions}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Continue Button */}
      <View
        style={[
          styles.floatingContinueWrapper,
          { bottom: Math.max(15, insets.bottom + 10) },
        ]}
        pointerEvents="box-none"
        collapsable={false}
      >
        <Pressable style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </Pressable>
      </View>

      {/* Time Picker Modal */}
      <TimePickerModal
        visible={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        timeSlots={TIME_SLOTS}
        currentYear={currentYear}
        currentMonth={currentMonth}
        monthNames={monthNames}
        dayNames={dayNames}
        onTimeSelect={handleTimeSelect}
        isTimeSlotInPast={isTimeSlotInPast}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        currentYear={currentYear}
        currentMonth={currentMonth}
        monthNames={monthNames}
        getWorkoutInfo={getWorkoutInfo}
      />

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        isDateTimeValid={isDateTimeValid}
        isDateInPast={isDateInPast}
        isTimeSlotInPast={isTimeSlotInPast}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />

      {/* Intermediate Confirmation Modal */}
      <IntermediateConfirmationModal
        visible={showIntermediateConfirmation}
        onClose={() => setShowIntermediateConfirmation(false)}
        onConfirm={handleConfirmBooking}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        currentYear={currentYear}
        currentMonth={currentMonth}
        monthNames={monthNames}
        getWorkoutInfo={getWorkoutInfo}
        isConfirming={isConfirming}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 22,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 72, // Enough space for the floating button
  },
  typeSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  typeLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  typeOptions: {
    flexDirection: "row",
    gap: 15,
  },
  labelRow: {
    marginHorizontal: 20,
  },
  typeOption: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    borderWidth: 2,
    borderColor: "#E0E0E0",
  },
  typeOptionSelected: {
    backgroundColor: "#4361EE",
    borderColor: "#4361EE",
  },
  typeOptionText: {
    marginLeft: 8,
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    color: "#333",
  },
  typeOptionTextSelected: {
    color: "white",
  },
  descriptionSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  descriptionInput: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 0,
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    color: "#333",
    minHeight: 100,
  },
  continueButton: {
    backgroundColor: "#4361EE",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  continueButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
  },
  floatingContinueWrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 15,
    zIndex: 100,
  },
});
