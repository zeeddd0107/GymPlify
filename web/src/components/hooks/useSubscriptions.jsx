import { useEffect, useState } from "react";
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
  calculateDaysLeft,
  getDisplayMemberId,
  timestampToDateString,
  dateStringToTimestamp,
  isSubscriptionExpired,
  getSubscriptionStatus,
} from "@/components/utils";

/**
 * Custom hook for Subscriptions page logic
 * Handles data fetching, editing, saving, and subscription management
 */
export const useSubscriptions = () => {
  const { user, isAdmin } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [deletingSubscription, setDeletingSubscription] = useState(null);
  const [editFormData, setEditFormData] = useState({
    plan: "",
    status: "",
    startDate: "",
    endDate: "",
    customMemberId: "",
    displayName: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Toast notification state
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: "success",
  });

  const looksLikeEmail = (text) =>
    typeof text === "string" && text.includes("@");

  // Status options for custom select
  const statusOptions = [
    { id: "active", name: "Active" },
    { id: "expired", name: "Expired" },
    { id: "cancelled", name: "Cancelled" },
    { id: "suspended", name: "Suspended" },
  ];

  // Function to handle opening edit modal
  const handleEditClick = (subscription) => {
    setEditingSubscription(subscription);

    // Convert Firestore timestamps to date strings for form inputs
    const startDate = timestampToDateString(subscription.startDate);
    const endDate = timestampToDateString(subscription.endDate);

    setEditFormData({
      plan: subscription.plan || "",
      status: subscription.status || "",
      startDate: startDate,
      endDate: endDate,
      customMemberId: subscription.customMemberId || "",
      displayName: subscription.displayName || "",
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
      const startDate = dateStringToTimestamp(editFormData.startDate);
      const endDate = dateStringToTimestamp(editFormData.endDate);

      // Create a temporary subscription object to calculate the correct status
      const tempSubscription = {
        ...editingSubscription,
        startDate: startDate,
        endDate: endDate,
        status: "active", // Always start with active to allow proper recalculation
      };

      // Calculate the correct status based on the new dates
      const calculatedStatus = getSubscriptionStatus(tempSubscription);

      const updateData = {
        plan: editFormData.plan,
        status: calculatedStatus, // Use calculated status instead of manual status
        startDate: startDate,
        endDate: endDate,
        customMemberId: editFormData.customMemberId,
        displayName: editFormData.displayName,
        updatedAt: new Date(),
      };

      await updateDoc(subscriptionRef, updateData);

      // Also update the user document to reflect the new subscription status
      const userRef = doc(db, "users", editingSubscription.userId);

      if (calculatedStatus === "expired") {
        // If subscription becomes expired, move activeSubscriptionId to lastSubscriptionId and set activeSubscriptionId to null
        await updateDoc(userRef, {
          subscriptionStatus: calculatedStatus,
          lastSubscriptionId: editingSubscription.id, // Move current activeSubscriptionId to lastSubscriptionId
          activeSubscriptionId: null, // Set activeSubscriptionId to null since subscription is expired
          updatedAt: new Date(),
        });
      } else {
        // If subscription is active, ensure activeSubscriptionId is set
        await updateDoc(userRef, {
          subscriptionStatus: calculatedStatus,
          activeSubscriptionId: editingSubscription.id, // Ensure activeSubscriptionId is set for active subscriptions
          updatedAt: new Date(),
        });
      }

      // Update local state with proper Firestore timestamp conversion
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.id === editingSubscription.id
            ? {
                ...sub,
                plan: updateData.plan,
                status: calculatedStatus, // Use calculated status
                customMemberId: updateData.customMemberId,
                displayName: updateData.displayName,
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
      setEditFormData({
        plan: "",
        status: "",
        startDate: "",
        endDate: "",
        customMemberId: "",
        displayName: "",
      });

      // Show success toast notification
      setToast({
        isVisible: true,
        message: `Subscription for ${editFormData.displayName} has been updated successfully! Status automatically set to ${calculatedStatus}.`,
        type: "success",
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      // Show error toast notification
      setToast({
        isVisible: true,
        message: "Failed to update subscription. Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Function to close edit modal
  const handleCloseModal = () => {
    setEditModalOpen(false);
    setEditingSubscription(null);
    setEditFormData({
      plan: "",
      status: "",
      startDate: "",
      endDate: "",
      customMemberId: "",
      displayName: "",
    });
  };

  // Function to handle form data changes
  const handleFormDataChange = (newData) => {
    setEditFormData((prev) => ({
      ...prev,
      ...newData,
    }));
  };

  // Function to close toast notification
  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  // Function to update expired subscriptions in database
  const updateExpiredSubscriptions = async (subscriptions) => {
    try {
      const batch = [];
      const userUpdates = [];

      for (const subscription of subscriptions) {
        // Check if subscription should be expired but isn't marked as expired in database
        if (
          isSubscriptionExpired(subscription.endDate) &&
          subscription.status !== "expired"
        ) {
          const subscriptionRef = doc(db, "subscriptions", subscription.id);
          batch.push(updateDoc(subscriptionRef, { status: "expired" }));

          // Update user document: move activeSubscriptionId to lastSubscriptionId and set activeSubscriptionId to null
          const userRef = doc(db, "users", subscription.userId);
          userUpdates.push(
            updateDoc(userRef, {
              subscriptionStatus: "expired",
              lastSubscriptionId: subscription.id, // Move current activeSubscriptionId to lastSubscriptionId
              activeSubscriptionId: null, // Set activeSubscriptionId to null since subscription is expired
              updatedAt: new Date(),
            }),
          );
        } else if (
          !isSubscriptionExpired(subscription.endDate) &&
          subscription.status === "active"
        ) {
          // Ensure user document reflects active status for non-expired subscriptions
          const userRef = doc(db, "users", subscription.userId);
          userUpdates.push(
            updateDoc(userRef, {
              subscriptionStatus: "active",
              activeSubscriptionId: subscription.id, // Ensure activeSubscriptionId is set for active subscriptions
              updatedAt: new Date(),
            }),
          );
        }
      }

      // Execute all updates in batch
      if (batch.length > 0) {
        await Promise.all(batch);
        console.log(`Updated ${batch.length} expired subscriptions`);
      }

      // Update user documents
      if (userUpdates.length > 0) {
        await Promise.all(userUpdates);
        console.log(`Updated ${userUpdates.length} user subscription statuses`);
      }

      // Refresh the subscriptions list to show updated statuses
      const updatedSubscriptions = subscriptions.map((sub) => ({
        ...sub,
        status: getSubscriptionStatus(sub),
      }));
      setSubscriptions(updatedSubscriptions);
    } catch (error) {
      console.error("Error updating expired subscriptions:", error);
    }
  };

  // Handle delete success
  const handleDeleteSuccess = (deletedId, deletedItem) => {
    // Remove the deleted subscription from local state
    setSubscriptions((prev) => prev.filter((sub) => sub.id !== deletedId));

    // Show success toast notification
    setToast({
      isVisible: true,
      message: `Subscription for ${deletedItem?.displayName || deletedItem?.itemName || "Unknown"} has been deleted successfully!`,
      type: "success",
    });
  };

  // Handle delete error
  const handleDeleteError = () => {
    // Show error toast notification
    setToast({
      isVisible: true,
      message: "Failed to delete subscription. Please try again.",
      type: "error",
    });
  };

  // Handle opening delete modal
  const handleDeleteClick = (subscription) => {
    setDeletingSubscription(subscription);
    setDeleteModalOpen(true);
  };

  // Handle closing delete modal
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingSubscription(null);
    setDeleting(false);
  };

  // Handle confirming delete
  const handleConfirmDelete = async () => {
    if (!deletingSubscription) return;

    setDeleting(true);
    try {
      // This will be handled by the Actions component's built-in delete functionality
      // The actual deletion logic is in the Actions component
      setDeleteModalOpen(false);
      setDeletingSubscription(null);
    } catch (error) {
      console.error("Error in delete confirmation:", error);
    } finally {
      setDeleting(false);
    }
  };

  // Column definitions for the DataTable
  const getColumns = (onDeleteSuccess, onDeleteError) => [
    {
      key: "memberId",
      label: "Member ID",
      render: (value, row) => ({
        type: "memberId",
        value: getDisplayMemberId(row),
        title: row.userId,
      }),
    },
    {
      key: "displayName",
      label: "Name",
      render: (value) => (
        <span className="break-words whitespace-normal">{value}</span>
      ),
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (value) =>
        value?.toDate ? value.toDate().toLocaleDateString() : "-",
    },
    {
      key: "endDate",
      label: "End Date",
      render: (value) =>
        value?.toDate ? value.toDate().toLocaleDateString() : "-",
    },
    {
      key: "daysLeft",
      label: "Days Left",
      render: (value, row) =>
        `${calculateDaysLeft(row.endDate, row.startDate)} days`,
    },
    {
      key: "status",
      label: "Status",
      render: (value, row) => ({
        type: "status",
        status: getSubscriptionStatus(row),
        subscription: row,
      }),
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => ({
        type: "actions",
        item: row,
        onEdit: handleEditClick,
        onDelete: handleDeleteClick,
        collectionName: "subscriptions",
        itemNameField: "displayName",
        itemType: "subscription",
        editTitle: "Edit subscription",
        deleteTitle: "Delete subscription",
        onDeleteSuccess: onDeleteSuccess,
        onDeleteError: onDeleteError,
      }),
    },
  ];

  // Fetch subscriptions data
  useEffect(() => {
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

        // Enrich/Correct displayName: avoid showing emails; use user's profile name instead
        const subscriptionsWithUserData = await Promise.all(
          subscriptionsData.map(async (sub) => {
            const needsUserFetch =
              !sub.customMemberId ||
              !sub.displayName ||
              looksLikeEmail(sub.displayName);

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
                displayName: looksLikeEmail(cleanDisplayName)
                  ? userData?.displayName || userData?.name || "Unknown User"
                  : cleanDisplayName,
                customMemberId:
                  sub.customMemberId || userData?.customMemberId || null,
              };
            } catch (error) {
              console.error("Error fetching user data:", error);
              return {
                ...sub,
                displayName: looksLikeEmail(sub.displayName)
                  ? "Unknown User"
                  : sub.displayName || "Unknown User",
                customMemberId: sub.customMemberId || null,
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

  return {
    // State
    subscriptions,
    loading,
    editModalOpen,
    deleteModalOpen,
    editingSubscription,
    deletingSubscription,
    editFormData,
    saving,
    deleting,
    statusOptions,
    getColumns,

    // Actions
    handleEditClick,
    handleSaveSubscription,
    handleCloseModal,
    handleFormDataChange,
    handleDeleteClick,
    handleCloseDeleteModal,
    handleConfirmDelete,
    handleDeleteSuccess,
    handleDeleteError,
    toast,
    handleCloseToast,
    currentPage,
    pageSize,
    setCurrentPage,
    setPageSize,
  };
};
