import React from "react";

/**
 * Reusable EditDeleteButtons Component
 * @param {Object} props - Component props
 * @param {Function} props.onEdit - Function called when Edit button is clicked
 * @param {Function} props.onDelete - Function called when Delete button is clicked
 * @param {boolean} props.editing - Whether edit action is in progress
 * @param {boolean} props.deleting - Whether delete action is in progress
 * @param {string} props.editText - Text for Edit button
 * @param {string} props.deleteText - Text for Delete button
 * @param {string} props.editingText - Text shown when editing
 * @param {string} props.deletingText - Text shown when deleting
 * @param {boolean} props.disabled - Whether buttons are disabled
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.editButtonClassName - Additional CSS classes for Edit button
 * @param {string} props.deleteButtonClassName - Additional CSS classes for Delete button
 */
const EditDeleteButtons = ({
  onEdit,
  onDelete,
  editing = false,
  deleting = false,
  editText = "Edit",
  deleteText = "Delete",
  editingText = "Editing...",
  deletingText = "Deleting...",
  disabled = false,
  className = "",
  editButtonClassName = "",
  deleteButtonClassName = "",
}) => {
  return (
    <div className={`flex justify-end space-x-3 ${className}`}>
      {/* Edit Button - Secondary styling */}
      <button
        onClick={onEdit}
        disabled={editing || deleting || disabled}
        className={`
          px-6 py-3 !text-sm font-medium rounded-xl border border-gray-300 
          bg-white text-primary hover:bg-gray-50 hover:border-primary
          focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
          transition-all duration-200 ease-in-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
          ${editButtonClassName}
        `.trim()}
      >
        {editing ? editingText : editText}
      </button>

      {/* Delete Button - Primary styling with red background */}
      <button
        onClick={onDelete}
        disabled={editing || deleting || disabled}
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

export default EditDeleteButtons;
