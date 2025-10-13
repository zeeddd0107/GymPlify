import { useState } from "react";
import { useAuth } from "@/context";

/**
 * This is my custom hook for handling all the authentication form logic
 * It takes care of form state, validation, and all the auth actions
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
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    password: "",
    email: "",
    confirmPassword: "",
  });

  const { signIn, signUp, signInWithGoogle } = useAuth();

  // Let me update a form field value
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Let me clear errors when the user starts typing
    if (error) {
      setError("");
    }
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Let me validate the form data
  const validateForm = () => {
    const newFieldErrors = {
      username: "",
      password: "",
      email: "",
      confirmPassword: "",
    };
    let hasErrors = false;

    if (!formData.username?.trim()) {
      newFieldErrors.username = "Email is required";
      hasErrors = true;
    }

    if (!formData.password?.trim()) {
      newFieldErrors.password = "Password is required";
      hasErrors = true;
    }

    if (formType === "register") {
      if (!formData.email?.trim()) {
        newFieldErrors.email = "Email is required";
        hasErrors = true;
      }

      if (formData.password !== formData.confirmPassword) {
        newFieldErrors.confirmPassword = "Passwords do not match";
        hasErrors = true;
      }
    }

    setFieldErrors(newFieldErrors);

    if (hasErrors) {
      return false;
    }

    return true;
  };

  // Let me handle the form submission
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
      // My AuthService handles specific error messages and attempt tracking
      setError(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Let me handle Google sign in
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

  // Let me reset the form
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
    fieldErrors,

    // Actions
    handleInputChange,
    handleSubmit,
    handleGoogleSignIn,
    resetForm,
  };
};
