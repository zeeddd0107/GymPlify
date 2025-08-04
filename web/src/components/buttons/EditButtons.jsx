import React from "react";

/**
 * Reusable edit buttons component for Cancel and Save actions
 * @param {Object} props - Component props
 * @param {Function} props.onCancel - Function to handle cancel action
 * @param {Function} props.onSave - Function to handle save action
 * @param {boolean} props.saving - Whether the save operation is in progress
 * @param {string} props.saveText - Text to display on save button (default: "Save")
 * @param {string} props.cancelText - Text to display on cancel button (default: "Cancel")
 * @param {boolean} props.disabled - Whether buttons should be disabled (default: false)
 * @param {string} props.saveButtonClassName - Custom CSS classes for save button
 * @param {string} props.cancelButtonClassName - Custom CSS classes for cancel button
 */
const EditButtons = ({
  onCancel,
  onSave,
  saving = false,
  saveText = "Save",
  cancelText = "Cancel",
  disabled = false,
  cancelButtonClassName = "bg-cancelButton hover:bg-cancelButton/80",
  saveButtonClassName = "bg-saveButton hover:bg-saveButton/90",
}) => {
  return (
    <div className="flex justify-end space-x-2 mt-6">
      {/* Cancel button */}
      <button
        onClick={onCancel}
        className={`px-6 py-3 border text-white rounded-3xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl ${cancelButtonClassName}`}
        disabled={saving || disabled}
      >
        {cancelText}
      </button>
      {/* Save button */}
      <button
        onClick={onSave}
        disabled={saving || disabled}
        className={`px-6 py-3 border text-white rounded-3xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl ${saveButtonClassName}`}
      >
        {saving ? "Saving..." : saveText}
      </button>
    </div>
  );
};

export default EditButtons;
