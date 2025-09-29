import React from "react";

/**
 * Reusable Save/Cancel Button Pair Component
 * @param {Object} props - Component props
 * @param {Function} props.onCancel - Function called when cancel button is clicked
 * @param {Function} props.onSave - Function called when save button is clicked
 * @param {boolean} props.saving - Whether the save operation is in progress
 * @param {string} props.saveText - Text for save button (default: "Save Changes")
 * @param {string} props.savingText - Text for save button when saving (default: "Saving...")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancel")
 * @param {boolean} props.disabled - Whether buttons are disabled
 * @param {string} props.className - Additional CSS classes for the container
 * @param {string} props.cancelButtonClassName - Additional CSS classes for cancel button
 * @param {string} props.saveButtonClassName - Additional CSS classes for save button
 */
const SaveCancelButtons = ({
  onCancel,
  onSave,
  saving = false,
  saveText = "Save",
  savingText = "Saving...",
  cancelText = "Cancel",
  disabled = false,
  className = "",
  cancelButtonClassName = "",
  saveButtonClassName = "",
}) => {
  return (
    <div className={`flex justify-end space-x-3 ${className}`}>
      {/* Cancel Button - Secondary styling */}
      <button
        onClick={saving || disabled ? undefined : onCancel}
        disabled={saving || disabled}
        className={`
          px-6 py-3.5 !text-sm font-medium rounded-lg border border-gray-300 
          bg-white text-primary hover:bg-gray-50 hover:border-primary
          focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
          transition-all duration-200 ease-in-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-300
          ${cancelButtonClassName}
        `.trim()}
      >
        {cancelText}
      </button>

      {/* Save Button - Primary styling */}
      <button
        onClick={saving || disabled ? undefined : onSave}
        disabled={saving || disabled}
        className={`
          px-6 py-3 !text-sm font-medium rounded-lg border border-transparent
          bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          transition-all duration-200 ease-in-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600
          ${saveButtonClassName}
        `.trim()}
      >
        {saving ? savingText : saveText}
      </button>
    </div>
  );
};

export default SaveCancelButtons;
