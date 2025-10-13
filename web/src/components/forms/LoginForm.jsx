import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { useAuthForm } from "../hooks";
import FormInput from "../ui/FormInput";
import ForgotPassword from "./ForgotPassword";
import Button from "../ui/Button";

const LoginForm = () => {
  // I'm using my custom auth form hook to handle all the logic
  const {
    formData,
    isLoading,
    error,
    fieldErrors,
    handleInputChange,
    handleSubmit,
  } = useAuthForm("login");

  // I need to track whether to show the forgot password screen
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Let me handle going back to the login screen
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  // If they want to reset their password, show that screen instead
  if (showForgotPassword) {
    return <ForgotPassword onBackToLogin={handleBackToLogin} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#4361ee] to-[#3a0ca3] px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[420px] p-6 sm:p-8 md:p-10 pb-6 sm:pb-8 text-center">
        <div className="flex items-center justify-center mb-1">
          <FontAwesomeIcon
            icon={faDumbbell}
            className="text-[2rem] sm:text-[2.5rem] text-primary mr-2 sm:mr-2.5"
          />
          <h1 className="text-[1.5rem] sm:text-[2rem] font-bold text-primary font-main">
            GymPlify
          </h1>
        </div>
        <h2 className="mb-6 sm:mb-8 text-[1.25rem] sm:text-[1.5rem] font-bold text-gray-800">
          Sign In
        </h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4 sm:mb-5">
            <label
              htmlFor="email"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2 text-left"
            >
              Email
            </label>
            <FormInput
              type="text"
              id="email"
              placeholder="Enter your email"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              icon={faUser}
              error={!!fieldErrors.username || !!error}
            />
            {fieldErrors.username && (
              <p className="text-red-500 text-sm text-left">
                {fieldErrors.username}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-2 text-left"
            >
              Password
            </label>
            <FormInput
              type="password"
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              icon={faLock}
              error={!!fieldErrors.password || !!error}
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-sm text-left">
                {fieldErrors.password}
              </p>
            )}
          </div>
          {error && (
            <div
              className={`mb-4 p-3 border rounded text-sm sm:text-base ${
                error.includes("Account locked")
                  ? "bg-orange-100 border-orange-400 text-orange-700"
                  : error.includes("attempts left") ||
                      error.includes("attempt left")
                    ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                    : "bg-red-100 border-red-400 text-red-700"
              }`}
            >
              {error}
            </div>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            loadingText="Processing..."
            className="w-full"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-4 sm:mt-6">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-primary text-sm sm:text-base hover:underline"
          >
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
