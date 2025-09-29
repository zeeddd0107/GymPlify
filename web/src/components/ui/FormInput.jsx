import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

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
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`relative mb-2 ${className}`}>
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
        />
      )}
      <input
        type={isPasswordField && showPassword ? "text" : type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full py-3 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 placeholder:font-normal placeholder:text-gray-400 ${
          icon ? "pl-12" : "pl-4"
        } ${isPasswordField ? "pr-12" : "pr-4"} ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-gray-300 focus:border-primary"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        {...props}
      />
      {isPasswordField && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          disabled={disabled}
        >
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="text-sm"
          />
        </button>
      )}
    </div>
  );
};

export default FormInput;
