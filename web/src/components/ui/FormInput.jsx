import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
 * Reusable Form Input UI Component
 * Handles consistent styling and behavior for form inputs
 */
const FormInput = ({
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  required = false,
  className = "",
  disabled = false,
  error = false,
  ...props
}) => {
  return (
    <div className={`relative mb-5 ${className}`}>
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray"
        />
      )}
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full pl-12 py-3 border rounded-[20px] text-base focus:outline-none transition-colors ${
          icon ? "pl-12" : "pl-4"
        } ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-[#b1b2b3] focus:border-primary"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        {...props}
      />
    </div>
  );
};

export default FormInput;
