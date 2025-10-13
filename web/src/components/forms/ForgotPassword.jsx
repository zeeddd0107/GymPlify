import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/config/firebase";
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

    // Let me check if this email looks valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      // Time to send that reset email through Firebase
      await sendPasswordResetEmail(auth, email);
      setMessage(
        "Password reset instructions have been sent to your email. Please check your spam folder if you don't see it.",
      );
    } catch (error) {
      // Firebase is giving me some specific error codes to work with
      if (error.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later.");
      } else {
        setError("Failed to send reset instructions. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#4361ee] to-[#3a0ca3] px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] p-6 sm:p-8 md:p-10 text-center">
        {/* The key icon for password reset */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <FontAwesomeIcon
              icon={faKey}
              className="text-lg sm:text-2xl text-primary"
            />
          </div>
        </div>

        {/* Main heading */}
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
          Forgot password?
        </h1>

        {/* Helpful subtitle */}
        <p className="text-sm sm:text-base text-gray-600 mb-3">
          No worries, we'll send you reset instructions.
        </p>

        {/* Show any errors that come up */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* The actual form */}
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

          {/* Show success message when email is sent */}
          {message && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm sm:text-base">
              {message}
            </div>
          )}

          {/* The main action button */}
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

        {/* Let them go back to login if they remember their password */}
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
