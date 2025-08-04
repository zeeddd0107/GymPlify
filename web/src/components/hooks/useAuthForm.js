import { useState } from "react";
import { useAuth } from "@/context";

/**
 * Custom hook for authentication form logic
 * Handles form state, validation, and authentication actions
 */
export const useAuthForm = (formType = "login") => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { signIn, signUp, signInWithGoogle } = useAuth();

  // Update form field value
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  // Validate form data
  const validateForm = () => {
    if (!formData.username?.trim()) {
      setError("Username is required");
      return false;
    }

    if (!formData.password?.trim()) {
      setError("Password is required");
      return false;
    }

    if (formType === "register") {
      if (!formData.email?.trim()) {
        setError("Email is required");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      if (formType === "login") {
        await signIn(formData.username, formData.password);
      } else {
        await signUp(formData.username, formData.email, formData.password);
      }
    } catch (error) {
      setError(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google sign in
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signInWithGoogle();
    } catch (error) {
      setError(error.message || "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      email: "",
      confirmPassword: "",
    });
    setError("");
    setIsLoading(false);
  };

  return {
    // State
    formData,
    isLoading,
    error,

    // Actions
    handleInputChange,
    handleSubmit,
    handleGoogleSignIn,
    resetForm,
  };
};
