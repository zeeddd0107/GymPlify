import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faKey, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { sendOTP } from "@/services/otpService";
import FormInput from "../ui/FormInput";
import Button from "../ui/Button";

const ForgotPassword = ({ onBackToLogin, onOTPSent }) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Comprehensive email validation (same as mobile)
  const validateEmail = (email) => {
    const trimmedEmail = email.trim();
    
    if (!trimmedEmail) {
      return { isValid: false, message: "Email address is required" };
    }
    
    if (/\s/.test(trimmedEmail)) {
      return { isValid: false, message: "Email address cannot contain spaces" };
    }
    
    const atCount = (trimmedEmail.match(/@/g) || []).length;
    if (atCount === 0) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
    if (atCount > 1) {
      return { isValid: false, message: "Email address cannot contain multiple @ symbols" };
    }
    
    const parts = trimmedEmail.split('@');
    const localPart = parts[0];
    const domain = parts[1];
    
    if (!localPart || localPart.length === 0) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
    
    if (!domain || domain.length === 0) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
    
    if (!domain.includes('.')) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
    
    const domainParts = domain.split('.');
    const tld = domainParts[domainParts.length - 1].toLowerCase();
    
    const validTLDs = [
      'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
      'co', 'uk', 'us', 'ca', 'au', 'de', 'fr', 'it', 'es', 'nl', 'be', 'ch', 'at',
      'io', 'ai', 'app', 'dev', 'tech', 'online', 'site', 'website', 'store', 'shop',
      'info', 'biz', 'me', 'tv', 'cc', 'ph', 'my', 'id', 'vn', 'th'
    ];
    
    if (!validTLDs.includes(tld)) {
      return { isValid: false, message: "Please enter a valid email address with a recognized domain" };
    }
    
    const domainName = domainParts.length >= 2 ? domainParts[domainParts.length - 2].toLowerCase() : '';
    
    const commonProviders = {
      'gmail': ['gmai', 'gmial', 'gmaill', 'gmails', 'gma1l', 'gma2l', 'gmali', 'gmsil', 'gnail'],
      'yahoo': ['yaho', 'yahooo', 'yahoos', 'yshoo', 'yhoo'],
      'hotmail': ['hotmai', 'hotmal', 'hotmial', 'hotmails', 'hotmil'],
      'outlook': ['outlok', 'outloo', 'outlooks', 'putlook'],
    };
    
    for (const [correct, typos] of Object.entries(commonProviders)) {
      if (typos.includes(domainName)) {
        return { isValid: false, message: `Did you mean ${correct}.${tld}? Please check your email address` };
      }
    }
    
    return { isValid: true, message: "" };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Send OTP to user's email for password reset
      const response = await sendOTP(email.trim(), 'forgot-password');
      
      console.log('OTP sent for password reset:', response);
      
      // Call callback to show OTP verification screen
      if (onOTPSent) {
        onOTPSent(email.trim(), response.otpId, response.expiresAt);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError("Failed to send verification code. Please try again.");
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
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          No worries, we'll send you reset instructions.
        </p>

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
              onChange={(e) => {
                setEmail(e.target.value);
                setError(""); // Clear error when typing
              }}
              error={!!error}
            />
            {error && (
              <p className="text-red-500 text-sm text-left mt-1">
                {error}
              </p>
            )}
          </div>

          {/* The main action button */}
          <Button
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full mb-4 sm:mb-6"
          >
            Send Verification Code
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
