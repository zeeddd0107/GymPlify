// Imports: React and hooks
import { useState, useEffect } from "react";
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
// Imports: Icons and safe area
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Imports: Navigation and theming
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import { useSchedule } from "@/src/hooks";
// Imports: Shared components
import { Button } from "@/src/components/shared";
import {
  ErrorModal,
  CustomCalendarModal,
  CustomTimePickerModal,
} from "@/src/components/schedule";
import { firebase, firestore } from "@/src/services/firebase";

// Component: Edit Session Screen
export default function EditSessionScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { sessionId } = params;

  // Local state specific to this screen
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);

  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showCustomCalendarModal, setShowCustomCalendarModal] = useState(false);
  const [showCustomTimePickerModal, setShowCustomTimePickerModal] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [error, setError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Hook: shared schedule state and helpers
  const scheduleData = useSchedule();

  const {
    // State
    selectedDate,
    selectedTime,
    showErrorModal,
    currentYear,
    currentMonth,

    // Constants
    monthNames,
    dayNames,

    // Functions
    getWorkoutInfo,
    handleDateSelectWithContext,

    // Validation functions
    isDateInPast,
    isTimeSlotInPast,
    isDateTimeValid,

    // Setters
    setShowErrorModal,
    sessionType,
    setSessionType,
    descriptions,
    setDescriptions,
    sessionTitle,
    setSessionTitle,
    endTime,
    setEndTime,
    setCurrentDate,
    setSelectedDate,
  } = scheduleData;

  // Effect: Fetch session data on mount
  useEffect(() => {
    const fetchSessionData = async () => {
      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.error("Session fetch timeout");
        setError("Request timeout - please try again");
        setLoading(false);
      }, 10000); // 10 second timeout

      try {
        setLoading(true);
        setError(null); // Clear any previous errors
        const user = firebase.auth().currentUser;
        console.log("Debug - sessionId:", sessionId);
        console.log("Debug - user:", user?.uid);

        if (!user || !sessionId) {
          console.log("No user or sessionId:", { user: !!user, sessionId });
          setError("Invalid session or user not authenticated");
          setLoading(false);
          return;
        }

        console.log("Attempting to fetch session with ID:", sessionId);

        // Try to decode the session ID if it's URL encoded
        const decodedSessionId = sessionId
          ? decodeURIComponent(sessionId)
          : sessionId;
        console.log("Decoded session ID:", decodedSessionId);

        // Check if the session ID is valid
        if (
          !decodedSessionId ||
          decodedSessionId === "undefined" ||
          decodedSessionId === "null"
        ) {
          console.error("Invalid session ID:", decodedSessionId);
          setError("Invalid session ID");
          setLoading(false);
          return;
        }

        const sessionDoc = await firestore
          .collection("sessions")
          .doc(decodedSessionId)
          .get();

        console.log("Session doc exists:", sessionDoc.exists);
        if (!sessionDoc.exists) {
          console.error("Session not found for ID:", decodedSessionId);
          setError("Session not found");
          setLoading(false);
          return;
        }

        const data = sessionDoc.data();
        console.log("Session data:", data);
        console.log("Session data keys:", Object.keys(data));

        // Check if the session belongs to the current user
        if (data.userId !== user.uid) {
          console.error("Session does not belong to current user");
          console.error("Session userId:", data.userId);
          console.error("Current user uid:", user.uid);
          setError("You don't have permission to edit this session");
          setLoading(false);
          return;
        }
        const sessionDate = data.scheduledDate?.toDate
          ? data.scheduledDate.toDate()
          : new Date(data.scheduledDate);

        // Pre-fill the form with existing session data
        setSessionTitle(data.title || "");
        setDescriptions(data.descriptions || "");
        setSessionType(data.type || "solo");
        setEndTime(data.timeSlot || "");

        // Set the selected date to match the session date
        const sessionYear = sessionDate.getFullYear();
        const sessionMonth = sessionDate.getMonth();
        const sessionDay = sessionDate.getDate();

        // Update the calendar context to show the session's month
        setCurrentDate(new Date(sessionYear, sessionMonth, 1));
        setSelectedDate(sessionDay);

        setSessionData({
          id: sessionDoc.id,
          ...data,
          scheduledDate: sessionDate,
        });

        console.log("Session data loaded successfully");
        console.log("Session ID:", sessionDoc.id);
        console.log("Session title:", data.title);
        console.log("Session date:", sessionDate);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching session data:", error);
        setError("Failed to load session data");
        setLoading(false);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    fetchSessionData();
  }, [
    sessionId,
    router,
    setCurrentDate,
    setSelectedDate,
    setSessionTitle,
    setDescriptions,
    setSessionType,
    setEndTime,
  ]);

  // Handler: Update the session document
  const handleEditSession = async (title, time) => {
    if (!selectedDate || !time) {
      setShowErrorModal(true);
      return;
    }

    if (!isDateTimeValid(selectedDate, time, currentYear, currentMonth)) {
      setShowErrorModal(true);
      return;
    }

    setIsUpdating(true);

    try {
      const user = firebase.auth().currentUser;
      if (!user || !sessionData) {
        throw new Error("User not authenticated or session not found");
      }

      // Get workout info
      const workoutInfo = getWorkoutInfo(
        selectedDate,
        currentYear,
        currentMonth,
      );
      if (!workoutInfo) {
        throw new Error("Invalid workout day");
      }

      // Get scheduled start date
      const startPart = time.split("-")[0].trim();
      const [timeStr, meridiem] = startPart.split(" ");
      let [hours, minutes] = timeStr.split(":").map((t) => parseInt(t, 10));

      if (meridiem?.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (meridiem?.toUpperCase() === "AM" && hours === 12) hours = 0;

      const scheduledStartDate = new Date(
        currentYear,
        currentMonth,
        selectedDate,
        hours,
        minutes,
        0,
        0,
      );

      // Update session document
      const updateData = {
        title: title || "Untitled Session",
        type: sessionType,
        workoutType: workoutInfo.type,
        scheduledDate:
          firebase.firestore.Timestamp.fromDate(scheduledStartDate),
        timeSlot: time,
        descriptions: descriptions || "",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      await firestore.collection("sessions").doc(sessionId).update(updateData);

      // Show success message
      setShowSuccessMessage(true);

      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Error updating session:", error);
      setShowErrorModal(true);
    } finally {
      setIsUpdating(false);
    }
  };

  // UI: Skeleton while loading
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Edit Session
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.skeletonContainer}>
          {/* Title Skeleton */}
          <View style={styles.skeletonTitle} />

          {/* Date and Time Section Skeleton */}
          <View style={styles.skeletonSection}>
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonLabel} />
              <View style={styles.skeletonValue} />
            </View>
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonLabel} />
              <View style={styles.skeletonValue} />
            </View>
            <View style={styles.skeletonRow}>
              <View style={styles.skeletonIcon} />
              <View style={styles.skeletonValue} />
            </View>
          </View>

          {/* Description Section Skeleton */}
          <View style={styles.skeletonSection}>
            <View style={styles.skeletonLabel} />
            <View style={styles.skeletonDescription} />
          </View>

          {/* Update Button Skeleton */}
          <View style={styles.skeletonButton} />
        </View>
      </View>
    );
  }

  // UI: Error state
  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Edit Session
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
          <Text
            style={[styles.loadingText, { color: theme.text, marginTop: 16 }]}
          >
            {error}
          </Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // UI: Main content
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Edit Session
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
              placeholder="Add title"
              placeholderTextColor="#999"
              value={sessionTitle}
              onChangeText={setSessionTitle}
            />
          </View>

          {/* Date and Time Section */}
          <View style={styles.dateTimeSection}>
            {/* Start Date and Time */}
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
              <Ionicons name="create-outline" size={20} color="#666" />
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
              <Ionicons name="create-outline" size={20} color="#666" />
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
                color="#666"
              />
              <Text style={styles.groupLabel}>
                {sessionType === "solo"
                  ? "Solo"
                  : sessionType === "group"
                    ? "Group"
                    : "Select Type"}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </Pressable>
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
              onFocus={() => setIsDescriptionFocused(true)}
              onBlur={() => setIsDescriptionFocused(false)}
            />
          </View>

          {/* Update Button (shared) */}
          <View style={styles.updateButtonContainer}>
            <Button
              title={isUpdating ? "Updating..." : "Update"}
              loading={isUpdating}
              disabled={isUpdating}
              onPress={() => handleEditSession(sessionTitle, endTime)}
            />
          </View>

          {/* Success Message */}
          {showSuccessMessage && (
            <View style={styles.successMessageContainer}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.successMessageText}>
                Session updated successfully!
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        selectedDate={selectedDate}
        selectedTime={endTime}
        isDateTimeValid={isDateTimeValid}
        isDateInPast={isDateInPast}
        isTimeSlotInPast={isTimeSlotInPast}
        currentYear={currentYear}
        currentMonth={currentMonth}
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
                <Ionicons name="close" size={24} color="#666" />
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
                <Ionicons name="person-outline" size={20} color="#4361EE" />
                <Text style={styles.groupOptionText}>Solo</Text>
                {sessionType === "solo" && (
                  <Ionicons name="checkmark-circle" size={20} color="#4361EE" />
                )}
              </Pressable>

              <Pressable
                style={styles.groupOption}
                onPress={() => {
                  setSessionType("group");
                  setShowGroupModal(false);
                }}
              >
                <Ionicons name="people-outline" size={20} color="#4361EE" />
                <Text style={styles.groupOptionText}>Group</Text>
                {sessionType === "group" && (
                  <Ionicons name="checkmark-circle" size={20} color="#4361EE" />
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
  skeletonContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  skeletonTitle: {
    width: "80%",
    height: 32,
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    marginBottom: 30,
  },
  skeletonSection: {
    marginBottom: 24,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  skeletonLabel: {
    width: 80,
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginRight: 12,
  },
  skeletonValue: {
    flex: 1,
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
  },
  skeletonIcon: {
    width: 20,
    height: 20,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    marginRight: 12,
  },
  skeletonDescription: {
    width: "100%",
    height: 100,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    marginTop: 8,
  },
  skeletonButton: {
    width: "100%",
    height: 56,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    marginTop: 20,
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
    color: "#666",
    marginBottom: 4,
  },
  dateTimeValue: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    color: "#1A1A1A",
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#F2F2F7",
    borderRadius: 8,
  },
  timeValue: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    color: "#007AFF",
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
  typeLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
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
  updateButton: {
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
  updateButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
  updateButtonContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
  },
  loadingButton: {
    opacity: 0.8,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  successMessageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F5E8",
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  successMessageText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "#2E7D32",
    marginLeft: 8,
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
  closeButton: {
    padding: 8,
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

  retryButton: {
    backgroundColor: "#4361EE",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
});
