import React, { useEffect, useState } from "react";
import { db } from "@/config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "@/context";
import {
  FaEdit,
  FaTrash,
  FaTimes,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Listbox } from "@headlessui/react";
import { ModalButtons } from "@/components";

const Subscriptions = () => {
  const { user, isAdmin } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [editFormData, setEditFormData] = useState({
    plan: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Status options for custom select
  const statusOptions = [
    { id: "active", name: "Active" },
    { id: "expired", name: "Expired" },
    { id: "cancelled", name: "Cancelled" },
    { id: "suspended", name: "Suspended" },
  ];

  // Function to calculate days left
  const calculateDaysLeft = (endDate, startDate) => {
    if (!endDate) return 0;

    const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
    const start = startDate?.toDate
      ? startDate.toDate()
      : startDate
        ? new Date(startDate)
        : new Date();
    const today = new Date();

    // Use the later of start date or today as the reference point
    const referenceDate = start > today ? start : today;

    // Set both dates to start of day for accurate comparison
    const endDateOnly = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
    );
    const referenceDateOnly = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      referenceDate.getDate(),
    );

    const diffTime = endDateOnly - referenceDateOnly;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 0;
  };

  // Function to check if subscription is expired
  const isSubscriptionExpired = (endDate) => {
    if (!endDate) return false;
    const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
    const today = new Date();
    // Set both dates to start of day for accurate comparison
    const endDateOnly = new Date(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
    );
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    return endDateOnly < todayOnly;
  };

  // Function to get subscription status (with automatic expired check)
  const getSubscriptionStatus = (subscription) => {
    // If status is already expired, return expired
    if (subscription.status === "expired") return "expired";

    // Check if subscription should be expired based on end date
    if (isSubscriptionExpired(subscription.endDate)) {
      return "expired";
    }

    // Check if days left is 0
    const daysLeft = calculateDaysLeft(
      subscription.endDate,
      subscription.startDate,
    );
    if (daysLeft === 0) {
      return "expired";
    }

    return subscription.status || "active";
  };

  // Function to create short version of userId
  const getShortUserId = (userId) => {
    if (!userId) return "N/A";
    // Take first 8 characters and last 4 characters, separated by "..."
    if (userId.length <= 12) return userId;
    return `${userId.substring(0, 8)}...${userId.substring(userId.length - 4)}`;
  };

  // Function to get display Member ID (custom for mobile users, short userId for web)
  const getDisplayMemberId = (subscription) => {
    // For web (admin/staff), show short userId
    // For mobile users, show custom Member ID if available
    if (subscription.customMemberId) {
      return subscription.customMemberId;
    }
    return getShortUserId(subscription.userId);
  };

  // Function to handle opening edit modal
  const handleEditClick = (subscription) => {
    setEditingSubscription(subscription);

    // Convert Firestore timestamps to date strings for form inputs
    const startDate = subscription.startDate?.toDate
      ? subscription.startDate.toDate().toISOString().split("T")[0]
      : "";
    const endDate = subscription.endDate?.toDate
      ? subscription.endDate.toDate().toISOString().split("T")[0]
      : "";

    setEditFormData({
      plan: subscription.plan || "",
      status: subscription.status || "",
      startDate: startDate,
      endDate: endDate,
    });
    setEditModalOpen(true);
  };

  // Function to save subscription changes
  const handleSaveSubscription = async () => {
    if (!editingSubscription) return;

    setSaving(true);
    try {
      const subscriptionRef = doc(db, "subscriptions", editingSubscription.id);

      // Convert date strings back to Firestore timestamps
      const updateData = {
        plan: editFormData.plan,
        status: editFormData.status,
        startDate: editFormData.startDate
          ? new Date(editFormData.startDate)
          : null,
        endDate: editFormData.endDate ? new Date(editFormData.endDate) : null,
      };

      await updateDoc(subscriptionRef, updateData);

      // Update local state with proper Firestore timestamp conversion
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === editingSubscription.id
            ? {
                ...sub,
                plan: updateData.plan,
                status: updateData.status,
                // Convert JavaScript Date objects back to Firestore timestamps for display
                startDate: updateData.startDate
                  ? Timestamp.fromDate(updateData.startDate)
                  : null,
                endDate: updateData.endDate
                  ? Timestamp.fromDate(updateData.endDate)
                  : null,
              }
            : sub,
        ),
      );

      setEditModalOpen(false);
      setEditingSubscription(null);
      setEditFormData({ plan: "", status: "", startDate: "", endDate: "" });
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Failed to update subscription. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Function to close edit modal
  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingSubscription(null);
    setEditFormData({ plan: "", status: "", startDate: "", endDate: "" });
  };

  // Function to update expired subscriptions in database
  const updateExpiredSubscriptions = async (subscriptions) => {
    try {
      const batch = [];

      for (const subscription of subscriptions) {
        // Check if subscription should be expired but isn't marked as expired in database
        if (
          isSubscriptionExpired(subscription.endDate) &&
          subscription.status !== "expired"
        ) {
          const subscriptionRef = doc(db, "subscriptions", subscription.id);
          batch.push(updateDoc(subscriptionRef, { status: "expired" }));
        }
      }

      // Execute all updates in batch
      if (batch.length > 0) {
        await Promise.all(batch);
        console.log(`Updated ${batch.length} expired subscriptions`);

        // Refresh the subscriptions list to show updated statuses
        const updatedSubscriptions = subscriptions.map((sub) => ({
          ...sub,
          status: isSubscriptionExpired(sub.endDate) ? "expired" : sub.status,
        }));
        setSubscriptions(updatedSubscriptions);
      }
    } catch (error) {
      console.error("Error updating expired subscriptions:", error);
    }
  };

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
    // Use text-base for shorter dates (like "July 1, 2025"), text-sm for longer dates (like "September 15, 2025")
    return formattedDate.length <= 16 ? "text-base" : "text-sm";
  };

  // Helper function to determine padding based on text size
  const getDatePadding = (dateString) => {
    if (!dateString) return "py-2";
    const formattedDate = formatDate(dateString);
    // Use more padding for smaller text to give it breathing room
    return formattedDate.length <= 16 ? "py-2" : "py-2.5";
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const generateCalendarDays = (month) => {
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();
    const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const days = [];
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
      days.push(null); // Empty cells for days before the first day of the month
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const handleDateSelect = (day, isStartDatePicker) => {
    const newDate = new Date(currentMonth);
    newDate.setDate(day);

    if (isStartDatePicker) {
      setEditFormData((prev) => ({
        ...prev,
        startDate: newDate.toISOString().split("T")[0],
      }));
      // Do NOT close the calendar here
    } else {
      setEditFormData((prev) => ({
        ...prev,
        endDate: newDate.toISOString().split("T")[0],
      }));
      // Do NOT close the calendar here
    }
  };

  useEffect(() => {
    // Fetch subscriptions: all if admin, only own if not
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        let q;
        if (isAdmin) {
          // Admin: fetch all subscriptions, ordered by startDate desc
          q = query(
            collection(db, "subscriptions"),
            orderBy("startDate", "desc"),
          );
        } else {
          // Non-admin: fetch only own subscriptions
          q = query(
            collection(db, "subscriptions"),
            where("userId", "==", user.uid),
            orderBy("startDate", "desc"),
          );
        }
        const snap = await getDocs(q);
        const subscriptionsData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch user names and custom Member IDs for all subscriptions
        const subscriptionsWithUserData = await Promise.all(
          subscriptionsData.map(async (sub) => {
            try {
              const userDoc = await getDoc(doc(db, "users", sub.userId));
              const userData = userDoc.data();

              // Debug logging to see what user data we're getting
              console.log(`User data for ${sub.userId}:`, userData);

              const userName =
                userData?.displayName || userData?.email || "Unknown User";
              console.log(`Selected userName for ${sub.userId}:`, userName);

              return {
                ...sub,
                userName: userName,
                customMemberId: userData?.customMemberId || null,
              };
            } catch (error) {
              console.error("Error fetching user data:", error);
              return {
                ...sub,
                userName: "Unknown User",
                customMemberId: null,
              };
            }
          }),
        );

        setSubscriptions(subscriptionsWithUserData);

        // Check and update expired subscriptions
        await updateExpiredSubscriptions(subscriptionsWithUserData);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
        setSubscriptions([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSubscriptions();
  }, [user, isAdmin]);

  // Subscription Title and subtitle
  return (
    <div className="h-full">
      <div className="pl-1 pt-6">
        <h1 className="text-3xl font-bold text-primary mb-2">Subscriptions</h1>
        <p className="mb-8 text-gray-600">
          {isAdmin
            ? "Viewing all user subscriptions."
            : "Viewing your subscriptions only."}
        </p>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center text-gray-500">No subscriptions found.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow-lg bg-white h-full">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                  Member ID
                </th>
                <th className="px-5 py-3 text-left text-sm font-bold uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                  Days Left
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="hover:bg-primary/10 transition-colors"
                >
                  <td className="px-4 py-4" title={sub.userId}>
                    {getDisplayMemberId(sub)}
                  </td>
                  <td className="px-4 py-4">{sub.userName}</td>
                  <td className="px-5 py-4">
                    {sub.startDate?.toDate
                      ? sub.startDate.toDate().toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-4">
                    {sub.endDate?.toDate
                      ? sub.endDate.toDate().toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4">
                    {calculateDaysLeft(sub.endDate, sub.startDate)} days
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                        getSubscriptionStatus(sub) === "active"
                          ? "bg-green-100 text-green-700"
                          : getSubscriptionStatus(sub) === "expired"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {getSubscriptionStatus(sub)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-1">
                      <button
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
                        title="Edit subscription"
                        onClick={() => handleEditClick(sub)}
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete subscription"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Subscription Modal */}
      {editModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg p-7 pb-5 pt-5 w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Subscription
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Member Info (Read-only) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member ID
                  </label>
                  <input
                    type="text"
                    value={
                      editingSubscription?.customMemberId ||
                      getShortUserId(editingSubscription?.userId)
                    }
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Member Name
                  </label>
                  <input
                    type="text"
                    value={editingSubscription?.userName || ""}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                </div>
              </div>

              {/* Editable Fields */}
              {/* Plan field removed as requested */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Listbox
                  value={
                    statusOptions.find(
                      (status) => status.id === editFormData.status,
                    ) || statusOptions[0]
                  }
                  onChange={(selectedStatus) => {
                    setEditFormData((prev) => ({
                      ...prev,
                      status: selectedStatus.id,
                    }));
                  }}
                >
                  <div className="relative">
                    <Listbox.Button className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saveButton focus:border-transparent bg-white text-left flex justify-between items-center">
                      <span>
                        {editFormData.status
                          ? statusOptions.find(
                              (status) => status.id === editFormData.status,
                            )?.name
                          : "Select Status"}
                      </span>
                      <FaChevronDown className="w-4 h-4 text-gray-400" />
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {statusOptions.map((status) => (
                        <Listbox.Option
                          key={status.id}
                          value={status}
                          className={({ active }) =>
                            `cursor-pointer select-none px-4 py-2 ${
                              active
                                ? "bg-saveButton text-white"
                                : "text-gray-900"
                            }`
                          }
                        >
                          {status.name}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (showStartDatePicker) {
                        setShowStartDatePicker(false);
                      } else {
                        // Set calendar to show the month of the start date if it exists
                        if (editFormData.startDate) {
                          const startDate = new Date(editFormData.startDate);
                          setCurrentMonth(startDate);
                        } else {
                          setCurrentMonth(new Date());
                        }
                        setShowStartDatePicker(true);
                        setShowEndDatePicker(false);
                      }
                    }}
                    className={`w-full px-3 ${editFormData.startDate ? getDatePadding(editFormData.startDate) : "py-2"} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saveButton focus:border-transparent bg-white text-left flex justify-between items-center ${showStartDatePicker ? "ring-1 ring-saveButton border-saveButton" : ""}`}
                  >
                    <span
                      className={`${editFormData.startDate ? "text-gray-900" : "text-gray-500"} ${editFormData.startDate ? getDateTextSize(editFormData.startDate) : "text-sm"} truncate`}
                    >
                      {editFormData.startDate
                        ? formatDate(editFormData.startDate)
                        : "Select start date"}
                    </span>
                    <FaChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (showEndDatePicker) {
                        setShowEndDatePicker(false);
                      } else {
                        // Set calendar to show the month of the end date if it exists
                        if (editFormData.endDate) {
                          const endDate = new Date(editFormData.endDate);
                          setCurrentMonth(endDate);
                        } else {
                          setCurrentMonth(new Date());
                        }
                        setShowEndDatePicker(true);
                        setShowStartDatePicker(false);
                      }
                    }}
                    className={`w-full px-3 ${editFormData.endDate ? getDatePadding(editFormData.endDate) : "py-2"} border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-saveButton focus:border-transparent bg-white text-left flex justify-between items-center ${showEndDatePicker ? "ring-1 ring-saveButton border-saveButton" : ""}`}
                  >
                    <span
                      className={`${editFormData.endDate ? "text-gray-900" : "text-gray-500"} ${editFormData.endDate ? getDateTextSize(editFormData.endDate) : "text-sm"} truncate`}
                    >
                      {editFormData.endDate
                        ? formatDate(editFormData.endDate)
                        : "Select end date"}
                    </span>
                    <FaChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </button>
                </div>
              </div>

              {/* Inline Custom Calendar (shows when a date field is active) */}
              {(showStartDatePicker || showEndDatePicker) && (
                <div className="border border-gray-200 rounded-lg p-4 mb-6">
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
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-center text-base font-normal text-gray-500 py-2"
                        >
                          {day}
                        </div>
                      ),
                    )}
                  </div>
                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {generateCalendarDays(currentMonth).map((day, idx) => {
                      // Highlight selected day for the active field
                      const isSelected =
                        day &&
                        ((showStartDatePicker &&
                          editFormData.startDate &&
                          new Date(editFormData.startDate).getDate() === day &&
                          new Date(editFormData.startDate).getMonth() ===
                            currentMonth.getMonth() &&
                          new Date(editFormData.startDate).getFullYear() ===
                            currentMonth.getFullYear()) ||
                          (showEndDatePicker &&
                            editFormData.endDate &&
                            new Date(editFormData.endDate).getDate() === day &&
                            new Date(editFormData.endDate).getMonth() ===
                              currentMonth.getMonth() &&
                            new Date(editFormData.endDate).getFullYear() ===
                              currentMonth.getFullYear()));
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!day}
                          onClick={() => {
                            handleDateSelect(day, showStartDatePicker);
                            // Do NOT close the calendar here
                          }}
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

            <ModalButtons
              onCancel={handleCloseModal}
              onSave={handleSaveSubscription}
              saving={saving}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
