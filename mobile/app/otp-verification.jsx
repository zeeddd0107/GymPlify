import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";
import { verifyOTP, resendOTP } from "@/src/services/otpService";
import {
  registerUser,
  generateCustomMemberId,
} from "@/src/services/authService";
import { updateProfile } from "firebase/auth";
import { firebase, firestore } from "@/src/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function OTPVerificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get params from previous screen
  const {
    email,
    password,
    name,
    otpId: initialOtpId,
    mode,
    userNotFound,
  } = params;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [otpId, setOtpId] = useState(initialOtpId);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const [hasError, setHasError] = useState(false); // Track invalid OTP input

  // Refs for input fields
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
    }, 300);
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

      // Focus last filled input or last input
      const lastFilledIndex = Math.min(pastedCode.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
      return;
    }

    // Handle single digit input
    if (/^\d$/.test(text) || text === "") {
      newOtp[index] = text;
      setOtp(newOtp);

      // Auto-focus next input
      if (text && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      setMessage("Please enter all 6 digits");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Security: If email doesn't exist, fail verification with generic message
      if (userNotFound === "true") {
        console.log("User not found - failing OTP verification for security");
        // Simulate a delay to match real verification timing
        await new Promise((resolve) => setTimeout(resolve, 500));
        throw new Error("Incorrect code. Please try again.");
      }

      // Step 1: Verify OTP
      const verifyResponse = await verifyOTP(email, otpCode, otpId, mode);

      // Step 2: If registration mode, create Firebase account NOW
      if (mode === "register" && password && name) {
        console.log("Creating Firebase account after OTP verification...");

        // Create Firebase user account
        const user = await registerUser(email, password);

        if (user) {
          // Set up user profile
          const defaultPhotoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=0D8ABC&color=fff&bold=true`;

          const profileUpdate = { displayName: name };
          if (!user.photoURL) {
            profileUpdate.photoURL = defaultPhotoURL;
          }
          await updateProfile(user, profileUpdate);

          // Reload user
          await user.reload();
          const refreshedUser = firebase.auth().currentUser;

          // Create Firestore user document with ALL fields including role
          await firestore
            .collection("users")
            .doc(refreshedUser.uid)
            .set(
              {
                uid: refreshedUser.uid,
                email: refreshedUser.email,
                displayName: name,
                name: name,
                role: "client", // Add role field here
                provider: "password",
                photoURL: refreshedUser.photoURL || defaultPhotoURL,
                qrCodeValue: refreshedUser.uid,
                customMemberId: await generateCustomMemberId(), // Generate member ID
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
                lastLogout: null,
              },
              { merge: true },
            );

          // No need for separate upsertUserInFirestore call - everything is set above

          // Store in AsyncStorage
          const userData = {
            id: refreshedUser.uid,
            email: refreshedUser.email,
            name: name,
            picture: refreshedUser.photoURL,
          };
          await AsyncStorage.setItem("@user", JSON.stringify(userData));

          console.log("Firebase account created successfully!");
        }
      }

      // Step 3: Handle forgot-password mode with reset code
      if (mode === "forgot-password" && verifyResponse.resetCode) {
        console.log(
          "Password reset code received, navigating to reset screen...",
        );

        // Navigate to reset-password screen with reset code
        router.replace({
          pathname: "/reset-password",
          params: {
            email: email,
            resetCode: verifyResponse.resetCode,
          },
        });
      } else if (mode === "forgot-password") {
        // Fallback if reset code not provided
        console.log("No reset code received, navigating without it...");
        router.replace({
          pathname: "/reset-password",
          params: { email: email },
        });
      } else {
        // Both new and existing users go to dashboard
        // Dashboard will show subscriptions with greeting if user has no active subscription
        console.log("OTP verified successfully!");
        router.replace("/(tabs)");
      }
    } catch (error) {
      // Log technical error to console only (using console.log to avoid error popup on screen)
      console.log("Verification error:", error.message);

      // Show user-friendly message on screen
      const errorMessage = error.message || "";
      let userMessage = "";

      if (errorMessage.includes("expired")) {
        userMessage = "Code has expired. Please request a new one.";
      } else if (
        errorMessage.includes("Invalid OTP") ||
        errorMessage.includes("incorrect")
      ) {
        userMessage = "Incorrect code. Please try again.";
      } else if (errorMessage.includes("attempts")) {
        userMessage = "Too many attempts. Please request a new code.";
        // Expire the timer immediately when too many attempts
        setTimeLeft(0);
        setCanResend(true);
      } else if (errorMessage.includes("not found")) {
        userMessage = "Code not found. Please request a new one.";
      } else {
        userMessage = "Verification failed. Please try again.";
      }

      // Set error state to show red borders
      setHasError(true);
      setMessage(userMessage);

      // Clear OTP inputs on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setResending(true);
    setMessage("");
    setHasError(false); // Clear error state

    try {
      // Security: If email doesn't exist, fake success but don't send OTP
      if (userNotFound === "true") {
        console.log("User not found - faking resend success for security");
        // Simulate a delay to match real resend timing
        await new Promise((resolve) => setTimeout(resolve, 800));
        setTimeLeft(300); // Reset timer
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        setMessage("New code sent successfully!");
        inputRefs.current[0]?.focus();
        setTimeout(() => setMessage(""), 3000);
        setResending(false);
        return;
      }

      const response = await resendOTP(email, otpId);
      setOtpId(response.otpId);
      setTimeLeft(300); // Reset timer to 5 minutes
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setMessage("New code sent successfully!");
      inputRefs.current[0]?.focus();

      // Clear success message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      // Log technical error to console only (using console.log to avoid error popup on screen)
      console.log("Resend error:", error.message);

      // Show user-friendly message on screen
      const errorMessage = error.message || "";
      let userMessage = "";

      if (
        errorMessage.includes("rate limit") ||
        errorMessage.includes("too many")
      ) {
        userMessage = "Please wait a moment before requesting another code.";
      } else if (errorMessage.includes("not found")) {
        userMessage = "Session expired. Please start again.";
      } else {
        userMessage = "Failed to send code. Please try again.";
      }

      setMessage(userMessage);
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#374151" />
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Feather name="mail" size={40} color="#2a4eff" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Email Verification</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          We've sent a 6-digit code to{"\n"}
          <Text style={styles.email}>{email}</Text>
        </Text>

        {/* Spam Folder Reminder */}
        <View style={styles.spamNotice}>
          <Feather name="info" size={14} color="#64748b" />
          <Text style={styles.spamNoticeText}>
            Check your spam folder if you don't see the email
          </Text>
        </View>

        {/* Security Notice (Forgot Password Only) */}
        {mode === "forgot-password" && (
          <View style={styles.securityNotice}>
            <Feather name="shield" size={14} color="#2a4eff" />
            <Text style={styles.securityNoticeText}>
              If this email is registered, you will receive a verification code
            </Text>
          </View>
        )}

        {/* OTP Input Boxes */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              style={[
                styles.otpInput,
                digit ? styles.otpInputFilled : null,
                hasError ? styles.otpInputError : null, // Red border on error
              ]}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
            />
          ))}
        </View>

        {/* Timer */}
        <Text style={styles.timer}>
          {timeLeft > 0 ? (
            <>
              Code expires in{" "}
              <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
            </>
          ) : (
            <Text style={styles.expired}>Code expired</Text>
          )}
        </Text>

        {/* Error Message */}
        {message && (
          <Text
            style={[
              styles.message,
              message.includes("success")
                ? styles.successMessage
                : styles.errorMessage,
            ]}
          >
            {message}
          </Text>
        )}

        {/* Verify Button */}
        <Pressable
          style={[styles.verifyButton, loading && styles.verifyButtonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify Code</Text>
          )}
        </Pressable>

        {/* Resend Button */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <Pressable
            onPress={handleResendOTP}
            disabled={!canResend || resending || loading}
          >
            <Text
              style={[
                styles.resendLink,
                (!canResend || resending || loading) &&
                  styles.resendLinkDisabled,
              ]}
            >
              {resending ? "Sending..." : "Resend"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    marginBottom: 60,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontFamily: Fonts.family.bold,
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    fontFamily: Fonts.family.regular,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 22,
  },
  email: {
    fontFamily: Fonts.family.semiBold,
    color: "#2a4eff",
  },
  spamNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  spamNoticeText: {
    fontSize: 13,
    fontFamily: Fonts.family.regular,
    color: "#64748b",
    flex: 1,
    lineHeight: 18,
  },
  securityNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  securityNoticeText: {
    fontSize: 13,
    fontFamily: Fonts.family.regular,
    color: "#2563eb",
    flex: 1,
    lineHeight: 18,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    fontSize: 24,
    fontFamily: Fonts.family.bold,
    color: "#1f2937",
    textAlign: "center",
    textAlignVertical: "center",
    paddingTop: 0,
    paddingBottom: 0,
  },
  otpInputFilled: {
    borderColor: "#2a4eff",
    backgroundColor: "#eff6ff",
  },
  otpInputError: {
    borderColor: "#ef4444", // Red border for invalid OTP
    backgroundColor: "#fef2f2", // Light red background
  },
  timer: {
    fontSize: 14,
    fontFamily: Fonts.family.regular,
    color: "#6b7280",
    marginBottom: 8,
  },
  timerValue: {
    fontFamily: Fonts.family.semiBold,
    color: "#2a4eff",
  },
  expired: {
    color: "#dc2626",
    fontFamily: Fonts.family.semiBold,
  },
  message: {
    fontSize: 14,
    fontFamily: Fonts.family.medium,
    textAlign: "center",
    marginBottom: 16,
  },
  errorMessage: {
    color: "#dc2626",
  },
  successMessage: {
    color: "#16a34a",
  },
  verifyButton: {
    width: "100%",
    backgroundColor: "#2a4eff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#2a4eff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontFamily: Fonts.family.bold,
  },
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    fontFamily: Fonts.family.regular,
    color: "#6b7280",
  },
  resendLink: {
    fontSize: 14,
    fontFamily: Fonts.family.bold,
    color: "#2a4eff",
  },
  resendLinkDisabled: {
    color: "#9ca3af",
  },
});
