import React from "react";
import { FaTimes } from "react-icons/fa";
import { EditButtons } from "@/components";

/**
 * Reusable EditModal Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {string} props.title - Modal title (default: "Edit")
 * @param {React.ReactNode} props.children - Modal content
 * @param {Function} props.onSave - Function to save changes
 * @param {boolean} props.saving - Whether the save operation is in progress
 * @param {string} props.saveText - Text for save button (default: "Save")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancel")
 * @param {boolean} props.disabled - Whether the save button should be disabled
 * @param {string} props.className - Additional CSS classes for the modal
 */
const EditModal = ({
  isOpen,
  onClose,
  title = "Edit",
  children,
  onSave,
  saving = false,
  saveText = "Save",
  cancelText = "Cancel",
  disabled = false,
  className = "",
}) => {
  // Don't render anything if modal is not open
  if (!isOpen) return null;

  // Main render function - displays edit modal with form and buttons
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg p-7 pb-5 pt-5 w-full max-w-lg mx-4 ${className}`}
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

        {/* Modal Content - displays the form or content passed as children */}
        <div className="space-y-4">{children}</div>

        {/* Modal Buttons - EditButtons component for Save/Cancel actions */}
        <EditButtons
          onCancel={onClose}
          onSave={onSave}
          saving={saving}
          saveText={saveText}
          cancelText={cancelText}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default EditModal;
