import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import FormInput from "../ui/FormInput";
import Button from "../ui/Button";

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      // Simulate API call for password reset
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("Password reset instructions have been sent to your email");
    } catch {
      setError("Failed to send reset instructions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#4361ee] to-[#3a0ca3] px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-6 sm:p-8 md:p-10 text-center">
        {/* Key Icon */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon
              icon={faKey}
              className="text-lg sm:text-2xl text-primary"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Forgot password?
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-gray-600 mb-3">
          No worries, we'll send you reset instructions.
        </p>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm sm:text-base">
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4 sm:mb-6">
            <label
              htmlFor="email"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2 text-left"
            >
              Email
            </label>
            <FormInput
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error && error.includes("Email")}
            />
            {error && error.includes("Email") && (
              <p className="text-red-500 text-sm text-left">{error}</p>
            )}
          </div>

          {/* Reset Password Button */}
          <Button
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            loadingText="Sending..."
            className="w-full mb-4 sm:mb-6"
          >
            Reset password
          </Button>
        </form>

        {/* Back to Login Link */}
        <div className="flex justify-center">
          <button
            onClick={onBackToLogin}
            className="text-primary text-sm sm:text-base hover:underline flex items-center"
          >
            <FontAwesomeIcon
              icon={faArrowLeft}
              className="mr-2 text-xs sm:text-sm"
            />
            Back to log in
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
