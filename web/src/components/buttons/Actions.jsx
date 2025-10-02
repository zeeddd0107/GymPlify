import React, { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import {
  deleteDocument,
  showDeleteSuccess,
  showDeleteError,
} from "../utils/DeleteUtils";
import { deleteInventoryItem } from "@/services/inventoryService";
import { DeleteModal } from "@/components";

/**
 * Reusable component for action buttons (edit, delete, etc.)
 * @param {Object} props - Component props
 * @param {Object} props.item - The item object (subscription, inventory item, etc.)
 * @param {Function} props.onEdit - Function called when edit button is clicked
 * @param {Function} props.onDelete - Function called when delete button is clicked
 * @param {boolean} props.showDelete - Whether to show delete button (default: true)
 * @param {string} props.editTitle - Title for edit button (default: "Edit")
 * @param {string} props.deleteTitle - Title for delete button (default: "Delete")
 * @param {string} props.collectionName - Firestore collection name for auto-delete
 * @param {string} props.itemNameField - Field name to use for item name in confirmation
 * @param {string} props.itemType - Type of item for confirmation message
 * @param {Function} props.onDeleteSuccess - Callback after successful deletion
 * @param {Function} props.onDeleteError - Callback after failed deletion
 */
const Actions = ({
  item,
  onEdit,
  onDelete,
  showDelete = true,
  editTitle = "Edit",
  deleteTitle = "Delete",
  collectionName = null,
  itemNameField = "name",
  itemType = "item",
  onDeleteSuccess = null,
  onDeleteError = null,
}) => {
  // State for managing delete modal and operations
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Function to handle delete button click - opens confirmation modal
  const handleDelete = async (itemToDelete) => {
    // Get item name for confirmation dialog
    const itemName =
      itemToDelete[itemNameField] ||
      itemToDelete.displayName ||
      itemToDelete.name ||
      itemToDelete.productName ||
      itemToDelete.id ||
      "Unknown Item";

    // Store item data and open delete confirmation modal
    setItemToDelete({ ...itemToDelete, itemName });
    setDeleteModalOpen(true);
  };

  // Function to confirm and execute delete operation
  const confirmDelete = async () => {
    if (!itemToDelete) return;

    setDeleting(true);
    try {
      // If custom delete function provided, use it
      if (onDelete) {
        try {
          await onDelete(itemToDelete);
          // Call success callback if provided
          if (onDeleteSuccess) {
            onDeleteSuccess(itemToDelete.id, itemToDelete);
          }
          setDeleteModalOpen(false);
          setItemToDelete(null);
        } catch (error) {
          // Call error callback if provided
          if (onDeleteError) {
            onDeleteError(error, itemToDelete);
          }
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }
        return;
      }

      // If collection name provided, use appropriate delete function
      if (collectionName && itemToDelete.id) {
        // Use specialized delete function for inventory items
        if (collectionName === "inventory") {
          try {
            await deleteInventoryItem(itemToDelete.id, itemToDelete);
            // Success callback - show success message and close modal
            if (onDeleteSuccess) {
              // If custom success handler provided, use it instead of default alert
              onDeleteSuccess(itemToDelete.id, itemToDelete);
            } else {
              // Only show default alert if no custom handler provided
              showDeleteSuccess(itemToDelete.itemName, itemType);
            }
            setDeleteModalOpen(false);
            setItemToDelete(null);
          } catch (error) {
            // Error callback - show error message and close modal
            showDeleteError(error, itemType);
            if (onDeleteError) {
              onDeleteError(error, itemToDelete);
            }
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }
        } else {
          // Use generic delete for other collections
          await deleteDocument(
            collectionName,
            itemToDelete.id,
            (deletedId) => {
              // Success callback - show success message and close modal
              if (onDeleteSuccess) {
                // If custom success handler provided, use it instead of default alert
                onDeleteSuccess(deletedId, itemToDelete);
              } else {
                // Only show default alert if no custom handler provided
                showDeleteSuccess(itemToDelete.itemName, itemType);
              }
              setDeleteModalOpen(false);
              setItemToDelete(null);
            },
            (error) => {
              // Error callback - show error message and close modal
              showDeleteError(error, itemType);
              if (onDeleteError) {
                onDeleteError(error, itemToDelete);
              }
              setDeleteModalOpen(false);
              setItemToDelete(null);
            },
          );
        }
      } else {
        console.warn(
          "No delete function provided and no collection name specified",
        );
        setDeleteModalOpen(false);
        setItemToDelete(null);
      }
    } catch (error) {
      // Handle any unexpected errors
      console.error("Error in delete handler:", error);
      showDeleteError(error, itemType);
      if (onDeleteError) {
        onDeleteError(error, itemToDelete);
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  // Function to close delete modal and reset state
  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
    setDeleting(false);
  };

  // Main render function - displays action buttons and delete modal
  return (
    <>
      <div className="flex space-x-1">
        {/* Edit button with blue styling */}
        <button
          className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
          title={editTitle}
          onClick={(e) => {
            e.stopPropagation();
            onEdit && onEdit(item);
          }}
        >
          <FaEdit className="w-4 h-4" />
        </button>

        {/* Delete button with red styling - only shown if showDelete is true */}
        {showDelete && (
          <button
            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
            title={deleteTitle}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
          >
            <FaTrash className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title={`Delete ${itemType}`}
        itemName={itemToDelete?.itemName || "Unknown Item"}
        itemType={itemType}
        onConfirm={confirmDelete}
        deleting={deleting}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default Actions;
