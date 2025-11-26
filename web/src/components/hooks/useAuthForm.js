import { useState } from "react";
import { useAuth } from "@/context";

/**
 * Comprehensive email validation function (from mobile)
 */
const validateEmail = (email) => {
  // Trim the email first
  const trimmedEmail = email.trim();

  // Check if email is empty
  if (!trimmedEmail) {
    return { isValid: false, message: "Email address is required" };
  }

  // Check for spaces anywhere in the email
  if (/\s/.test(trimmedEmail)) {
    return { isValid: false, message: "Email address cannot contain spaces" };
  }

  // Check for exactly one @ symbol
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount === 0) {
    return { isValid: false, message: "Please enter a valid email address" };
  }
  if (atCount > 1) {
    return {
      isValid: false,
      message: "Email address cannot contain multiple @ symbols",
    };
  }

  // Split into local and domain parts
  const parts = trimmedEmail.split("@");
  const localPart = parts[0];
  const domain = parts[1];

  // Validate local part (before @)
  if (!localPart || localPart.length === 0) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  // Local part cannot start or end with a dot
  if (localPart.startsWith(".") || localPart.endsWith(".")) {
    return { isValid: false, message: "Invalid email format" };
  }

  // Local part cannot have consecutive dots
  if (/\.\./.test(localPart)) {
    return { isValid: false, message: "Invalid email format" };
  }

  // Local part should contain valid characters (letters, numbers, and some special chars)
  if (!/^[a-zA-Z0-9._+-]+$/.test(localPart)) {
    return {
      isValid: false,
      message: "Email address contains invalid characters",
    };
  }

  // Validate domain part (after @)
  if (!domain || domain.length === 0) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  // Domain must contain at least one dot
  if (!domain.includes(".")) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  // Domain cannot start or end with a dot
  if (domain.startsWith(".") || domain.endsWith(".")) {
    return { isValid: false, message: "Invalid email format" };
  }

  // Domain cannot have consecutive dots
  if (/\.\./.test(domain)) {
    return { isValid: false, message: "Invalid email format" };
  }

  // Domain cannot start or end with a hyphen
  if (domain.startsWith("-") || domain.endsWith("-")) {
    return { isValid: false, message: "Invalid email format" };
  }

  // Split domain into parts (subdomain.domain.tld)
  const domainParts = domain.split(".");

  // Each domain part must be valid
  for (const part of domainParts) {
    // Domain part cannot be empty
    if (!part || part.length === 0) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

    // Domain part should only contain letters, numbers, and hyphens
    if (!/^[a-zA-Z0-9-]+$/.test(part)) {
      return { isValid: false, message: "Invalid email format" };
    }

    // Domain part cannot start or end with hyphen
    if (part.startsWith("-") || part.endsWith("-")) {
      return { isValid: false, message: "Invalid email format" };
    }
  }

  // Top-level domain (last part) must be at least 2 characters and only letters
  const tld = domainParts[domainParts.length - 1].toLowerCase();
  if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  // Validate TLD against common valid TLDs
  const validTLDs = [
    "com",
    "org",
    "net",
    "edu",
    "gov",
    "mil",
    "int",
    "co",
    "uk",
    "us",
    "ca",
    "au",
    "de",
    "fr",
    "it",
    "es",
    "nl",
    "be",
    "ch",
    "at",
    "se",
    "no",
    "dk",
    "fi",
    "jp",
    "cn",
    "in",
    "br",
    "mx",
    "ru",
    "kr",
    "tw",
    "sg",
    "hk",
    "nz",
    "za",
    "ae",
    "sa",
    "eg",
    "il",
    "tr",
    "pl",
    "cz",
    "ie",
    "pt",
    "gr",
    "io",
    "ai",
    "app",
    "dev",
    "tech",
    "online",
    "site",
    "website",
    "store",
    "shop",
    "info",
    "biz",
    "me",
    "tv",
    "cc",
    "ws",
    "mobi",
    "name",
    "pro",
    "tel",
    "travel",
    "jobs",
    "cat",
    "asia",
    "eu",
    "ph",
    "my",
    "id",
    "vn",
    "th",
    "pk",
    "bd",
    "lk",
  ];

  if (!validTLDs.includes(tld)) {
    return {
      isValid: false,
      message: "Please enter a valid email address with a recognized domain",
    };
  }

  // Get the main domain name (second to last part)
  const domainName =
    domainParts.length >= 2
      ? domainParts[domainParts.length - 2].toLowerCase()
      : "";

  // Domain name must be at least 2 characters
  if (domainName.length < 2) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  // Check for common email provider typos
  const commonProviders = {
    gmail: [
      "gmai",
      "gmial",
      "gmaill",
      "gmails",
      "gma1l",
      "gma2l",
      "gma3l",
      "gma4l",
      "gma5l",
      "gma6l",
      "gma7l",
      "gma8l",
      "gma9l",
      "gmali",
      "gmsil",
      "gnail",
      "gail",
      "gmai1",
      "gmial",
      "gmal",
      "gmaol",
      "gmaul",
    ],
    yahoo: [
      "yaho",
      "yahooo",
      "yahoos",
      "yshoo",
      "yhoo",
      "yaoo",
      "yahho",
      "yahu",
    ],
    hotmail: [
      "hotmai",
      "hotmal",
      "hotmial",
      "hotmails",
      "hotmil",
      "hotnail",
      "hotmaol",
      "hotmali",
    ],
    outlook: ["outlok", "outloo", "outlooks", "putlook", "outluk", "outlok"],
    icloud: ["iclod", "iclouds", "iclould", "iclowd", "iclud", "icload"],
    protonmail: ["protonmai", "protonmial", "protonmails", "protonmal"],
    aol: ["ao1", "aoll", "alo", "aol1"],
  };

  // Check if the domain name is a typo of a common provider
  for (const [correct, typos] of Object.entries(commonProviders)) {
    if (typos.includes(domainName)) {
      return {
        isValid: false,
        message: `Did you mean ${correct}.${tld}? Please check your email address`,
      };
    }

    // Check for domains with numbers in common providers (e.g., gma2il)
    if (correct === "gmail" && /gma[0-9]/.test(domainName)) {
      return {
        isValid: false,
        message: "Did you mean gmail.com? Please check your email address",
      };
    }

    // Check for common providers with extra characters appended or inserted
    if (
      domainName.startsWith(correct) &&
      domainName !== correct &&
      domainName.length > correct.length
    ) {
      return {
        isValid: false,
        message: `Did you mean ${correct}.${tld}? Please check your email address`,
      };
    }

    // Check if domain ends with the provider name (extra chars before)
    if (
      domainName.endsWith(correct) &&
      domainName !== correct &&
      domainName.length > correct.length
    ) {
      return {
        isValid: false,
        message: `Did you mean ${correct}.${tld}? Please check your email address`,
      };
    }

    // Check if domain contains the provider name but with extra characters
    if (domainName.includes(correct) && domainName !== correct) {
      return {
        isValid: false,
        message: `Did you mean ${correct}.${tld}? Please check your email address`,
      };
    }
  }

  // Check for domains that are too long (likely spam or typo)
  if (domainName.length > 30) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  // Final comprehensive regex check
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }

  return { isValid: true, message: "" };
};

/**
 * This is my custom hook for handling all the authentication form logic
 * It takes care of form state, validation, and all the auth actions
 */
export const useAuthForm = (formType = "login", onLoginSuccess = null) => {
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

    // Validate email with comprehensive validation
    if (!formData.username?.trim()) {
      newFieldErrors.username = "Email is required";
      hasErrors = true;
    } else {
      const emailValidation = validateEmail(formData.username);
      if (!emailValidation.isValid) {
        newFieldErrors.username = emailValidation.message;
        hasErrors = true;
      }
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
        const result = await signIn(formData.username, formData.password);

        // If OTP is required, call the onLoginSuccess callback
        if (result && result.requiresOTP && onLoginSuccess) {
          await onLoginSuccess(formData.username, formData.password);
        }
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
