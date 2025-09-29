import React from "react";

/**
 * Reusable CancelDeleteButtons Component
 * @param {Object} props - Component props
 * @param {Function} props.onCancel - Function called when Cancel button is clicked
 * @param {Function} props.onDelete - Function called when Delete button is clicked
 * @param {boolean} props.deleting - Whether delete action is in progress
 * @param {string} props.cancelText - Text for Cancel button
 * @param {string} props.deleteText - Text for Delete button
 * @param {string} props.deletingText - Text shown when deleting
 * @param {boolean} props.disabled - Whether buttons are disabled
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.cancelButtonClassName - Additional CSS classes for Cancel button
 * @param {string} props.deleteButtonClassName - Additional CSS classes for Delete button
 */
const CancelDeleteButtons = ({
  onCancel,
  onDelete,
  deleting = false,
  cancelText = "Cancel",
  deleteText = "Delete",
  deletingText = "Deleting...",
  disabled = false,
  className = "",
  cancelButtonClassName = "",
  deleteButtonClassName = "",
}) => {
  return (
    <div className={`flex justify-end space-x-3 ${className}`}>
      {/* Cancel Button - Secondary styling */}
      <button
        onClick={onCancel}
        disabled={deleting || disabled}
        className={`
          px-6 py-3 !text-sm font-medium rounded-xl border border-gray-300 
          bg-white text-primary hover:bg-gray-50 hover:border-primary
          focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
          transition-all duration-200 ease-in-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
          ${cancelButtonClassName}
        `.trim()}
      >
        {cancelText}
      </button>

      {/* Delete Button - Primary styling with red background */}
      <button
        onClick={onDelete}
        disabled={deleting || disabled}
        className={`
          px-6 py-3 !text-sm font-medium rounded-xl border border-transparent
          bg-red-500 text-white hover:bg-red-600 focus:bg-red-600
          focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          transition-all duration-200 ease-in-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500
          ${deleteButtonClassName}
        `.trim()}
      >
        {deleting ? deletingText : deleteText}
      </button>
    </div>
  );
};

export default CancelDeleteButtons;
