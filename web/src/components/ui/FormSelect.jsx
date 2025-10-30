import React from "react";

/**
 * Reusable FormSelect Component
 * @param {Object} props - Component props
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Function called when selection changes
 * @param {Array} props.options - Array of option objects with {value, label}
 * @param {string} props.placeholder - Placeholder text for the select
 * @param {boolean} props.disabled - Whether the select is disabled
 * @param {boolean} props.required - Whether the select is required
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.id - HTML id attribute
 * @param {string} props.name - HTML name attribute
 */
const FormSelect = ({
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  disabled = false,
  required = false,
  className = "",
  id,
  name,
  ...otherProps
}) => {
  return (
    <div className={`relative mb-2 ${className}`}>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          w-full py-3 border border-gray-300 rounded-2xl text-base transition-colors 
          focus:outline-blue-500 pl-4 pr-10
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "bg-white"}
          appearance-none
        `.trim()}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.75rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em'
        }}
        {...otherProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={option.value || index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormSelect;
