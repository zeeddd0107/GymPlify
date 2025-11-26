import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { verifyOTP, resendOTP } from "@/services/otpService";
import Button from "../ui/Button";

const OTPVerification = ({
  email,
  otpId: initialOtpId,
  mode = "login",
  onVerified,
  onBack,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'error' or 'success'
  const [otpId, setOtpId] = useState(initialOtpId);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Refs for input fields stored in a single ref to keep stable identity
  const inputRefs = useRef([]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Auto-focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, []);

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle OTP input change
  const handleOtpChange = (text, index) => {
    // Clear error state when user starts typing again
    if (hasError) {
      setHasError(false);
      setMessage("");
      setMessageType("");
    }

    const newOtp = [...otp];

    // Handle paste (if user pastes 6 digits)
    if (text.length > 1) {
      const pastedCode = text.slice(0, 6).split("");
      pastedCode.forEach((char, i) => {
        if (i < 6 && /^\d$/.test(char)) {
          newOtp[i] = char;
        }
      });
      setOtp(newOtp);

      // Focus last filled input or first empty one
      const lastFilledIndex = pastedCode.length - 1;
      if (lastFilledIndex < 5) {
        inputRefs.current[lastFilledIndex + 1]?.focus();
      } else {
        inputRefs.current[5]?.blur();
      }
      return;
    }

    // Only allow single digit
    if (text.length > 1) return;

    // Only allow numbers
    if (text && !/^\d$/.test(text)) return;

    // Update OTP
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setMessage("Please enter the complete 6-digit code");
      setMessageType("error");
      setHasError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("");

    try {
      console.log("Verifying OTP...");
      console.log("Email:", email);
      console.log("OTP Code:", otpCode);
      console.log("OTP ID:", otpId);
      console.log("Mode:", mode);

      const response = await verifyOTP(email, otpCode, otpId, mode);

      console.log("OTP verified successfully!", response);
      setMessage("Verification successful!");
      setMessageType("success");

      // Call onVerified callback with response data
      if (onVerified) {
        onVerified(response);
      }
    } catch (error) {
      console.log("Verification error:", error.message);
      setMessage(
        error.message || "Invalid verification code. Please try again.",
      );
      setMessageType("error");
      setHasError(true);

      // Clear OTP fields on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend || resending) return;

    setResending(true);
    setMessage("");
    setMessageType("");
    setOtp(["", "", "", "", "", ""]);
    setHasError(false);

    try {
      console.log("Resending OTP...");
      const response = await resendOTP(email, otpId);

      console.log("OTP resent successfully!", response);
      setOtpId(response.otpId);
      setTimeLeft(300); // Reset timer to 5 minutes
      setCanResend(false);
      setMessage("A new verification code has been sent to your email");
      setMessageType("success");

      // Focus first input after resend
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error) {
      console.log("Resend error:", error.message);
      setMessage(error.message || "Failed to resend code. Please try again.");
      setMessageType("error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#4361ee] to-[#3a0ca3] px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-6 sm:p-8 md:p-10 pb-6 sm:pb-8">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            <span className="text-sm">Back to Login</span>
          </button>
        )}

        {/* Header */}

        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            {mode === "forgot-password"
              ? "Verify Your Email"
              : "Email Verification"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-2">
            We've sent a 6-digit code to
          </p>
          <p className="text-sm sm:text-base font-semibold text-gray-800">
            {email}
          </p>
          {mode === "forgot-password" && (
            <p className="text-xs text-gray-500 mt-2">
              If this email is registered, you will receive a verification code.
            </p>
          )}
        </div>

        {/* OTP Input */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                hasError
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-primary"
              }`}
              disabled={loading || resending}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-4">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-600">
              Code expires in{" "}
              <span className="font-semibold text-primary">
                {formatTime(timeLeft)}
              </span>
            </p>
          ) : (
            <p className="text-sm text-red-600 font-semibold">
              Code expired. Please request a new one.
            </p>
          )}
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-4 p-3 border rounded text-sm sm:text-base ${
              messageType === "success"
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-red-100 border-red-400 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Verify Button */}
        <Button
          onClick={handleVerifyOTP}
          disabled={loading || resending || otp.join("").length !== 6}
          isLoading={loading}
          className="w-full mb-4"
        >
          Verify Code
        </Button>

        {/* Resend Code */}
        <div className="text-center flex items-center justify-center gap-1">
          <p className="text-sm text-gray-600">Didn't receive the code?</p>
          <button
            onClick={handleResendOTP}
            disabled={!canResend || resending}
            className={`text-sm font-semibold ${
              canResend && !resending
                ? "text-primary hover:underline cursor-pointer"
                : "text-gray-400 cursor-not-allowed"
            }`}
          >
            {resending ? "Sending..." : "Resend Code"}
          </button>
        </div>

        {/* Spam Notice */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 text-center">
            <span className="font-semibold">Note:</span> If you don't see the
            email, please check your spam folder.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
