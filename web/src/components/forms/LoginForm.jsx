import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDumbbell, faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { useAuthForm } from "../hooks";
import FormInput from "../ui/FormInput";

const LoginForm = () => {
  // Use the custom auth form hook for all logic
  const { formData, isLoading, error, handleInputChange, handleSubmit } =
    useAuthForm("login");

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#4361ee] to-[#3a0ca3]">
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
        <h2 className="mb-8 text-[1.5rem] font-bold text-gray-800">Sign In</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <FormInput
            type="text"
            placeholder="Username"
            value={formData.username}
            onChange={(e) => handleInputChange("username", e.target.value)}
            icon={faUser}
            required
          />
          <FormInput
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            icon={faLock}
            required
            className="mb-8"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary text-white rounded-[20px] font-medium text-base transition-colors hover:bg-[#3a0ca3] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Processing..." : "Sign In"}
          </button>
        </form>

        <div className="mt-4">
          <a href="#" className="text-primary text-sm hover:underline">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
