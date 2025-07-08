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

  const { register } = useAuth();

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

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#4361ee] to-[#3a0ca3]">
      <div className="bg-white rounded-2xl shadow-2xl w-[400px] p-10 text-center">
        <div className="flex items-center justify-center mb-5">
          <FontAwesomeIcon
            icon={faDumbbell}
            className="text-[2.5rem] text-[#4362ee] mr-2.5"
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
            className="w-full py-3 bg-[#4361ee] text-white rounded-[20px] font-medium text-base transition-colors hover:bg-[#3a0ca3] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Register"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-600">Already have an account? </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-[#4361ee] font-medium hover:underline ml-1"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
