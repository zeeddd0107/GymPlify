import React from "react";

/**
 * FilterSelect Component
 * A reusable select component with consistent styling for filters
 * @param {Object} props - Component props
 * @param {string} props.value - Current selected value
 * @param {function} props.onChange - Change handler function
 * @param {Array} props.options - Array of option objects with value and label
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.placeholder - Placeholder text for the select
 */
const FilterSelect = ({
  value,
  onChange,
  options = [],
  className = "",
  placeholder = "Select option",
}) => {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary w-auto min-w-[140px] ${className}`}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default FilterSelect;
