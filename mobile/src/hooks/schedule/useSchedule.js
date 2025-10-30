import { useState, useEffect } from "react";
import { firebase, firestore } from "@/src/services/firebase";

// Workout schedule configuration
const WORKOUT_SCHEDULE = {
  0: { type: "Rest", icon: "bed", color: "#9CA3AF" }, // Sunday
  1: { type: "Chest", icon: "fitness", color: "#FF6B6B" }, // Monday
  2: { type: "Lower Body", icon: "body", color: "#4ECDC4" }, // Tuesday
  3: { type: "Back", icon: "fitness", color: "#45B7D1" }, // Wednesday
  4: { type: "Circuit", icon: "repeat", color: "#96CEB4" }, // Thursday
  5: { type: "Shoulder", icon: "fitness", color: "#FFEAA7" }, // Friday
  6: { type: "Lower Body", icon: "body", color: "#4ECDC4" }, // Saturday
};

const TIME_SLOTS = [
  "7:30 AM - 8:30 AM",
  "9:30 AM - 10:30 AM",
  "4:00 PM - 5:00 PM",
  "5:30 PM - 6:30 PM",
  "6:30 PM - 7:30 PM",
  "7:30 PM - 8:30 PM",
];

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

// Helper function to check if a date is in the past
const isDateInPast = (date, currentYear, currentMonth) => {
  if (!date) return false;

  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  // Create the actual date object for the selected date in the current calendar context
  const selectedDate = new Date(currentYear, currentMonth, date);

  return selectedDate < todayStart;
};

// Helper function to check if a time slot is in the past for today
const isTimeSlotInPast = (date, timeSlot, currentYear, currentMonth) => {
  if (!date || !timeSlot) return false;

  const today = new Date();

  // Check if the selected date is today by comparing the actual dates
  const selectedDate = new Date(currentYear, currentMonth, date);
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const isToday = selectedDate.getTime() === todayStart.getTime();

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
};

// Helper function to check if date and time combination is valid
const isDateTimeValid = (date, timeSlot, currentYear, currentMonth) => {
  if (!date || !timeSlot) return false;

  // Check if date is in the past
  if (isDateInPast(date, currentYear, currentMonth)) return false;

  // Check if time slot is in the past for today
  if (isTimeSlotInPast(date, timeSlot, currentYear, currentMonth)) return false;

  return true;
};

// Helper function to check if date is weekend
const isWeekend = (date, currentYear, currentMonth) => {
  if (!date) return false;
  const day = new Date(currentYear, currentMonth, date).getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
};

// Helper function to get workout info for a specific date
const getWorkoutInfo = (date, currentYear, currentMonth) => {
  if (!date) return null;
  const day = new Date(currentYear, currentMonth, date).getDay();
  return WORKOUT_SCHEDULE[day] || null;
};

// Helper function to get scheduled start date
const getScheduledStartDate = (date, timeSlot, currentYear, currentMonth) => {
  if (!date || !timeSlot) return null;

  try {
    const startPart = timeSlot.split("-")[0].trim();
    const [time, meridiem] = startPart.split(" ");
    let [hours, minutes] = time.split(":").map((t) => parseInt(t, 10));

    if (meridiem?.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (meridiem?.toUpperCase() === "AM" && hours === 12) hours = 0;

    // Create the date using the current year and month context
    const scheduledDate = new Date(
      currentYear,
      currentMonth,
      date,
      hours,
      minutes,
      0,
      0,
    );

    return scheduledDate;
  } catch (error) {
    console.error("Error creating scheduled date:", error);
    return null;
  }
};

export const useSchedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showIntermediateConfirmation, setShowIntermediateConfirmation] =
    useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [sessionType, setSessionType] = useState("group");
  const [descriptions, setDescriptions] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [endTime, setEndTime] = useState("");
  const [scheduledSessions, setScheduledSessions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);
  const [customErrorMessage, setCustomErrorMessage] = useState(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const calendarGrid = generateCalendarGrid(currentYear, currentMonth);

  // Fetch existing sessions from Firebase
  const fetchExistingSessions = async () => {
    try {
      setLoadingSessions(true);
      const user = firebase.auth().currentUser;
      if (!user) {
        setLoadingSessions(false);
        return;
      }

      const snapshot = await firestore
        .collection("sessions")
        .where("userId", "==", user.uid)
        .get();

      const sessionsData = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const sessionDate = data.scheduledDate?.toDate
            ? data.scheduledDate.toDate()
            : new Date(data.scheduledDate);

          return {
            id: doc.id,
            dateISO: sessionDate.toISOString(),
            dayName: dayNames[sessionDate.getDay()],
            dateDisplay: `${monthNames[sessionDate.getMonth()]} ${sessionDate.getDate()}, ${sessionDate.getFullYear()}`,
            time: data.timeSlot || "Time not specified",
            workoutType: data.workoutType || "Workout",
            scheduledDate: data.scheduledDate,
            status: data.status,
            type: data.type || "solo",
          };
        })
        .filter((session) => session.status === "scheduled")
        .sort((a, b) => {
          const dateA = a.scheduledDate?.toDate
            ? a.scheduledDate.toDate()
            : new Date(a.scheduledDate);
          const dateB = b.scheduledDate?.toDate
            ? b.scheduledDate.toDate()
            : new Date(a.scheduledDate);
          return dateA - dateB;
        });

      setScheduledSessions(sessionsData);
    } catch (error) {
      console.error("Error fetching existing sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  // Fetch blocked dates from Firebase
  const fetchBlockedDates = async () => {
    try {
      const snapshot = await firestore
        .collection("blockedDates")
        .where("blocked", "==", true)
        .get();

      const blockedDatesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      console.log("Fetched blocked dates:", blockedDatesData.length);
      setBlockedDates(blockedDatesData);
    } catch (error) {
      console.error("Error fetching blocked dates:", error);
      setBlockedDates([]);
    }
  };

  // Check if a date is blocked
  const isDateBlocked = (date, year, month) => {
    if (!date) return false;
    
    // Normalize the date to compare only the date part (year, month, day)
    const dateToCheck = new Date(year, month, date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    const isBlocked = blockedDates.some(bd => {
      const blockedDate = bd.date?.toDate ? bd.date.toDate() : new Date(bd.date);
      blockedDate.setHours(0, 0, 0, 0);
      
      // Compare the timestamps (which are now normalized to midnight)
      return blockedDate.getTime() === dateToCheck.getTime();
    });
    
    if (isBlocked) {
      console.log(`Date ${date}/${month}/${year} is BLOCKED`);
    }
    
    return isBlocked;
  };

  // Check if a session already exists for the same date and time
  const hasDuplicateSession = (date, timeSlot, year, month) => {
    if (!date || !timeSlot) return false;
    
    // Get the scheduled start date for comparison
    const scheduledStartDate = getScheduledStartDate(date, timeSlot, year, month);
    if (!scheduledStartDate) return false;
    
    // Check if there's already a session with the same scheduledDate and timeSlot
    const hasDuplicate = scheduledSessions.some(session => {
      const sessionDate = session.scheduledDate?.toDate 
        ? session.scheduledDate.toDate() 
        : new Date(session.scheduledDate);
      
      // Compare dates (ignoring time differences)
      const sessionDateOnly = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate());
      const startDateOnly = new Date(scheduledStartDate.getFullYear(), scheduledStartDate.getMonth(), scheduledStartDate.getDate());
      
      // Check if same date and same time slot
      return sessionDateOnly.getTime() === startDateOnly.getTime() && session.time === timeSlot;
    });
    
    if (hasDuplicate) {
      console.log(`Duplicate session found for ${date}/${month}/${year} at ${timeSlot}`);
    }
    
    return hasDuplicate;
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    try {
      setIsConfirming(true);
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Check if the selected date is blocked
      if (isDateBlocked(selectedDate, currentYear, currentMonth)) {
        setShowErrorModal(true);
        setShowIntermediateConfirmation(false);
        return;
      }

      // Check if there's already a session with the same date and time
      if (hasDuplicateSession(selectedDate, endTime, currentYear, currentMonth)) {
        setShowErrorModal(true);
        setShowIntermediateConfirmation(false);
        return;
      }

      // Validate date and time
      if (!isDateTimeValid(selectedDate, endTime, currentYear, currentMonth)) {
        setShowErrorModal(true);
        setShowIntermediateConfirmation(false);
        return;
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

      // Get active subscription
      const subscriptionSnapshot = await firestore
        .collection("subscriptions")
        .where("userId", "==", user.uid)
        .where("status", "==", "active")
        .limit(1)
        .get();

      if (subscriptionSnapshot.empty) {
        throw new Error("No active subscription found");
      }

      const subscription = subscriptionSnapshot.docs[0];

      // Get scheduled start date
      const scheduledStartDate = getScheduledStartDate(
        selectedDate,
        endTime,
        currentYear,
        currentMonth,
      );
      if (!scheduledStartDate) {
        throw new Error("Invalid date or time selection");
      }

      // Check capacity for this time slot (must match web limit)
      const MAX_PER_SLOT = 5;
      const start = new Date(currentYear, currentMonth, selectedDate, 0, 0, 0, 0);
      const end = new Date(currentYear, currentMonth, selectedDate, 23, 59, 59, 999);
      const startTs = firebase.firestore.Timestamp.fromDate(start);
      const endTs = firebase.firestore.Timestamp.fromDate(end);
      
      console.log("Capacity check - Looking for timeSlot:", endTime);
      console.log("Capacity check - Date range:", start.toDateString(), "to", end.toDateString());
      
      try {
        const capacitySnapshot = await firestore
          .collection("sessions")
          .where("status", "==", "scheduled")
          .where("timeSlot", "==", endTime)
          .where("scheduledDate", ">=", startTs)
          .where("scheduledDate", "<=", endTs)
          .get();
        
        console.log("Capacity check - Found sessions:", capacitySnapshot.size);
        capacitySnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log("  - Session timeSlot:", data.timeSlot, "| Date:", data.scheduledDate?.toDate?.()?.toDateString());
        });
        
        if (capacitySnapshot.size >= MAX_PER_SLOT) {
          throw new Error(`This time slot is full (${capacitySnapshot.size}/${MAX_PER_SLOT}). Please select a different time.`);
        }
      } catch (capacityError) {
        // Check if it's an index building error
        if (capacityError.code === 'failed-precondition' || capacityError.message?.includes('index')) {
          console.warn("Firebase index is still building, skipping capacity check temporarily");
          // Skip capacity check if index is building - allow booking to proceed
        } else if (capacityError.message?.includes('full')) {
          // Re-throw our custom "slot full" error
          throw capacityError;
        } else {
          // Log other errors but don't block booking
          console.error("Capacity check error:", capacityError);
        }
      }

      // Create session document
      const sessionData = {
        userId: user.uid,
        subscriptionId: subscription.id,
        title: sessionTitle || "Untitled Session", // Add title field
        type: sessionType,
        workoutType: workoutInfo.type,
        scheduledDate:
          firebase.firestore.Timestamp.fromDate(scheduledStartDate),
        timeSlot: endTime, // Use endTime instead of selectedTime
        descriptions: descriptions || "",
        status: "scheduled",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      console.log("Creating session with data:", sessionData);
      const docRef = await firestore.collection("sessions").add(sessionData);
      console.log("Session created with ID:", docRef.id);

      // Close intermediate confirmation and show success
      setShowIntermediateConfirmation(false);
      setShowConfirmationModal(true);

      // Refresh sessions list
      await fetchExistingSessions();

      // Don't reset form here - let the confirmation modal show the details
      // Form will be reset when user closes the confirmation modal
    } catch (error) {
      // Only log non-user-facing errors (not capacity/validation errors)
      if (!error.message?.includes('full') && !error.message?.includes('selection')) {
      console.error("Error confirming booking:", error);
      }
      setCustomErrorMessage(error.message);
      setShowErrorModal(true);
      setShowIntermediateConfirmation(false);
    } finally {
      setIsConfirming(false);
    }
  };

  // Event handlers
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExistingSessions();
    await fetchBlockedDates();
    setRefreshing(false);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDateSelect = (date) => {
    if (isDateInPast(date, currentYear, currentMonth)) {
      return; // Don't allow selection of past dates
    }
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleDateSelectWithContext = (date, month, year) => {
    // Create a date object for the selected date
    const selectedDateObj = new Date(year, month, date);
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    // Check if the selected date is in the past
    if (selectedDateObj < todayStart) {
      return; // Don't allow selection of past dates
    }

    // Check if the selected date is blocked
    if (isDateBlocked(date, year, month)) {
      return; // Don't allow selection of blocked dates
    }

    // Update the current context to match the selected date's month/year
    setCurrentDate(new Date(year, month, 1));
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time) => {
    if (isTimeSlotInPast(selectedDate, time, currentYear, currentMonth)) {
      return; // Don't allow selection of past time slots
    }
    setSelectedTime(time);
    // Don't close the modal here - let user confirm their selection
  };

  const handleContinue = (title, endTime) => {
    if (!selectedDate || !endTime) {
      setShowErrorModal(true);
      return;
    }

    // Check if the selected date is blocked
    if (isDateBlocked(selectedDate, currentYear, currentMonth)) {
      setShowErrorModal(true);
      return;
    }

    // Check if there's already a session with the same date and time
    if (hasDuplicateSession(selectedDate, endTime, currentYear, currentMonth)) {
      setShowErrorModal(true);
      return;
    }

    if (!isDateTimeValid(selectedDate, endTime, currentYear, currentMonth)) {
      setShowErrorModal(true);
      return;
    }

    // Store the title and endTime for use in confirmation
    setSessionTitle(title);
    setEndTime(endTime);
    setShowIntermediateConfirmation(true);
  };

  // Fetch sessions and blocked dates on mount
  useEffect(() => {
    fetchExistingSessions();
    fetchBlockedDates();
  }, []);

  return {
    // State
    currentDate,
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
    scheduledSessions,
    refreshing,
    loadingSessions,
    customErrorMessage,

    // Constants
    WORKOUT_SCHEDULE,
    TIME_SLOTS,
    monthNames,
    dayNames,

    // Functions
    isWeekend: (date) => isWeekend(date, currentYear, currentMonth),
    getWorkoutInfo: (date) => getWorkoutInfo(date, currentYear, currentMonth),
    getScheduledStartDate: (date, timeSlot) =>
      getScheduledStartDate(date, timeSlot, currentYear, currentMonth),
    isDateInPast,
    isTimeSlotInPast,
    isDateTimeValid,
    isDateBlocked,
    hasDuplicateSession,
    handlePrevMonth,
    handleNextMonth,
    handleDateSelect,
    handleDateSelectWithContext,
    handleTimeSelect,
    handleContinue,
    handleConfirmBooking,
    onRefresh,

    // Setters
    setShowTimePicker,
    setShowConfirmationModal: (show) => {
      setShowConfirmationModal(show);
      if (!show) {
        // Reset form when confirmation modal is closed
        setSelectedDate(null);
        setSelectedTime(null);
        setSessionTitle("");
        setEndTime("");
        // Optionally reset type to default
        setSessionType("group");
        setDescriptions("");
      }
    },
    setShowErrorModal: (show) => {
      setShowErrorModal(show);
      if (!show) {
        // Clear custom error message when closing error modal
        setCustomErrorMessage(null);
      }
    },
    setShowIntermediateConfirmation,
    // Session type state
    sessionType,
    setSessionType,
    // Descriptions state
    descriptions,
    setDescriptions,
    // Session title and end time state
    sessionTitle,
    setSessionTitle,
    endTime,
    setEndTime,

    // Calendar state setters for edit functionality
    setCurrentDate,
    setSelectedDate,
  };
};
