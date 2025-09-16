import React from "react";

/**
 * Reusable delete buttons component for Cancel and Delete actions
 * @param {Object} props - Component props
 * @param {Function} props.onCancel - Function to handle cancel action
 * @param {Function} props.onDelete - Function to handle delete action
 * @param {boolean} props.deleting - Whether the delete operation is in progress
 * @param {string} props.deleteText - Text to display on delete button (default: "Delete")
 * @param {string} props.cancelText - Text to display on cancel button (default: "Cancel")
 * @param {boolean} props.disabled - Whether buttons should be disabled (default: false)
 * @param {string} props.deleteButtonClassName - Custom CSS classes for delete button
 * @param {string} props.cancelButtonClassName - Custom CSS classes for cancel button
 */
const DeleteButton = ({
  onCancel,
  onDelete,
  deleting = false,
  deleteText = "Delete",
  cancelText = "Cancel",
  disabled = false,
  cancelButtonClassName = "",
  deleteButtonClassName = "",
}) => {
  const defaultCancel =
    "px-6 py-3 border text-white rounded-3xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl bg-grayButton hover:bg-grayButton/90";
  const defaultDelete =
    "px-6 py-3 border text-white rounded-3xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl bg-cancelButton hover:bg-cancelButton/80";
  const cancelClasses = cancelButtonClassName || defaultCancel;
  const deleteClasses = deleteButtonClassName || defaultDelete;
  // Main render function - displays Cancel and Delete buttons with shadows
  return (
    <div className="flex justify-end space-x-2 mt-6">
      {/* Cancel button with gray background and shadow effect */}
      <button
        onClick={onCancel}
        className={cancelClasses}
        disabled={deleting || disabled}
      >
        {cancelText}
      </button>
      {/* Delete button with red styling and shadow effect */}
      <button
        onClick={onDelete}
        disabled={deleting || disabled}
        className={deleteClasses}
      >
        {deleting ? "Deleting..." : deleteText}
      </button>
    </div>
  );
};

export default DeleteButton;
