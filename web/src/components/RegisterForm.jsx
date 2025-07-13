import React, { useState } from "react";
import { useAuth } from "@/context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDumbbell,
  faLock,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";

const RegisterForm = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, signInWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await register(email, password);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signInWithGoogle();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary to-[#3a0ca3]">
      <div className="bg-white rounded-2xl shadow-2xl w-[400px] p-10 text-center">
        <div className="flex items-center justify-center mb-5">
          <FontAwesomeIcon
            icon={faDumbbell}
            className="text-[2.5rem] text-primary mr-2.5"
          />
          <h1 className="text-[2rem] font-bold text-primary font-main">
            GymPlify
          </h1>
        </div>
        <h2 className="mb-8 text-[1.5rem] font-bold text-gray-800">Register</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="relative mb-5">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray"
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-[#b1b2b3] rounded-[20px] text-base focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <div className="relative mb-5">
            <FontAwesomeIcon
              icon={faLock}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray"
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-[#b1b2b3] rounded-[20px] text-base focus:border-primary focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-white rounded-[20px] font-medium text-base transition-colors hover:bg-[#3a0ca3] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Register"}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-gray-500 text-sm">or</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-[20px] font-medium text-base transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {isLoading ? "Processing..." : "Continue with Google"}
        </button>

        <div className="mt-6 text-center">
          <span className="text-gray-600">Already have an account? </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary font-medium hover:underline ml-1"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
