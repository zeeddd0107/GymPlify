import React from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { DeleteButton } from "@/components";

/**
 * Reusable DeleteModal Component for delete confirmations
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.title - Modal title (default: "Confirm Delete")
 * @param {string} props.itemName - Name of the item being deleted
 * @param {string} props.itemType - Type of item (subscription, inventory item, etc.)
 * @param {Function} props.onConfirm - Function to confirm deletion
 * @param {boolean} props.deleting - Whether the delete operation is in progress
 * @param {string} props.confirmText - Text for confirm button (default: "Delete")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancel")
 * @param {boolean} props.disabled - Whether the confirm button should be disabled
 * @param {string} props.className - Additional CSS classes for the modal
 * @param {React.ReactNode} props.children - Additional content to show in modal
 */
const DeleteModal = ({
  isOpen,
  onClose,
  title = "Confirm Delete",
  itemName = "Unknown Item",
  itemType = "item",
  onConfirm,
  deleting = false,
  confirmText = "Delete",
  cancelText = "Cancel",
  disabled = false,
  className = "",
  children,
}) => {
  // Don't render anything if modal is not open
  if (!isOpen) return null;

  // Main render function - displays delete confirmation modal with warning
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg p-7 pb-5 pt-5 w-full max-w-md mx-4 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with title and close button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-black/5 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Icon and Message - displays warning triangle and confirmation text */}
        <div className="flex items-start space-x-3 mb-6">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Are you sure you want to delete this {itemType}?
            </h3>
            {/* Item name display in highlighted box */}
            <div className="mb-2">
              <div className="font-medium text-gray-900 bg-yellow-100 border border-yellow-300 px-3 py-2 rounded-lg w-full">
                {itemName}
              </div>
            </div>
            {/* Warning messages about permanent deletion */}
            <div className="space-y-2">
              <p className="text-sm text-red-600 font-medium">
                This action cannot be undone.
              </p>
              <p className="text-sm text-gray-600">
                • The {itemType} will be permanently removed from the system
              </p>
              {/* Removed extra bullets per design */}
            </div>
          </div>
        </div>

        {/* Additional Content - optional extra content passed as children */}
        {children && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            {children}
          </div>
        )}

        {/* Modal Buttons - DeleteButton component for Cancel/Delete actions */}
        <DeleteButton
          onCancel={onClose}
          onDelete={onConfirm}
          deleting={deleting}
          deleteText={confirmText}
          cancelText={cancelText}
          disabled={disabled}
          cancelButtonClassName="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          deleteButtonClassName="px-5 py-2.5 rounded-xl text-white bg-red-500 hover:bg-red-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  );
};

export default DeleteModal;
