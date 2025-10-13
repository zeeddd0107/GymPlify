import React, { useEffect, useMemo, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import {
  AddButton,
  EditModal,
  EditDeleteButtons,
  ToastNotification,
} from "@/components";
import { db } from "@/config/firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  addDoc,
} from "firebase/firestore";

// Workout schedule configuration (same as mobile)
const WORKOUT_SCHEDULE = {
  0: { type: "Rest", icon: "bed", color: "#9CA3AF" }, // Sunday
  1: { type: "Chest", icon: "fitness", color: "#FF6B6B" }, // Monday
  2: { type: "Lower Body", icon: "body", color: "#4ECDC4" }, // Tuesday
  3: { type: "Back", icon: "fitness", color: "#45B7D1" }, // Wednesday
  4: { type: "Circuit", icon: "repeat", color: "#96CEB4" }, // Thursday
  5: { type: "Shoulder", icon: "fitness", color: "#FFEAA7" }, // Friday
  6: { type: "Lower Body", icon: "body", color: "#4ECDC4" }, // Saturday
};

// Helper function to get workout info for a specific date
const getWorkoutInfo = (date) => {
  if (!date) return null;
  const day = date.getDay();
  return WORKOUT_SCHEDULE[day] || null;
};

const Sessions = () => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [sessions, setSessions] = useState([]);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userData, setUserData] = useState(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCreateSuccessModal, setShowCreateSuccessModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [_selectedDate, setSelectedDate] = useState(null);
  const [createSessionData, setCreateSessionData] = useState({
    name: "",
    date: "",
    time: "",
    title: "",
    type: "",
    descriptions: "",
  });
  const [subscriptions, setSubscriptions] = useState([]);
  const [nameSearch, setNameSearch] = useState("");
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDateInfo, setSelectedDateInfo] = useState(null);
  const [calendarView, setCalendarView] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });
  const [validationWarnings, setValidationWarnings] = useState({
    name: false,
    date: false,
    time: false,
  });
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [upcomingDaysFilter, setUpcomingDaysFilter] = useState(7);

  // Prevent background scrolling when modals are open
  useEffect(() => {
    if (showModal || showDeleteConfirm || showCreateModal) {
      // Store the current scrollbar width to prevent layout shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.paddingRight = "0px";
    };
  }, [showModal, showDeleteConfirm, showCreateModal]);

  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Filter subscriptions based on search term
  const filteredSubscriptions = useMemo(() => {
    if (!nameSearch.trim()) return [];

    return subscriptions.filter(
      (subscription) =>
        subscription.displayName
          ?.toLowerCase()
          .includes(nameSearch.toLowerCase()) ||
        subscription.customMemberId
          ?.toLowerCase()
          .includes(nameSearch.toLowerCase()),
    );
  }, [subscriptions, nameSearch]);

  const monthDays = useMemo(() => {
    const firstDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const _lastDay = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    );

    const leadingBlanks = firstDay.getDay();
    const totalDays = _lastDay.getDate();

    const cells = [];

    // Add previous month days
    const prevMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      0,
    );
    const prevMonthDays = prevMonth.getDate();
    for (let i = leadingBlanks - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        isCurrentMonth: false,
        isPrevMonth: true,
        isNextMonth: false,
      });
    }

    // Add current month days
    for (let d = 1; d <= totalDays; d++) {
      cells.push({
        day: d,
        isCurrentMonth: true,
        isPrevMonth: false,
        isNextMonth: false,
      });
    }

    // Add next month days only to complete the current week
    const lastDayOfMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      totalDays,
    );
    const lastDayOfWeek = lastDayOfMonth.getDay(); // 0 = Sunday, 6 = Saturday

    // Only add next month days if the month doesn't end on Saturday (day 6)
    if (lastDayOfWeek !== 6) {
      const daysToAdd = 6 - lastDayOfWeek; // Days needed to reach Saturday
      for (let d = 1; d <= daysToAdd; d++) {
        cells.push({
          day: d,
          isCurrentMonth: false,
          isPrevMonth: false,
          isNextMonth: true,
        });
      }
    }

    return cells;
  }, [currentMonth]);

  const navigateMonth = (delta) => {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + delta);
    setCurrentMonth(next);
  };

  const toJsDate = (value) => {
    if (!value) return null;
    if (typeof value?.toDate === "function") return value.toDate();
    if (typeof value === "object" && typeof value.seconds === "number") {
      return new Date(value.seconds * 1000);
    }
    if (typeof value === "number") {
      const ms = value < 1e12 ? value * 1000 : value;
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    }
    if (typeof value === "string") {
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };

  const formatTime = (date) => {
    if (!date) return "-";
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  // Handle session deletion
  const handleCellClick = (dayObj) => {
    // Create a date object for the clicked day
    let clickedDate;
    if (dayObj.isCurrentMonth) {
      clickedDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        dayObj.day,
      );
    } else if (dayObj.isPrevMonth) {
      const prevMonth =
        currentMonth.getMonth() === 0 ? 11 : currentMonth.getMonth() - 1;
      const prevYear =
        currentMonth.getMonth() === 0
          ? currentMonth.getFullYear() - 1
          : currentMonth.getFullYear();
      clickedDate = new Date(prevYear, prevMonth, dayObj.day);
    } else if (dayObj.isNextMonth) {
      const nextMonth =
        currentMonth.getMonth() === 11 ? 0 : currentMonth.getMonth() + 1;
      const nextYear =
        currentMonth.getMonth() === 11
          ? currentMonth.getFullYear() + 1
          : currentMonth.getFullYear();
      clickedDate = new Date(nextYear, nextMonth, dayObj.day);
    }

    // Format date in local timezone to avoid UTC conversion issues
    const yearStr = clickedDate.getFullYear();
    const monthStr = String(clickedDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(clickedDate.getDate()).padStart(2, "0");
    const formattedDate = `${yearStr}-${monthStr}-${dayStr}`;

    setSelectedDate(clickedDate);
    setCreateSessionData({
      name: "",
      date: formattedDate,
      time: "",
      title: "",
      type: "",
      descriptions: "",
    });
    setNameSearch("");
    setShowNameDropdown(false);
    setShowCreateModal(true);
  };

  const handleOpenCreateModal = () => {
    // Clear previous date selection and form data
    setSelectedDate(null);
    setSelectedDateInfo(null);
    setCreateSessionData({
      name: "",
      date: "",
      time: "",
      title: "",
      type: "",
      descriptions: "",
    });
    setNameSearch("");
    setShowNameDropdown(false);
    setHasAttemptedSubmit(false);
    setValidationWarnings({
      name: false,
      date: false,
      time: false,
    });
    setShowCreateModal(true);
  };

  const handleDateSelect = (day, month, year) => {
    const selectedDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      alert("Cannot select past dates");
      return;
    }

    // Format date in local timezone to avoid UTC conversion issues
    const yearStr = selectedDate.getFullYear();
    const monthStr = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(selectedDate.getDate()).padStart(2, "0");
    const formattedDate = `${yearStr}-${monthStr}-${dayStr}`;

    setSelectedDateInfo({ day, month, year });
    setCreateSessionData({
      ...createSessionData,
      date: formattedDate,
    });
    // Don't close calendar when date is selected
  };

  const handleOutsideClick = (e) => {
    if (
      e.target.closest(".calendar-picker") ||
      e.target.closest(".date-input") ||
      e.target.closest(".name-search-container")
    ) {
      return;
    }
    setShowDatePicker(false);
    setShowNameDropdown(false);
  };

  const handleNameSelect = (subscription) => {
    setCreateSessionData({
      ...createSessionData,
      name: subscription.displayName || subscription.name || subscription.id,
    });
    setNameSearch(
      subscription.displayName || subscription.name || subscription.id,
    );
    setShowNameDropdown(false);
  };

  // Add event listener for outside clicks
  useEffect(() => {
    if (showDatePicker || showNameDropdown) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => {
        document.removeEventListener("mousedown", handleOutsideClick);
      };
    }
  }, [showDatePicker, showNameDropdown]);

  const navigateCalendarMonth = (direction) => {
    setCalendarView((prev) => {
      let newMonth = prev.month + direction;
      let newYear = prev.year;

      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      } else if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      }

      return { year: newYear, month: newMonth };
    });
  };

  const generateCalendarDays = () => {
    const firstDay = new Date(calendarView.year, calendarView.month, 1);
    const _lastDay = new Date(calendarView.year, calendarView.month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate the end of the current month's week
    const lastDayOfMonth = new Date(
      calendarView.year,
      calendarView.month + 1,
      0,
    );
    const lastDayWeekEnd = new Date(lastDayOfMonth);
    lastDayWeekEnd.setDate(
      lastDayOfMonth.getDate() + (6 - lastDayOfMonth.getDay()),
    );

    for (let i = 0; i < 42; i++) {
      // 6 weeks * 7 days
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const isCurrentMonth = currentDate.getMonth() === calendarView.month;
      const isNextMonth = currentDate.getMonth() === calendarView.month + 1;
      const isPast = currentDate < today;
      const isSelected =
        selectedDateInfo &&
        selectedDateInfo.day === currentDate.getDate() &&
        selectedDateInfo.month === currentDate.getMonth() &&
        selectedDateInfo.year === currentDate.getFullYear();

      // Only include next month days if they're in the same week as the last day of current month
      const shouldIncludeNextMonth =
        isNextMonth && currentDate <= lastDayWeekEnd;

      if (isCurrentMonth || !isNextMonth || shouldIncludeNextMonth) {
        days.push({
          date: currentDate.getDate(),
          isCurrentMonth,
          isPast,
          isSelected,
          fullDate: new Date(currentDate),
        });
      }
    }

    return days;
  };

  const handleCreateSession = async () => {
    // Set attempted submit flag
    setHasAttemptedSubmit(true);

    // Check required fields
    let hasErrors = false;
    if (!createSessionData.name) {
      setValidationWarnings((prev) => ({ ...prev, name: true }));
      hasErrors = true;
    }
    if (!createSessionData.date) {
      setValidationWarnings((prev) => ({ ...prev, date: true }));
      hasErrors = true;
    }
    if (!createSessionData.time) {
      setValidationWarnings((prev) => ({ ...prev, time: true }));
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    setIsCreatingSession(true);
    try {
      // Find the selected subscription to get subscriptionId and userId
      const selectedSubscription = subscriptions.find(
        (sub) =>
          sub.displayName === createSessionData.name ||
          sub.name === createSessionData.name,
      );

      if (!selectedSubscription) {
        alert("Selected user not found. Please try again.");
        return;
      }

      // Parse the time slot to get start time
      const timeSlot = createSessionData.time;
      let startTime = "";

      if (timeSlot.includes("7:30 AM - 8:30 AM")) {
        startTime = "07:30";
      } else if (timeSlot.includes("9:30 AM - 10:30 AM")) {
        startTime = "09:30";
      } else if (timeSlot.includes("4:00 PM - 5:00 PM")) {
        startTime = "16:00";
      } else if (timeSlot.includes("5:30 PM - 6:30 PM")) {
        startTime = "17:30";
      } else if (timeSlot.includes("6:30 PM - 7:30 PM")) {
        startTime = "18:30";
      } else if (timeSlot.includes("7:30 PM - 8:30 PM")) {
        startTime = "19:30";
      }

      // Combine date and time - ensure local timezone
      const [year, month, day] = createSessionData.date.split("-").map(Number);
      const [hours, minutes] = startTime.split(":").map(Number);
      const scheduledDate = new Date(year, month - 1, day, hours, minutes, 0);

      // Get workout info for the selected date
      const workoutInfo = getWorkoutInfo(scheduledDate);

      // Create session object with all required fields
      const sessionData = {
        createdAt: new Date(),
        descriptions: createSessionData.descriptions || "",
        scheduledDate: scheduledDate,
        status: "scheduled",
        subscriptionId: selectedSubscription.id,
        timeSlot: createSessionData.time,
        title: createSessionData.title || "Untitled Session",
        type: createSessionData.type || "solo",
        updatedAt: new Date(),
        userId: selectedSubscription.userId,
        workoutType: workoutInfo ? workoutInfo.type : "Workout", // Get workout type based on day
        role: "admin",
      };

      // Add to Firestore
      await addDoc(collection(db, "sessions"), sessionData);

      console.log("Session created:", sessionData);

      // Reset form and close modal
      setCreateSessionData({
        name: "",
        date: "",
        time: "",
        title: "",
        type: "",
        descriptions: "",
      });
      setNameSearch("");
      setShowNameDropdown(false);
      setShowCreateModal(false);
      setSelectedDate(null);
      setHasAttemptedSubmit(false);
      setValidationWarnings({
        name: false,
        date: false,
        time: false,
      });

      // Show success message
      setShowCreateSuccessModal(true);
      setTimeout(() => {
        setShowCreateSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error("Error creating session:", error);
      alert("Failed to create session. Please try again.");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!selectedSession?.id) {
      console.error("No session selected for deletion");
      return;
    }

    setIsDeleting(true);
    try {
      // Delete the session from Firebase
      await deleteDoc(doc(db, "sessions", selectedSession.id));

      console.log("Session deleted successfully:", selectedSession.id);
      if (deleteReason.trim()) {
        console.log("Deletion reason:", deleteReason);
        // Here you could also save the deletion reason to a separate collection if needed
      }

      // Close modals and reset state
      setShowDeleteConfirm(false);
      setShowModal(false);
      setDeleteReason("");
      setSelectedSession(null);
      setUserData(null);

      // Show success confirmation
      setShowSuccessModal(true);

      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 3000);
    } catch (error) {
      console.error("Error deleting session:", error);
      alert("Failed to delete session. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Fetch user data for a session
  const fetchUserData = async (userId) => {
    if (!userId) return null;
    try {
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  };

  // Group sessions by day for the current visible month and adjacent months
  const sessionsByDay = useMemo(() => {
    const map = {};
    sessions.forEach((s) => {
      const d = toJsDate(s.scheduledDate);
      if (!d) return;

      // Check if session is in current month or adjacent months that are visible in the calendar
      const sessionYear = d.getFullYear();
      const sessionMonth = d.getMonth();
      const currentYear = currentMonth.getFullYear();
      const currentMonthNum = currentMonth.getMonth();

      // Check if session is in current month, previous month, or next month
      const isCurrentMonth =
        sessionYear === currentYear && sessionMonth === currentMonthNum;
      const isPrevMonth =
        (sessionYear === currentYear && sessionMonth === currentMonthNum - 1) ||
        (sessionYear === currentYear - 1 &&
          currentMonthNum === 0 &&
          sessionMonth === 11);
      const isNextMonth =
        (sessionYear === currentYear && sessionMonth === currentMonthNum + 1) ||
        (sessionYear === currentYear + 1 &&
          currentMonthNum === 11 &&
          sessionMonth === 0);

      if (isCurrentMonth || isPrevMonth || isNextMonth) {
        const day = d.getDate();
        const key = `${sessionMonth}-${day}`; // Use month-day as key to distinguish between months
        if (!map[key]) map[key] = [];
        map[key].push({
          id: s.id,
          timeLabel: formatTime(d),
          title: s.title || s.name || s.type || "Session",
          isCurrentMonth: isCurrentMonth,
          isPrevMonth: isPrevMonth,
          isNextMonth: isNextMonth,
        });
      }
    });
    // Optional: sort each day's items by time
    Object.keys(map).forEach((k) => {
      map[k].sort((a, b) => (a.timeLabel > b.timeLabel ? 1 : -1));
    });
    return map;
  }, [sessions, currentMonth]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const colRef = collection(db, "sessions");
    const unsub = onSnapshot(
      colRef,
      (snap) => {
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        console.log("Fetched sessions data:", data); // Debug: See all sessions data
        if (data.length > 0) {
          console.log("First session fields:", Object.keys(data[0])); // Debug: See fields in first session
          console.log("First session description:", data[0].description); // Debug: Check description field
        }
        setSessions(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setSessions([]);
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  // Fetch subscriptions data for the Name dropdown
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subscriptionsRef = collection(db, "subscriptions");
        const snap = await getDocs(subscriptionsRef);
        const subscriptionsData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Enrich/Correct displayName: avoid showing emails; use user's profile name instead
        const subscriptionsWithUserData = await Promise.all(
          subscriptionsData.map(async (sub) => {
            const needsUserFetch =
              !sub.customMemberId ||
              !sub.displayName ||
              (sub.displayName && sub.displayName.includes("@"));

            if (!needsUserFetch) {
              return sub;
            }

            try {
              const userDoc = await getDoc(doc(db, "users", sub.userId));
              const userData = userDoc.data();

              const cleanDisplayName =
                userData?.displayName ||
                userData?.name ||
                sub.displayName ||
                "Unknown User";

              return {
                ...sub,
                displayName: cleanDisplayName.includes("@")
                  ? userData?.displayName || userData?.name || "Unknown User"
                  : cleanDisplayName,
                customMemberId:
                  sub.customMemberId || userData?.customMemberId || null,
              };
            } catch (error) {
              console.error("Error fetching user data:", error);
              return {
                ...sub,
                displayName:
                  sub.displayName && sub.displayName.includes("@")
                    ? "Unknown User"
                    : sub.displayName || "Unknown User",
                customMemberId: sub.customMemberId || null,
              };
            }
          }),
        );

        console.log(
          "Fetched subscriptions with user data:",
          subscriptionsWithUserData,
        );
        setSubscriptions(subscriptionsWithUserData);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        setSubscriptions([]);
      }
    };

    fetchSubscriptions();
  }, []);

  // Get upcoming sessions based on selected filter
  const upcomingSessions = useMemo(() => {
    const today = new Date();
    const futureDate = new Date(
      today.getTime() + upcomingDaysFilter * 24 * 60 * 60 * 1000,
    );

    return sessions
      .filter((session) => {
        const sessionDate = toJsDate(session.scheduledDate);
        if (!sessionDate) return false;

        const sessionTime = new Date(sessionDate);
        sessionTime.setHours(0, 0, 0, 0);
        const todayTime = new Date(today);
        todayTime.setHours(0, 0, 0, 0);
        const futureTime = new Date(futureDate);
        futureTime.setHours(23, 59, 59, 999);

        return sessionTime >= todayTime && sessionTime <= futureTime;
      })
      .sort((a, b) => {
        const dateA = toJsDate(a.scheduledDate);
        const dateB = toJsDate(b.scheduledDate);
        return dateA - dateB;
      })
      .slice(0, 10); // Show more sessions for longer periods
  }, [sessions, upcomingDaysFilter]);

  return (
    <div className="py-5 space-y-6">
      {/* Header Section with Add Session Button */}
      <div className="flex items-center justify-end">
        <AddButton
          onClick={handleOpenCreateModal}
          text="Add Session"
          className=""
        />
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-xl shadow-lg pt-5 px-0.4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigateMonth(-1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-black/5 rounded-full transition-colors"
          >
            <FaChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-semibold">
            {currentMonth.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
          <button
            type="button"
            onClick={() => navigateMonth(1)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-black/5 rounded-full transition-colors"
          >
            <FaChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0.3">
          {daysOfWeek.map((d) => (
            <div
              key={d}
              className="text-center text-sm font-medium text-gray-500 py-2 border border-lightGray/70"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.3">
          {monthDays.map((dayObj, idx) => (
            <div
              key={idx}
              className={`h-36 border border-lightGray/70 cursor-pointer transition-colors relative group ${
                dayObj.isCurrentMonth
                  ? "bg-#FAF9F6 hover:bg-lightGray/80" // Background for current month
                  : dayObj.isNextMonth
                    ? "bg-lightGray/30 hover:bg-lightGray/80" // Background for next month
                    : "bg-lightGray/30 hover:bg-lightGray/80" // Background for previous month
              }`}
              onClick={() => handleCellClick(dayObj)}
            >
              {/* Plus icon on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                  +
                </div>
              </div>

              <div
                className={`text-sm pt-3 pl-3 font-medium ${
                  dayObj.isCurrentMonth ? "text-gray-900" : "text-gray/70"
                }`}
              >
                {dayObj.day}
              </div>
              {dayObj.day &&
                (() => {
                  // Create the key for this day based on which month it belongs to
                  let monthKey;
                  if (dayObj.isCurrentMonth) {
                    monthKey = `${currentMonth.getMonth()}-${dayObj.day}`;
                  } else if (dayObj.isPrevMonth) {
                    const prevMonth =
                      currentMonth.getMonth() === 0
                        ? 11
                        : currentMonth.getMonth() - 1;
                    monthKey = `${prevMonth}-${dayObj.day}`;
                  } else if (dayObj.isNextMonth) {
                    const nextMonth =
                      currentMonth.getMonth() === 11
                        ? 0
                        : currentMonth.getMonth() + 1;
                    monthKey = `${nextMonth}-${dayObj.day}`;
                  }

                  return (
                    sessionsByDay[monthKey] && (
                      <div className="mt-1 space-y-1">
                        {sessionsByDay[monthKey].map((it) => (
                          <button
                            key={it.id}
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation(); // Prevent cell click event
                              const s =
                                sessions.find((x) => x.id === it.id) || null;
                              setSelectedSession(s);
                              setShowModal(true);

                              // Fetch user data if session has a userId
                              if (s && s.userId) {
                                const user = await fetchUserData(s.userId);
                                console.log("Fetched user data:", user); // Debug log
                                setUserData(user);
                              } else {
                                setUserData(null);
                              }

                              // Debug: Log session data to see available fields
                              console.log("Selected session data:", s);
                              console.log(
                                "All session fields:",
                                Object.keys(s),
                              );
                              console.log(
                                "Session description field:",
                                s.description,
                              );
                              console.log("Session desc field:", s.desc);
                              console.log("Session notes field:", s.notes);
                              console.log("Session details field:", s.details);
                            }}
                            className="w-11/12 mx-2 flex items-center justify-between text-[11px] px-2 py-1 rounded-md border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
                          >
                            <span className="truncate mr-2 font-medium">
                              {it.title}
                            </span>
                            <span className="whitespace-nowrap">
                              {it.timeLabel}
                            </span>
                          </button>
                        ))}
                      </div>
                    )
                  );
                })()}
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Sessions Section - Compact Design */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Upcoming Sessions
                </h3>
                <p className="text-xs text-gray-600">
                  {upcomingSessions.length} session
                  {upcomingSessions.length !== 1 ? "s" : ""} scheduled
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <select
                value={upcomingDaysFilter}
                onChange={(e) => setUpcomingDaysFilter(Number(e.target.value))}
                className="text-xs text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-blue-300 focus:border-blue-500 transition-all"
              >
                <option value={3}>Next 3 days</option>
                <option value={7}>Next 7 days</option>
                <option value={14}>Next 14 days</option>
                <option value={30}>Next 30 days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {upcomingSessions.length > 0 ? (
            <div className="space-y-3">
              {upcomingSessions.map((session) => {
                const sessionDate = toJsDate(session.scheduledDate);
                const isToday =
                  sessionDate &&
                  sessionDate.toDateString() === new Date().toDateString();
                const isTomorrow =
                  sessionDate &&
                  sessionDate.toDateString() ===
                    new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();

                return (
                  <div
                    key={session.id}
                    className="group relative bg-gradient-to-r from-white to-gray-50 border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={async () => {
                      setSelectedSession(session);
                      setShowModal(true);

                      if (session.userId) {
                        const user = await fetchUserData(session.userId);
                        setUserData(user);
                      } else {
                        setUserData(null);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      {/* Compact Date Badge */}
                      <div className="flex-shrink-0 relative">
                        <div
                          className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white font-bold shadow-md ${
                            isToday
                              ? "bg-gradient-to-br from-emerald-500 to-green-600"
                              : isTomorrow
                                ? "bg-gradient-to-br from-orange-500 to-amber-600"
                                : "bg-gradient-to-br from-purple-500 to-blue-600"
                          }`}
                        >
                          <span className="text-sm leading-none">
                            {sessionDate?.getDate()}
                          </span>
                          <span className="text-xs leading-none mt-0.5">
                            {sessionDate?.toLocaleDateString("en-US", {
                              month: "short",
                            })}
                          </span>
                        </div>
                        {(isToday || isTomorrow) && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>

                      {/* Session Information */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-gray-900 truncate">
                            {session.title || "Workout Session"}
                          </h4>
                          {(isToday || isTomorrow) && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                isToday
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {isToday ? "Today" : "Tomorrow"}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                            <svg
                              className="w-3 h-3 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="font-medium">
                              {session.timeSlot ||
                                `${sessionDate?.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })} - ${
                                  sessionDate
                                    ? new Date(
                                        sessionDate.getTime() + 60 * 60000,
                                      ).toLocaleTimeString("en-US", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                      })
                                    : ""
                                }`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                            <svg
                              className="w-3 h-3 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                              />
                            </svg>
                            <span className="font-medium">
                              {session.type || "Solo"}
                            </span>
                          </div>
                        </div>

                        {session.descriptions && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {session.descriptions}
                          </p>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  className="w-6 h-6 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">
                No upcoming sessions
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                You don't have any sessions scheduled for the next{" "}
                {upcomingDaysFilter} days.
              </p>
              <button
                onClick={() => {
                  // Open create session modal with today's date
                  const today = new Date();
                  const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                  setCreateSessionData({
                    name: "",
                    date: formattedDate,
                    time: "",
                    title: "",
                    type: "",
                    descriptions: "",
                  });
                  handleOpenCreateModal();
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-md font-semibold text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Schedule Session
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Session details */}
      {showModal && !showDeleteConfirm && (
        <div
          className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 0,
            padding: 0,
            width: "100vw",
            height: "100vh",
            position: "fixed",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-md mx-4 flex flex-col max-h-[90vh] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with title and close button */}
            <div className="flex justify-between items-center px-6 py-4 sm:p-6 md:px-7 md:py-4 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-gray/20 flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 pr-2">
                Session Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 sm:p-2.5 text-gray-900 hover:text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 ease-in-out group flex-shrink-0"
              >
                <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 sm:px-6 md:px-7 flex-1 overflow-y-auto">
              <div className="space-y-3 sm:space-y-4 md:space-y-5">
                {(() => {
                  if (!selectedSession) return null;

                  const date = toJsDate(selectedSession.scheduledDate);
                  const formattedDate = date
                    ? date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "-";

                  // Format timeslot (start time - end time)
                  let formattedTimeslot = "-";
                  if (date) {
                    const startTime = date.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    });

                    // Check if session has an end time, otherwise calculate default 1-hour duration
                    let endTime;
                    if (selectedSession.endTime) {
                      const endDate = toJsDate(selectedSession.endTime);
                      endTime = endDate
                        ? endDate.toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : null;
                    } else if (selectedSession.duration) {
                      // If duration is in minutes, calculate end time
                      const endDate = new Date(
                        date.getTime() + selectedSession.duration * 60000,
                      );
                      endTime = endDate.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      });
                    } else {
                      // Default to 1 hour duration
                      const endDate = new Date(date.getTime() + 60 * 60000);
                      endTime = endDate.toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      });
                    }

                    formattedTimeslot = endTime
                      ? `${startTime} - ${endTime}`
                      : startTime;
                  }

                  return (
                    <>
                      {/* Name */}
                      <div className="flex items-center gap-14 pt-4">
                        <span className="text-sm text-gray-600 w-20 flex-shrink-0">
                          Name
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {userData?.fullName ||
                            userData?.displayName ||
                            userData?.name ||
                            (userData?.firstName && userData?.lastName
                              ? `${userData.firstName} ${userData.lastName}`
                              : null) ||
                            selectedSession.name ||
                            "-"}
                        </span>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-14">
                        <span className="text-sm text-gray-600 w-20 flex-shrink-0">
                          Email
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {userData?.email || selectedSession.email || "-"}
                        </span>
                      </div>

                      {/* When - Date and Time */}
                      <div className="flex items-start gap-14">
                        <span className="text-sm text-gray-600 w-20 flex-shrink-0">
                          When
                        </span>
                        <div className="text-sm font-medium text-gray-900">
                          <div>{formattedDate}</div>
                          <div>{formattedTimeslot}</div>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="flex items-center gap-14">
                        <span className="text-sm text-gray-600 w-20 flex-shrink-0">
                          Title
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedSession.title || "-"}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="flex items-start gap-2 pb-5 border-b border-gray/20 -mx-6">
                        <span className="mx-6 text-sm text-gray-600 w-20 flex-shrink-0">
                          Description
                        </span>
                        <span className="mx-6 text-sm font-medium text-gray-900 text-start">
                          {selectedSession.descriptions || "-"}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="pb-5">
                        <EditDeleteButtons
                          onEdit={() => {
                            // Handle reschedule action
                            console.log("Reschedule session");
                          }}
                          onDelete={() => setShowDeleteConfirm(true)}
                          editText="Reschedule"
                          deleteText="Delete Session"
                          className="justify-start"
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Session Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 0,
            padding: 0,
            width: "100vw",
            height: "100vh",
            position: "fixed",
          }}
        >
          <div
            className="absolute inset-0 bg-black/40"
            style={{
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              margin: 0,
              padding: 0,
              width: "100vw",
              height: "100vh",
              position: "absolute",
            }}
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeleteReason("");
            }}
          />
          <div
            className="bg-white rounded-lg w-full max-w-md mx-4 flex flex-col max-h-[90vh] shadow-2xl relative z-10"
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: "white" }}
          >
            {/* Modal Header with title and close button */}
            <div className="flex justify-between items-center px-6 py-4 sm:p-6 md:px-7 md:py-4 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-gray/20 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 pr-2">
                  Delete Session
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteReason("");
                }}
                className="p-2 sm:p-2.5 text-gray-900 hover:text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 ease-in-out group flex-shrink-0"
              >
                <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 sm:px-6 md:px-7 flex-1 overflow-y-auto">
              <div className="space-y-3 sm:space-y-4 md:space-y-5">
                <p className="text-gray-600 pt-4">
                  Are you sure you want to delete this session? This action
                  cannot be undone.
                </p>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="px-4 mb-1 sm:mb-0 sm:px-6 md:px-7 pt-4 sm:pt-5 pb-4 sm:pb-6 flex-shrink-0">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteReason("");
                  }}
                  className="px-6 py-3.5 !text-sm font-medium rounded-lg border border-gray-300 bg-white text-primary hover:bg-gray-50 hover:border-primary focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSession}
                  disabled={isDeleting}
                  className="px-6 py-3 !text-sm font-medium rounded-lg border border-transparent bg-red-600 text-white hover:bg-red-700 focus:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-600"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      <ToastNotification
        isVisible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Session successfully deleted"
        type="success"
        duration={3000}
        position="top-right"
        className="!top-0"
      />

      {/* Session Created Success Toast Notification */}
      <ToastNotification
        isVisible={showCreateSuccessModal}
        onClose={() => setShowCreateSuccessModal(false)}
        message="Session successfully created"
        type="success"
        duration={3000}
        position="top-right"
        className="!top-0"
      />

      {/* Create Session Modal */}
      <EditModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setHasAttemptedSubmit(false);
          setValidationWarnings({
            name: false,
            date: false,
            time: false,
          });
        }}
        title="Create Session"
        onSave={handleCreateSession}
        saveText="Create Session"
        savingText="Creating..."
        saving={isCreatingSession}
        maxWidth="max-w-md"
        zIndex="z-[9999]"
      >
        {/* Form */}
        <div className="space-y-4">
          {/* Name */}
          <div className="name-search-container relative pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={nameSearch}
                onChange={(e) => {
                  setNameSearch(e.target.value);
                  setShowNameDropdown(true);
                  if (!e.target.value.trim()) {
                    setCreateSessionData({
                      ...createSessionData,
                      name: "",
                    });
                  }
                  // Clear validation warning when user starts typing
                  if (hasAttemptedSubmit && validationWarnings.name) {
                    setValidationWarnings((prev) => ({
                      ...prev,
                      name: false,
                    }));
                  }
                }}
                onFocus={() => {
                  setShowNameDropdown(true);
                  // Clear validation warning when user focuses on the field
                  if (hasAttemptedSubmit && validationWarnings.name) {
                    setValidationWarnings((prev) => ({
                      ...prev,
                      name: false,
                    }));
                  }
                }}
                placeholder="Search for a user..."
                className={`w-full py-3 border rounded-2xl text-base transition-colors focus:outline-blue-500 placeholder:font-normal placeholder:text-gray-400 ${
                  hasAttemptedSubmit && validationWarnings.name
                    ? "border-red-500 focus:border-red-500 pl-4 pr-12"
                    : "border-gray-300 focus:border-primary pl-4 pr-12"
                }`}
                required
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                  />
                </svg>
              </div>
            </div>

            {/* Search Results Dropdown */}
            {showNameDropdown && filteredSubscriptions.length > 0 && (
              <div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredSubscriptions.map((subscription) => (
                  <button
                    key={subscription.id}
                    type="button"
                    onClick={() => handleNameSelect(subscription)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                  >
                    <div className="font-medium text-gray-900">
                      {subscription.displayName ||
                        subscription.name ||
                        subscription.id}
                    </div>
                    {subscription.customMemberId && (
                      <div className="text-sm text-gray-500">
                        ID: {subscription.customMemberId}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {showNameDropdown &&
              nameSearch.trim() &&
              filteredSubscriptions.length === 0 && (
                <div className="absolute z-30 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="px-3 py-2 text-gray-500 text-sm">
                    No users found matching "{nameSearch}"
                  </div>
                </div>
              )}

            {/* Validation Warning */}
            {hasAttemptedSubmit && validationWarnings.name && (
              <div className="mt-1 text-sm text-red-600">Name is required</div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={
                  selectedDateInfo
                    ? `${new Date(
                        selectedDateInfo.year,
                        selectedDateInfo.month,
                        selectedDateInfo.day,
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}`
                    : createSessionData.date
                      ? new Date(createSessionData.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          },
                        )
                      : "Select a date"
                }
                onClick={() => {
                  setShowDatePicker(!showDatePicker);
                  // Clear validation warning when user clicks on the date field
                  if (hasAttemptedSubmit && validationWarnings.date) {
                    setValidationWarnings((prev) => ({
                      ...prev,
                      date: false,
                    }));
                  }
                }}
                readOnly
                className={`date-input w-full py-3 border rounded-2xl text-base transition-colors focus:outline-blue-500 cursor-pointer select-none ${
                  hasAttemptedSubmit && validationWarnings.date
                    ? "border-red-500 focus:border-red-500 pl-4 pr-12"
                    : "border-gray-300 focus:border-primary pl-4 pr-12"
                }`}
                required
              />
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>

            {/* Validation Warning */}
            {hasAttemptedSubmit && validationWarnings.date && (
              <div className="mt-1 text-sm text-red-600">Date is required</div>
            )}

            {/* Custom Calendar Picker - Styled like mobile CustomCalendarModal */}
            {showDatePicker && (
              <div
                className="calendar-picker fixed z-[9999] bg-[#F4F4F5] border border-gray-300 rounded-2xl shadow-lg p-5 w-80"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {/* Calendar Navigation */}
                <div className="flex items-center justify-between mb-5">
                  <div className="text-base font-medium text-gray-900">
                    {new Date(
                      calendarView.year,
                      calendarView.month,
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => navigateCalendarMonth(-1)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateCalendarMonth(1)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Weekday Labels */}
                <div className="grid grid-cols-7 mb-4">
                  {daysOfWeek.map((day) => (
                    <div
                      key={day}
                      className="text-center text-sm font-medium text-gray-900 py-2"
                    >
                      {day.charAt(0)}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-6">
                  {generateCalendarDays().map((dayObj, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        if (!dayObj.isPast && dayObj.isCurrentMonth) {
                          handleDateSelect(
                            dayObj.date,
                            calendarView.month,
                            calendarView.year,
                          );
                        }
                      }}
                      disabled={dayObj.isPast || !dayObj.isCurrentMonth}
                      className={`h-11 w-11 rounded-full text-base font-medium transition-all duration-200 flex items-center justify-center ${
                        dayObj.isSelected
                          ? "bg-primary text-white shadow-md"
                          : dayObj.isPast || !dayObj.isCurrentMonth
                            ? "text-gray-400 opacity-30 cursor-not-allowed"
                            : "text-gray-900 hover:bg-primary hover:text-white cursor-pointer"
                      }`}
                    >
                      {dayObj.date}
                    </button>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="px-6 py-3 text-base font-medium text-primary hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="px-6 py-3 text-base font-medium text-primary hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={createSessionData.time}
                onChange={(e) => {
                  setCreateSessionData({
                    ...createSessionData,
                    time: e.target.value,
                  });
                  // Clear validation warning when user selects a time
                  if (hasAttemptedSubmit && validationWarnings.time) {
                    setValidationWarnings((prev) => ({
                      ...prev,
                      time: false,
                    }));
                  }
                }}
                className={`w-full py-3 pr-8 border rounded-2xl text-base transition-colors focus:outline-blue-500 appearance-none bg-white ${
                  hasAttemptedSubmit && validationWarnings.time
                    ? "border-red-500 focus:border-red-500 pl-4"
                    : "border-gray-300 focus:border-primary pl-4"
                }`}
                required
              >
                <option value="">Select a Time</option>
                <option value="7:30 AM - 8:30 AM">7:30 AM - 8:30 AM</option>
                <option value="9:30 AM - 10:30 AM">9:30 AM - 10:30 AM</option>
                <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
                <option value="5:30 PM - 6:30 PM">5:30 PM - 6:30 PM</option>
                <option value="6:30 PM - 7:30 PM">6:30 PM - 7:30 PM</option>
                <option value="7:30 PM - 8:30 PM">7:30 PM - 8:30 PM</option>
              </select>

              {/* Custom Arrow for Time */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            {/* Validation Warning */}
            {hasAttemptedSubmit && validationWarnings.time && (
              <div className="mt-1 text-sm text-red-600">Time is required</div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={createSessionData.title}
              onChange={(e) =>
                setCreateSessionData({
                  ...createSessionData,
                  title: e.target.value,
                })
              }
              placeholder="Enter session title"
              className="w-full py-3 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 placeholder:font-normal placeholder:text-gray-400 pl-4 pr-4"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="relative">
              <select
                value={createSessionData.type}
                onChange={(e) =>
                  setCreateSessionData({
                    ...createSessionData,
                    type: e.target.value,
                  })
                }
                className="w-full py-3 pr-8 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 appearance-none bg-white pl-4"
              >
                <option value="solo">Solo</option>
                <option value="group">Group</option>
                <option value="personal">Personal Training</option>
                <option value="class">Class</option>
              </select>

              {/* Custom Arrow for Type */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Descriptions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descriptions
            </label>
            <textarea
              value={createSessionData.descriptions}
              onChange={(e) =>
                setCreateSessionData({
                  ...createSessionData,
                  descriptions: e.target.value,
                })
              }
              placeholder="Enter session description"
              rows="2"
              className="w-full py-3 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 resize-none placeholder:font-normal placeholder:text-gray-400 pl-4 pr-4"
            />
          </div>
        </div>
      </EditModal>
    </div>
  );
};

export default Sessions;
