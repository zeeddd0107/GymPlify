import React from "react";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import { CancelDeleteButtons } from "@/components";

/**
 * Reusable DeleteModal Component for delete confirmations
 * Uses EditModal container structure with CancelDeleteButtons component
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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-4 sm:py-8 md:py-4 lg:py-6"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg w-full max-w-md mx-4 flex flex-col max-h-[90vh] shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with title and close button */}
        <div className="flex justify-between items-center px-6 py-4 sm:p-6 md:px-7 md:py-4 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-gray/20 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 pr-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 sm:p-2.5 text-gray-900 hover:text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 ease-in-out group flex-shrink-0"
          >
            <FaTimes className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>

        {/* Modal Content - displays the warning message and content */}
        <div className="px-6 sm:px-6 md:px-7 flex-1 overflow-y-auto">
          <div className="space-y-3 sm:space-y-4 md:space-y-5 pt-4">
            {/* Warning Icon and Message - displays warning triangle and confirmation text */}
            <div className="flex items-start space-x-3 mb-2">
              <div className="flex-shrink-0 mt-2">
                <FaExclamationTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
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
                </div>
              </div>
            </div>

            {/* Additional Content - optional extra content passed as children */}
            {children && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                {children}
              </div>
            )}
          </div>
        </div>

        {/* Modal Buttons - CancelDeleteButtons component for Cancel/Delete actions */}
        <div className="px-4 mb-1 sm:mb-0 sm:px-6 md:px-7 pt-4 sm:pt-5 pb-4 sm:pb-6 flex-shrink-0">
          <CancelDeleteButtons
            onCancel={onClose}
            onDelete={onConfirm}
            deleting={deleting}
            deleteText={confirmText}
            cancelText={cancelText}
            deletingText="Deleting..."
            disabled={disabled}
            cancelButtonClassName="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            deleteButtonClassName="px-5 py-2.5 rounded-xl text-white bg-red-500 hover:bg-red-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
