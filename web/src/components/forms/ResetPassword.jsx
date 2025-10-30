import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDumbbell, faArrowLeft, faCheckCircle, faLock } from '@fortawesome/free-solid-svg-icons';
import { confirmPasswordReset } from 'firebase/auth';
import { auth } from '@/config/firebase';
import Button from '../ui/Button';
import FormInput from '../ui/FormInput';

const ResetPassword = ({ email, resetCode, onBack, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'error' or 'success'
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password validation
  const validatePassword = (password) => {
    const validation = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
    };

    setPasswordValidation(validation);

    const validCount = Object.values(validation).filter(Boolean).length;
    const strength = Math.round((validCount / 4) * 100);
    setPasswordStrength(strength);

    return validation;
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 25) return '#ef4444'; // Red
    if (strength <= 50) return '#f59e0b'; // Orange
    if (strength <= 75) return '#eab308'; // Yellow
    return '#22c55e'; // Green
  };

  const getPasswordStrengthText = (strength) => {
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Validate fields
    if (!password.trim()) {
      setMessage("Please enter a new password");
      setMessageType('error');
      return;
    }

    if (!confirmPassword.trim()) {
      setMessage("Please confirm your password");
      setMessageType('error');
      return;
    }

    // Check password requirements
    const validation = validatePassword(password);
    const requiredChecks = [
      validation.minLength,
      validation.hasUppercase,
      validation.hasNumber,
      validation.hasSpecialChar,
    ];
    const allRequirementsMet = requiredChecks.every(Boolean);

    if (!allRequirementsMet) {
      setMessage("Please meet all password requirements");
      setMessageType('error');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      // Check if reset code is available
      if (!resetCode) {
        setMessage("Invalid reset session. Please start over.");
        setMessageType('error');
        setLoading(false);
        return;
      }

      // Confirm password reset with the reset code
      await confirmPasswordReset(auth, resetCode, password);

      console.log('Password reset successfully!');
      
      // Show success modal
      setLoading(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error resetting password:', error.message);
      
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.code === 'auth/expired-action-code') {
        errorMessage = 'Reset link expired. Please request a new one.';
      } else if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'Invalid reset code. Please start over.';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Your account has been disabled.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Account not found. Please check your email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }

      setMessage(errorMessage);
      setMessageType('error');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center animate-fadeIn">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <FontAwesomeIcon
                  icon={faCheckCircle}
                  className="text-5xl text-green-600"
                />
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your password has been reset successfully. Please log in with your new password.
            </p>

            {/* Continue Button */}
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                if (onSuccess) {
                  onSuccess();
                }
              }}
              className="w-full"
            >
              Continue to Login
            </Button>
          </div>
        </div>
      )}

      {/* Reset Password Form */}
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#4361ee] to-[#3a0ca3] px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-6 sm:p-8 md:p-10 pb-6 sm:pb-8">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-6 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            <span className="text-sm">Back</span>
          </button>
        )}

        {/* Header */}

        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Reset Password
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleResetPassword}>
          {/* New Password Input */}
          <div className="mb-4 sm:mb-5">
            <label htmlFor="password" className="block text-sm sm:text-base font-medium text-gray-700 mb-2 text-left">
              New Password
            </label>
            <FormInput
              type="password"
              id="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                validatePassword(e.target.value);
                setMessage('');
              }}
              icon={faLock}
              error={!!message && messageType === 'error'}
              disabled={loading}
            />
          </div>

          {/* Confirm Password Input */}
          <div className="mb-10">
            <label htmlFor="confirmPassword" className="block text-sm sm:text-base font-medium text-gray-700 mb-2 text-left">
              Confirm Password
            </label>
            <FormInput
              type="password"
              id="confirmPassword"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setMessage('');
              }}
              icon={faLock}
              error={!!message && messageType === 'error'}
              disabled={loading}
            />
          </div>

          {/* Password Strength Meter (Only show when typing) */}
          {password.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border-2 border-gray-200">
              {/* Password Strength Bar */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-600">Password Strength</span>
                  <span 
                    className="text-xs font-semibold"
                    style={{ color: getPasswordStrengthColor(passwordStrength) }}
                  >
                    {getPasswordStrengthText(passwordStrength)}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-300 rounded-full"
                    style={{
                      width: `${passwordStrength}%`,
                      backgroundColor: getPasswordStrengthColor(passwordStrength),
                    }}
                  />
                </div>
              </div>

              {/* Password Requirements */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className={passwordValidation.minLength ? 'text-green-600' : 'text-red-600'}>
                    {passwordValidation.minLength ? '✓' : '✗'}
                  </span>
                  <span className={passwordValidation.minLength ? 'text-green-600' : 'text-gray-600'}>
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-600'}>
                    {passwordValidation.hasUppercase ? '✓' : '✗'}
                  </span>
                  <span className={passwordValidation.hasUppercase ? 'text-green-600' : 'text-gray-600'}>
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={passwordValidation.hasNumber ? 'text-green-600' : 'text-red-600'}>
                    {passwordValidation.hasNumber ? '✓' : '✗'}
                  </span>
                  <span className={passwordValidation.hasNumber ? 'text-green-600' : 'text-gray-600'}>
                    One number
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-red-600'}>
                    {passwordValidation.hasSpecialChar ? '✓' : '✗'}
                  </span>
                  <span className={passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-gray-600'}>
                    One special character
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`mb-4 p-3 border rounded text-sm ${
                messageType === 'success'
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : 'bg-red-100 border-red-400 text-red-700'
              }`}
            >
              {message}
            </div>
          )}

          {/* Reset Button */}
          <Button
            type="submit"
            disabled={loading}
            isLoading={loading}
            className="w-full"
          >
            Reset Password
          </Button>
        </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;

