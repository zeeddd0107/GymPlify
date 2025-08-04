import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/config/firebase";

/**
 * Generic delete function for Firestore documents
 * @param {string} collectionName - Name of the Firestore collection
 * @param {string} documentId - ID of the document to delete
 * @param {Function} onSuccess - Callback function called on successful deletion
 * @param {Function} onError - Callback function called on error
 * @returns {Promise<void>}
 */
export const deleteDocument = async (
  collectionName,
  documentId,
  onSuccess = null,
  onError = null,
) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);

    if (onSuccess) {
      onSuccess(documentId);
    }
  } catch (error) {
    console.error(`Error deleting ${collectionName} document:`, error);
    if (onError) {
      onError(error);
    } else {
      throw error;
    }
  }
};

/**
 * Delete subscription from Firestore
 * @param {string} subscriptionId - ID of the subscription to delete
 * @param {Function} onSuccess - Callback function called on successful deletion
 * @param {Function} onError - Callback function called on error
 * @returns {Promise<void>}
 */
export const deleteSubscription = async (
  subscriptionId,
  onSuccess = null,
  onError = null,
) => {
  return deleteDocument("subscriptions", subscriptionId, onSuccess, onError);
};

/**
 * Delete inventory item from Firestore
 * @param {string} itemId - ID of the inventory item to delete
 * @param {Function} onSuccess - Callback function called on successful deletion
 * @param {Function} onError - Callback function called on error
 * @returns {Promise<void>}
 */
export const deleteInventoryItem = async (
  itemId,
  onSuccess = null,
  onError = null,
) => {
  return deleteDocument("inventory", itemId, onSuccess, onError);
};

/**
 * Delete staff member from Firestore
 * @param {string} staffId - ID of the staff member to delete
 * @param {Function} onSuccess - Callback function called on successful deletion
 * @param {Function} onError - Callback function called on error
 * @returns {Promise<void>}
 */
export const deleteStaffMember = async (
  staffId,
  onSuccess = null,
  onError = null,
) => {
  return deleteDocument("staff", staffId, onSuccess, onError);
};

/**
 * Delete user from Firestore
 * @param {string} userId - ID of the user to delete
 * @param {Function} onSuccess - Callback function called on successful deletion
 * @param {Function} onError - Callback function called on error
 * @returns {Promise<void>}
 */
export const deleteUser = async (userId, onSuccess = null, onError = null) => {
  return deleteDocument("users", userId, onSuccess, onError);
};

// Note: confirmDelete function has been replaced with DeleteModal component

/**
 * Show success notification after deletion
 * @param {string} itemName - Name of the deleted item
 * @param {string} itemType - Type of item that was deleted
 */
export const showDeleteSuccess = (itemName, itemType = "item") => {
  // You can replace this with your preferred notification system
  alert(`Successfully deleted ${itemType}: ${itemName}`);
};

/**
 * Show error notification after failed deletion
 * @param {Error} error - The error that occurred
 * @param {string} itemType - Type of item that failed to delete
 */
export const showDeleteError = (error, itemType = "item") => {
  // You can replace this with your preferred notification system
  alert(
    `Failed to delete ${itemType}. Please try again.\n\nError: ${error.message}`,
  );
};
