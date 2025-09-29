import React from "react";

/**
 * Reusable AddButton Component
 * @param {Object} props - Component props
 * @param {Function} props.onClick - Function called when button is clicked
 * @param {boolean} props.loading - Whether the action is in progress
 * @param {string} props.text - Text for the button
 * @param {string} props.loadingText - Text shown when loading
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.buttonClassName - Additional CSS classes for the button
 */
const AddButton = ({
  onClick,
  loading = false,
  text = "Add Item",
  loadingText = "Adding...",
  disabled = false,
  className = "",
  buttonClassName = "",
}) => {
  return (
    <div className={`flex justify-end ${className}`}>
      {/* Add Button - Primary styling with blue background */}
      <button
        onClick={onClick}
        disabled={loading || disabled}
        className={`
          px-6 py-3 !text-sm font-medium rounded-xl border border-transparent
          bg-primary text-white hover:bg-secondary focus:bg-secondary
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
          transition-all duration-200 ease-in-out
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary
          ${buttonClassName}
        `.trim()}
      >
        {loading ? loadingText : text}
      </button>
    </div>
  );
};

export default AddButton;
