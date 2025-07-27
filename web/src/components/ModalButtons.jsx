import React from "react";

/**
 * Reusable modal buttons component for Cancel and Save actions
 * @param {Object} props - Component props
 * @param {Function} props.onCancel - Function to handle cancel action
 * @param {Function} props.onSave - Function to handle save action
 * @param {boolean} props.saving - Whether the save operation is in progress
 * @param {string} props.saveText - Text to display on save button (default: "Save")
 * @param {string} props.cancelText - Text to display on cancel button (default: "Cancel")
 * @param {boolean} props.disabled - Whether buttons should be disabled (default: false)
 */
const ModalButtons = ({
  onCancel,
  onSave,
  saving = false,
  saveText = "Save",
  cancelText = "Cancel",
  disabled = false,
}) => {
  return (
    <div className="flex justify-end space-x-2 mt-4">
      {/* Cancel button */}
      <button
        onClick={onCancel}
        className="px-6 py-3 border bg-cancelButton text-white rounded-3xl hover:bg-cancelButton/80 transition-colors duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={saving || disabled}
      >
        {cancelText}
      </button>
      {/* Save button */}
      <button
        onClick={onSave}
        disabled={saving || disabled}
        className="px-6 py-3 border bg-saveButton text-white rounded-3xl hover:bg-saveButton/90 transition-colors duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : saveText}
      </button>
    </div>
  );
};

export default ModalButtons;
