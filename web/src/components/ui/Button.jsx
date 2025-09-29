import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  isLoading = false,
  className = "",
  onClick,
  ...props
}) => {
  // Base button classes
  const baseClasses =
    "font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2";

  // Size variants
  const sizeClasses = {
    sm: "py-2 px-4 text-sm rounded-lg",
    md: "py-3 px-6 text-base rounded-[20px]",
    lg: "py-4 px-8 text-lg rounded-[20px]",
  };

  // Color variants
  const variantClasses = {
    primary: "bg-primary text-white hover:bg-[#3a0ca3] focus:ring-primary",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning:
      "bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-500",
    purple:
      "bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",
    ghost: "text-primary hover:bg-primary hover:text-white focus:ring-primary",
  };

  // Combine all classes
  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={buttonClasses}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin w-5 h-6" />
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
