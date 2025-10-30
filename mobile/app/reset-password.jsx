import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { StatusBar, setStatusBarStyle } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Fonts } from '@/src/constants/Fonts';
import { firebase } from '@/src/services/firebase';
import { confirmPasswordReset } from 'firebase/auth';

const { width } = Dimensions.get('window');

export default function ResetPasswordScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const { email, resetCode } = params;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
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

  const handleResetPassword = async () => {
    // Validate fields
    if (!password.trim()) {
      setMessage("Please enter a new password");
      return;
    }

    if (!confirmPassword.trim()) {
      setMessage("Please confirm your password");
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
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Check if reset code is available
      if (!resetCode) {
        setMessage("Invalid reset session. Please start over.");
        setLoading(false);
        return;
      }

      // Confirm password reset with the reset code
      await confirmPasswordReset(firebase.auth(), resetCode, password);

      console.log('Password reset successfully!');
      
      // Show success modal
      setLoading(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.log('Error resetting password:', error.message);
      
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
      setLoading(false);
    }
  };

  const isPasswordValid = 
    passwordValidation.minLength &&
    passwordValidation.hasUppercase &&
    passwordValidation.hasNumber &&
    passwordValidation.hasSpecialChar;

  const hasPasswordError = message !== "" && !password.trim();
  const hasConfirmPasswordError = message !== "" && !confirmPassword.trim();

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
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={24} color="#1f2937" />
            </Pressable>
          </View>

          {/* Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below
            </Text>
          </View>

          {/* New Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>New Password</Text>
            <View style={[
              styles.passwordInputContainer,
              passwordFocused && styles.inputFocused,
              hasPasswordError && styles.inputError,
            ]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setMessage("");
                  validatePassword(text);
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                secureTextEntry={!showPassword}
                placeholderTextColor="#9ca3af"
                editable={!loading}
              />
              {password.length > 0 && (
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <Feather name="eye-off" size={20} color="#6b7280" />
                  ) : (
                    <Feather name="eye" size={20} color="#6b7280" />
                  )}
                </Pressable>
              )}
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={[
              styles.passwordInputContainer,
              confirmPasswordFocused && styles.inputFocused,
              hasConfirmPasswordError && styles.inputError,
            ]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setMessage("");
                }}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#9ca3af"
                editable={!loading}
              />
              {confirmPassword.length > 0 && (
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? (
                    <Feather name="eye-off" size={20} color="#6b7280" />
                  ) : (
                    <Feather name="eye" size={20} color="#6b7280" />
                  )}
                </Pressable>
              )}
            </View>
          </View>

          {/* Error Message */}
          {message && (
            <Text style={[styles.message, styles.errorMessage]}>{message}</Text>
          )}

          {/* Password Validation (show when typing password) */}
          {password.length > 0 && (
            <View style={styles.passwordValidationContainer}>
              {/* Password Strength Meter */}
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  <View
                    style={[
                      styles.passwordStrengthFill,
                      {
                        width: `${passwordStrength}%`,
                        backgroundColor: getPasswordStrengthColor(passwordStrength),
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.passwordStrengthText,
                    { color: getPasswordStrengthColor(passwordStrength) },
                  ]}
                >
                  {getPasswordStrengthText(passwordStrength)}
                </Text>
              </View>

              {/* Password Requirements */}
              <View style={styles.passwordRequirements}>
                <Text style={styles.passwordRequirementsTitle}>
                  Password Requirements:
                </Text>

                {/* Row 1: 2 items side by side */}
                <View style={styles.passwordRequirementRow}>
                  <View style={styles.passwordRequirementItem}>
                    <Text
                      style={[
                        styles.passwordRequirementText,
                        {
                          color: passwordValidation.minLength
                            ? "#16a34a"
                            : "#dc2626",
                        },
                      ]}
                    >
                      {passwordValidation.minLength ? "✓" : "✗"} At least 8 characters
                    </Text>
                  </View>

                  <View style={styles.passwordRequirementItem}>
                    <Text
                      style={[
                        styles.passwordRequirementText,
                        {
                          color: passwordValidation.hasUppercase
                            ? "#16a34a"
                            : "#dc2626",
                        },
                      ]}
                    >
                      {passwordValidation.hasUppercase ? "✓" : "✗"} One uppercase letter
                    </Text>
                  </View>
                </View>

                {/* Row 2: 2 items side by side */}
                <View style={styles.passwordRequirementRow}>
                  <View style={styles.passwordRequirementItem}>
                    <Text
                      style={[
                        styles.passwordRequirementText,
                        {
                          color: passwordValidation.hasNumber
                            ? "#16a34a"
                            : "#dc2626",
                        },
                      ]}
                    >
                      {passwordValidation.hasNumber ? "✓" : "✗"} One number
                    </Text>
                  </View>

                  <View style={styles.passwordRequirementItem}>
                    <Text
                      style={[
                        styles.passwordRequirementText,
                        {
                          color: passwordValidation.hasSpecialChar
                            ? "#16a34a"
                            : "#dc2626",
                        },
                      ]}
                    >
                      {passwordValidation.hasSpecialChar ? "✓" : "✗"} One special character
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Reset Password Button */}
          <Pressable
            style={[styles.resetButton, loading && styles.resetButtonDisabled]}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.resetButtonText}>Reset Password</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowSuccessModal(false);
          router.replace('/auth');
        }}
        statusBarTranslucent={true}
        onShow={() => setStatusBarStyle('light', true)}
        onDismiss={() => setStatusBarStyle('dark', true)}
      >
        <StatusBar style="light" animated />
        <View style={styles.modalOverlay}>
          <View style={styles.statusBarBackground} />
          <View style={styles.modalContainer}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
            </View>

            {/* Title */}
            <Text style={styles.modalTitle}>Password Reset Successful!</Text>

            {/* Message */}
            <Text style={styles.modalMessage}>
              Your password has been reset successfully. Please log in with your new password.
            </Text>

            {/* Continue Button */}
            <Pressable
              style={styles.continueButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace('/auth');
              }}
            >
              <Text style={styles.continueButtonText}>Continue to Login</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
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
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.family.bold,
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.family.regular,
    color: '#6b7280',
    lineHeight: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: Fonts.family.medium,
    color: '#374151',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingLeft: 4,
    paddingRight: 16,
    paddingVertical: 4,
    paddingBottom: 2,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: Fonts.family.regular,
    color: '#111827',
  },
  eyeButton: {
    padding: 4,
  },
  inputFocused: {
    borderColor: '#2a4eff',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
    backgroundColor: '#fef2f2',
  },
  message: {
    fontSize: 13,
    fontFamily: Fonts.family.regular,
    marginBottom: 12,
    textAlign: 'left',
  },
  errorMessage: {
    color: '#ef4444',
  },
  passwordValidationContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  passwordStrengthContainer: {
    marginBottom: 12,
  },
  passwordStrengthBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  passwordStrengthText: {
    fontSize: 14,
    fontFamily: Fonts.family.medium,
    fontWeight: '600',
  },
  passwordRequirements: {
    marginTop: 4,
  },
  passwordRequirementsTitle: {
    fontSize: 14,
    fontFamily: Fonts.family.medium,
    color: '#374151',
    marginBottom: 6,
  },
  passwordRequirementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  passwordRequirementItem: {
    flex: 1,
  },
  passwordRequirementText: {
    fontSize: 13,
    fontFamily: Fonts.family.regular,
    lineHeight: 18,
  },
  resetButton: {
    backgroundColor: '#2a4eff',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#2a4eff',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    fontSize: 16,
    fontFamily: Fonts.family.semiBold,
    color: '#ffffff',
  },
  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  statusBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#7A7A7A',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  modalTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 20,
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalMessage: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#4361EE',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    color: 'white',
  },
});

