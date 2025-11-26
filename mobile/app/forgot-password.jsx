import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";
import { sendOTP } from "@/src/services/otpService";

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);

  // Email validation function (same as auth/index.jsx)
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
      return {
        isValid: false,
        message: "Email address cannot contain multiple @ symbols",
      };
    }

    const parts = trimmedEmail.split("@");
    const localPart = parts[0];
    const domain = parts[1];

    if (!localPart || localPart.length === 0) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

    if (localPart.startsWith(".") || localPart.endsWith(".")) {
      return { isValid: false, message: "Invalid email format" };
    }

    if (/\.\./.test(localPart)) {
      return { isValid: false, message: "Invalid email format" };
    }

    if (!/^[a-zA-Z0-9._+-]+$/.test(localPart)) {
      return {
        isValid: false,
        message: "Email address contains invalid characters",
      };
    }

    if (!domain || domain.length === 0) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

    if (!domain.includes(".")) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

    if (domain.startsWith(".") || domain.endsWith(".")) {
      return { isValid: false, message: "Invalid email format" };
    }

    if (/\.\./.test(domain)) {
      return { isValid: false, message: "Invalid email format" };
    }

    if (domain.startsWith("-") || domain.endsWith("-")) {
      return { isValid: false, message: "Invalid email format" };
    }

    const domainParts = domain.split(".");

    for (const part of domainParts) {
      if (!part || part.length === 0) {
        return {
          isValid: false,
          message: "Please enter a valid email address",
        };
      }

      if (!/^[a-zA-Z0-9-]+$/.test(part)) {
        return { isValid: false, message: "Invalid email format" };
      }

      if (part.startsWith("-") || part.endsWith("-")) {
        return { isValid: false, message: "Invalid email format" };
      }
    }

    const tld = domainParts[domainParts.length - 1].toLowerCase();
    if (tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

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

    const domainName =
      domainParts.length >= 2
        ? domainParts[domainParts.length - 2].toLowerCase()
        : "";

    if (domainName.length < 2) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

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

    for (const [correct, typos] of Object.entries(commonProviders)) {
      if (typos.includes(domainName)) {
        return {
          isValid: false,
          message: `Did you mean ${correct}.${tld}? Please check your email address`,
        };
      }

      if (correct === "gmail" && /gma[0-9]/.test(domainName)) {
        return {
          isValid: false,
          message: "Did you mean gmail.com? Please check your email address",
        };
      }

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

      if (domainName.includes(correct) && domainName !== correct) {
        return {
          isValid: false,
          message: `Did you mean ${correct}.${tld}? Please check your email address`,
        };
      }
    }

    if (domainName.length > 30) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }

    return { isValid: true, message: "" };
  };

  const handleSendOTP = async () => {
    if (!email.trim()) {
      setMessage("Please enter your email address");
      return;
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setMessage(emailValidation.message);
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Send OTP (Cloud Function will verify user exists)
      console.log("Sending OTP to:", email);
      const otpResponse = await sendOTP(email.trim(), "forgot-password");
      console.log("OTP sent successfully:", otpResponse);

      setLoading(false);

      // Always navigate to OTP screen (even if email doesn't exist)
      // This prevents user enumeration through behavior differences
      router.push({
        pathname: "/otp-verification",
        params: {
          email: email.trim(),
          otpId: otpResponse.otpId,
          expiresAt: otpResponse.expiresAt,
          mode: "forgot-password",
          userNotFound: otpResponse.userNotFound ? "true" : "false", // Pass flag but maintain same flow
        },
      });
    } catch (error) {
      console.log("Error sending OTP:", error.message);
      setMessage(
        error.message || "Failed to send verification code. Please try again.",
      );
      setLoading(false);
    }
  };

  const hasError =
    message !== "" &&
    (!email.trim() ||
      message.toLowerCase().includes("email") ||
      message.includes("@") ||
      message.toLowerCase().includes("invalid"));

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.content, { paddingTop: insets.top + 20 }]}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="#1f2937" />
            </Pressable>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a verification code to
              reset your password
            </Text>
          </View>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email address</Text>
            <TextInput
              style={[
                styles.input,
                emailFocused && styles.inputFocused,
                hasError && styles.inputError,
              ]}
              placeholder="name@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setMessage("");
              }}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#9ca3af"
              editable={!loading}
            />
          </View>

          {/* Error Message */}
          {message && (
            <Text style={[styles.message, styles.errorMessage]}>{message}</Text>
          )}

          {/* Send Code Button */}
          <Pressable
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.sendButtonText}>Send Verification Code</Text>
            )}
          </Pressable>

          {/* Back to Login */}
          <View style={styles.backToLoginContainer}>
            <Text style={styles.backToLoginText}>Remember your password? </Text>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.backToLoginLink}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.family.bold,
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.family.regular,
    color: "#6b7280",
    lineHeight: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: Fonts.family.medium,
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    fontSize: 16,
    color: "#111827",
    fontFamily: Fonts.family.regular,
  },
  inputFocused: {
    borderColor: "#2a4eff",
    borderWidth: 2,
  },
  inputError: {
    borderColor: "#ef4444",
    borderWidth: 2,
    backgroundColor: "#fef2f2",
  },
  message: {
    fontSize: 13,
    fontFamily: Fonts.family.regular,
    marginBottom: 12,
    textAlign: "left",
  },
  errorMessage: {
    color: "#ef4444",
  },
  sendButton: {
    backgroundColor: "#2a4eff",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowColor: "#2a4eff",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: Fonts.family.semiBold,
    color: "#ffffff",
  },
  backToLoginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  backToLoginText: {
    fontSize: 16,
    fontFamily: Fonts.family.regular,
    color: "#6b7280",
  },
  backToLoginLink: {
    fontSize: 16,
    fontFamily: Fonts.family.semiBold,
    color: "#2a4eff",
  },
});
