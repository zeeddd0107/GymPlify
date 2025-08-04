import React from "react";

/**
 * Reusable LabeledInput Component
 * @param {Object} props - Component props
 * @param {string} props.label - Label text for the input field
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Function called when input value changes
 * @param {string} props.type - Input type (text, email, password, etc.) - default: "text"
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {boolean} props.disabled - Whether the input is disabled - default: false
 * @param {string} props.className - Additional CSS classes for the container
 * @param {string} props.inputClassName - Additional CSS classes for the input field
 * @param {string} props.labelClassName - Additional CSS classes for the label
 * @param {boolean} props.required - Whether the field is required - default: false
 * @param {string} props.name - Input name attribute
 * @param {string} props.id - Input id attribute
 * @param {Object} props.inputProps - Additional props to pass to the input element
 */
const LabeledInput = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
  className = "",
  inputClassName = "",
  labelClassName = "",
  required = false,
  name,
  id,
  inputProps = {},
}) => {
  // Generate unique id if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Field */}
      <input
        type={type}
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-saveButton focus:border-transparent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${disabled ? "bg-gray-50 text-gray-500" : "bg-white text-gray-900"}
          ${inputClassName}
        `}
        {...inputProps}
      />
    </div>
  );
};

export default LabeledInput;
