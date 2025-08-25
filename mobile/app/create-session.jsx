import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import { useSchedule } from "@/src/hooks";
import { Button } from "@/src/components/shared";
import { useButton } from "@/src/hooks/ui";
import {
  ConfirmationModal,
  ErrorModal,
  IntermediateConfirmationModal,
  CustomCalendarModal,
  CustomTimePickerModal,
} from "@/src/components/schedule";

export default function CreateSessionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showCustomCalendarModal, setShowCustomCalendarModal] = useState(false);
  const [showCustomTimePickerModal, setShowCustomTimePickerModal] =
    useState(false);

  const scheduleData = useSchedule();
  const { withLoading, loading, disabled } = useButton();

  const {
    // State
    selectedDate,
    selectedTime,
    showConfirmationModal,
    showErrorModal,
    showIntermediateConfirmation,
    isConfirming,
    currentYear,
    currentMonth,

    // Constants
    monthNames,
    dayNames,

    // Functions
    getWorkoutInfo,
    handleDateSelectWithContext,
    handleContinue,
    handleConfirmBooking,

    // Validation functions
    isDateInPast,
    isTimeSlotInPast,
    isDateTimeValid,

    // Setters
    setShowConfirmationModal,
    setShowErrorModal,
    setShowIntermediateConfirmation,
    sessionType,
    setSessionType,
    descriptions,
    setDescriptions,
    sessionTitle,
    setSessionTitle,
    endTime,
    setEndTime,
  } = scheduleData;

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
        behavior={
          isDescriptionFocused
            ? Platform.OS === "ios"
              ? "padding"
              : "height"
            : undefined
        }
        keyboardVerticalOffset={isDescriptionFocused ? insets.top + 10 : 0}
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
          {/* Title Input */}
          <View style={styles.titleSection}>
            <TextInput
              style={styles.titleInput}
              color={theme.titleInput}
              placeholder="Add title"
              placeholderTextColor={theme.textPrimary}
              value={sessionTitle}
              onChangeText={setSessionTitle}
            />
          </View>

          {/* Date and Time Section */}
          <View style={styles.dateTimeSection}>
            {/* Select Date */}
            <Pressable
              style={styles.dateTimeRow}
              onPress={() => setShowCustomCalendarModal(true)}
            >
              <View style={styles.dateTimeInfo}>
                <Text style={styles.dateTimeLabel}>Select Date</Text>
                <Text style={styles.dateTimeValue}>
                  {selectedDate
                    ? `${dayNames[new Date(currentYear, currentMonth, selectedDate).getDay()]}, ${monthNames[currentMonth]} ${selectedDate}, ${currentYear}`
                    : "Select date"}
                </Text>
              </View>
              <View style={styles.timeButton}>
                <Text style={styles.timeValue}>
                  {selectedTime ? selectedTime : ""}
                </Text>
              </View>
              <Ionicons
                name="create-outline"
                size={20}
                color={theme.textLabel}
              />
            </Pressable>

            {/* Select Time */}
            <Pressable
              style={styles.dateTimeRow}
              onPress={() => setShowCustomTimePickerModal(true)}
            >
              <View style={styles.dateTimeInfo}>
                <Text style={styles.dateTimeLabel}>Select Time</Text>
                <Text style={styles.dateTimeValue}>
                  {endTime || "Select time"}
                </Text>
              </View>
              <Ionicons
                name="create-outline"
                size={20}
                color={theme.textLabel}
              />
            </Pressable>

            {/* Session Type Selection */}
            <Pressable
              style={styles.groupRow}
              onPress={() => setShowGroupModal(true)}
            >
              <Ionicons
                name={
                  sessionType === "solo" ? "person-outline" : "people-outline"
                }
                size={20}
                color={theme.textLabel}
              />
              <Text style={styles.groupLabel}>
                {sessionType === "solo"
                  ? "Solo"
                  : sessionType === "group"
                    ? "Group"
                    : "Select Type"}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.textLabel}
              />
            </Pressable>
          </View>

          {/* Descriptions */}
          <View style={styles.descriptionSection}>
            <Text style={styles.dateTimeLabel}>Descriptions</Text>
            {/* Descriptions Input*/}
            <TextInput
              style={styles.descriptionInput}
              placeholder="Add any notes (optional)"
              placeholderTextColor={theme.textPlaceholderPrimary}
              value={descriptions}
              onChangeText={setDescriptions}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onFocus={() => setIsDescriptionFocused(true)}
              onBlur={() => setIsDescriptionFocused(false)}
            />
          </View>

          {/* Save Button - shared component */}
          <View style={styles.addButtonContainer}>
            <Button
              title={loading ? "Adding..." : "Add"}
              loading={loading}
              disabled={disabled}
              onPress={() =>
                withLoading(() => handleContinue(sessionTitle, endTime))
              }
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        selectedDate={selectedDate}
        selectedTime={endTime}
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
        selectedTime={endTime} // Use endTime instead of selectedTime
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
        selectedTime={endTime}
        currentYear={currentYear}
        currentMonth={currentMonth}
        monthNames={monthNames}
        getWorkoutInfo={getWorkoutInfo}
        isConfirming={isConfirming}
      />

      {/* Group Selection Modal */}
      <Modal
        visible={showGroupModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGroupModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowGroupModal(false)}
        >
          <Pressable
            style={styles.groupModal}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.groupModalHeader}>
              <Text style={styles.groupModalTitle}>Select Type</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowGroupModal(false)}
              >
                <Ionicons name="close" size={24} color={theme.textLabel} />
              </Pressable>
            </View>

            <View style={styles.groupOptions}>
              <Pressable
                style={styles.groupOption}
                onPress={() => {
                  setSessionType("solo");
                  setShowGroupModal(false);
                }}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={theme.iconColor}
                />
                <Text style={styles.groupOptionText}>Solo</Text>
                {sessionType === "solo" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.iconColor}
                  />
                )}
              </Pressable>

              <Pressable
                style={styles.groupOption}
                onPress={() => {
                  setSessionType("group");
                  setShowGroupModal(false);
                }}
              >
                <Ionicons
                  name="people-outline"
                  size={20}
                  color={theme.iconColor}
                />
                <Text style={styles.groupOptionText}>Group</Text>
                {sessionType === "group" && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.iconColor}
                  />
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Custom Calendar Modal */}
      <CustomCalendarModal
        visible={showCustomCalendarModal}
        onClose={() => setShowCustomCalendarModal(false)}
        onDateSelect={(day, month, year) => {
          handleDateSelectWithContext(day, month, year);
          // Don't close the modal automatically - let user keep selecting or click OK/Cancel
        }}
        selectedDate={selectedDate}
        currentYear={currentYear}
        currentMonth={currentMonth}
        monthNames={monthNames}
        dayNames={dayNames}
      />

      {/* Custom Time Picker Modal */}
      <CustomTimePickerModal
        visible={showCustomTimePickerModal}
        onClose={() => setShowCustomTimePickerModal(false)}
        onTimeSelect={(time) => {
          setEndTime(time);
          // Don't close the modal automatically - let user keep selecting
        }}
        selectedTime={endTime}
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
    paddingBottom: 0,
  },
  titleSection: {
    marginHorizontal: 20,
  },
  titleInput: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 24,
    color: "#1A1A1A",
    paddingVertical: 10,
  },
  dateTimeSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },

  dateTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dateTimeInfo: {
    flex: 1,
  },
  dateTimeLabel: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  dateTimeValue: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    color: "#212427",
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  groupLabel: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "#1A1A1A",
    marginLeft: 12,
    flex: 1,
  },
  descriptionSection: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  descriptionInput: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    shadowColor: "#E0E0E0",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 0,
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    color: "#212427",
    minHeight: 75,
  },
  addButtonContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  groupModal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  groupModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  groupModalTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 20,
    color: "#1A1A1A",
  },
  groupOptions: {
    gap: 16,
  },
  groupOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
  },
  groupOptionText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "#1A1A1A",
    marginLeft: 12,
    flex: 1,
  },
});
