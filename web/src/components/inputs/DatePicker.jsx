import React, { useState } from "react";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";

/**
 * Reusable DatePicker Component with Custom Calendar
 * @param {Object} props - Component props
 * @param {string} props.startDate - Start date value
 * @param {string} props.endDate - End date value
 * @param {Function} props.onStartDateChange - Function called when start date changes
 * @param {Function} props.onEndDateChange - Function called when end date changes
 * @param {string} props.startDateLabel - Label for start date field (default: "Start Date")
 * @param {string} props.endDateLabel - Label for end date field (default: "End Date")
 */
const DatePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startDateLabel = "Start Date",
  endDateLabel = "End Date",
}) => {
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate calendar days for the current month
  const generateCalendarDays = (month) => {
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Navigate to previous or next month
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // Handle date selection
  const handleDateSelect = (day, isStartDatePicker) => {
    if (!day) return;

    const selectedDate = new Date(currentMonth);
    selectedDate.setDate(day);
    const dateString = selectedDate.toISOString().split("T")[0];

    if (isStartDatePicker) {
      onStartDateChange(dateString);
      setShowStartDatePicker(false);
    } else {
      onEndDateChange(dateString);
      setShowEndDatePicker(false);
    }
  };

  // Check if a date is selected
  const isDateSelected = (day, isStartDatePicker) => {
    if (!day) return false;

    const dateToCheck = new Date(currentMonth);
    dateToCheck.setDate(day);
    const dateString = dateToCheck.toISOString().split("T")[0];

    if (isStartDatePicker) {
      return dateString === startDate;
    } else {
      return dateString === endDate;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Helper function to determine text size based on date length
  const getDateTextSize = (dateString) => {
    if (!dateString) return "text-sm";
    const formattedDate = formatDate(dateString);
    return formattedDate.length <= 16 ? "text-base" : "text-sm";
  };

  // Helper function to determine padding based on text size
  const getDatePadding = (dateString) => {
    if (!dateString) return "py-2";
    const formattedDate = formatDate(dateString);
    return formattedDate.length <= 16 ? "py-2" : "py-2.5";
  };

  // Handle opening date picker
  const handleOpenDatePicker = (isStartDatePicker) => {
    if (isStartDatePicker) {
      // If start date picker is already open, close it
      if (showStartDatePicker) {
        setShowStartDatePicker(false);
        return;
      }

      // Set calendar to show the month of the start date if it exists
      if (startDate) {
        const startDateObj = new Date(startDate);
        setCurrentMonth(startDateObj);
      } else {
        setCurrentMonth(new Date());
      }
      setShowStartDatePicker(true);
      setShowEndDatePicker(false);
    } else {
      // If end date picker is already open, close it
      if (showEndDatePicker) {
        setShowEndDatePicker(false);
        return;
      }

      // Set calendar to show the month of the end date if it exists
      if (endDate) {
        const endDateObj = new Date(endDate);
        setCurrentMonth(endDateObj);
      } else {
        setCurrentMonth(new Date());
      }
      setShowEndDatePicker(true);
      setShowStartDatePicker(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-4">
      {/* Start Date Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {startDateLabel}
        </label>
        <button
          type="button"
          onClick={() => handleOpenDatePicker(true)}
          className={`w-full px-3 ${startDate ? getDatePadding(startDate) : "py-2"} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saveButton focus:border-transparent bg-white text-left flex justify-between items-center ${showStartDatePicker ? "ring-1 ring-saveButton border-saveButton" : ""}`}
        >
          <span
            className={`${startDate ? "text-gray-900" : "text-gray-500"} ${startDate ? getDateTextSize(startDate) : "text-sm"} truncate`}
          >
            {startDate ? formatDate(startDate) : "Select start date"}
          </span>
          <FaChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </button>
      </div>

      {/* End Date Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {endDateLabel}
        </label>
        <button
          type="button"
          onClick={() => handleOpenDatePicker(false)}
          className={`w-full px-3 ${endDate ? getDatePadding(endDate) : "py-2"} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saveButton focus:border-transparent bg-white text-left flex justify-between items-center ${showEndDatePicker ? "ring-1 ring-saveButton border-saveButton" : ""}`}
        >
          <span
            className={`${endDate ? "text-gray-900" : "text-gray-500"} ${endDate ? getDateTextSize(endDate) : "text-sm"} truncate`}
          >
            {endDate ? formatDate(endDate) : "Select end date"}
          </span>
          <FaChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        </button>
      </div>

      {/* Custom Calendar (shows when a date field is active) */}
      {(showStartDatePicker || showEndDatePicker) && (
        <div className="col-span-2 border border-gray-200 rounded-lg p-4">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-1">
            <button
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition-colors"
              type="button"
              onClick={() => navigateMonth(-1)}
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            <h4 className="text-lg font-semibold">
              {currentMonth.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </h4>
            <button
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition-colors"
              type="button"
              onClick={() => navigateMonth(1)}
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
              <div
                key={day}
                className="text-center text-base font-normal text-gray-500 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays(currentMonth).map((day, idx) => {
              // Highlight selected day for the active field
              const isSelected =
                day && isDateSelected(day, showStartDatePicker);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={!day}
                  onClick={() => handleDateSelect(day, showStartDatePicker)}
                  className={`w-8 h-8 text-base rounded-full flex items-center justify-center transition-colors duration-300 ease-in-out ml-3 ${!day ? "invisible" : isSelected ? "bg-saveButton text-white" : "hover:bg-saveButton hover:text-white text-gray-900"}`}
                >
                  {day || ""}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
