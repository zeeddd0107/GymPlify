import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";

// OTP ENABLED - Users must verify OTP before registration and login
// OTP bypass code is commented out but preserved for easy disabling
import { StatusBar, setStatusBarStyle } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  loginUser,
  registerUser,
  upsertUserInFirestore,
  generateCustomMemberId,
} from "@/src/services/authService";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from "expo-auth-session";
import { firebase, firestore } from "@/src/services/firebase";
import { Feather } from "@expo/vector-icons";
import { updateProfile } from "firebase/auth";
import { Fonts } from "@/src/constants/Fonts";
import Logger from "@/src/utils/logger";
import { sendOTP } from "@/src/services/otpService";
import { checkLoginAttempts, recordLoginAttempt } from "@/src/services/loginAttemptsService";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  Logger.render("AuthScreen", "Component rendered");

  // Track component lifecycle
  useEffect(() => {
    Logger.render("AuthScreen", "Component mounted");
    return () => {
      Logger.render("AuthScreen", "Component unmounting");
    };
  }, []);

  // Ensure status bar is always black on Sign In screen
  useEffect(() => {
    setStatusBarStyle("dark", true);
  }, []);
  
  // Blinking red border animation for password validation error
  useEffect(() => {
    if (showPasswordError) {
      
      // Stop any existing animation
      if (animationRef.current) {
        animationRef.current.stop();
      }
      
      // Reset to initial state
      borderColorAnim.setValue(0);
      
      // Start blinking animation
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(borderColorAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
          }),
          Animated.timing(borderColorAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: false,
          }),
        ]),
        { iterations: 3 } // Blink 3 times
      );
      
      animationRef.current.start(() => {
        setShowPasswordError(false);
        borderColorAnim.setValue(0);
        animationRef.current = null;
      });
    }
    
    return () => {
      // Cleanup: stop animation if component unmounts
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [showPasswordError]);

  // --- STATE MANAGEMENT ---
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState("login"); // Controls 'login' or 'register' mode
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // For displaying errors or success messages
  const [loading, setLoading] = useState(false); // Controls loading spinner
  const [, setUserInfo] = useState(null); // To store user info after login
  const [showPassword, setShowPassword] = useState(false); // Toggles password visibility
  const router = useRouter(); // For navigation
  const [name, setName] = useState(""); // Add name state
  
  // Focus states for input highlighting
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  
  // State for password validation error animation
  const [showPasswordError, setShowPasswordError] = useState(false);
  const borderColorAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef(null);
  
  // Function to trigger the blinking animation directly
  const triggerPasswordErrorAnimation = () => {
    // Stop any existing animation
    if (animationRef.current) {
      animationRef.current.stop();
    }
    
    // Reset to initial state
    borderColorAnim.setValue(0);
    setShowPasswordError(true);
    
    // Start blinking animation
    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(borderColorAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: false,
        }),
        Animated.timing(borderColorAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]),
      { iterations: 3 } // Blink 3 times
    );
    
    animationRef.current.start(() => {
      setShowPasswordError(false);
      borderColorAnim.setValue(0);
      animationRef.current = null;
    });
  };

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
    noPersonalData: false,
    notWeakPassword: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Email validation function
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
      return { isValid: false, message: "Email address cannot contain multiple @ symbols" };
    }
    
    // Split into local and domain parts
    const parts = trimmedEmail.split('@');
    const localPart = parts[0];
    const domain = parts[1];
    
    // Validate local part (before @)
    if (!localPart || localPart.length === 0) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
    
    // Local part cannot start or end with a dot
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return { isValid: false, message: "Invalid email format" };
    }
    
    // Local part cannot have consecutive dots
    if (/\.\./.test(localPart)) {
      return { isValid: false, message: "Invalid email format" };
    }
    
    // Local part should contain valid characters (letters, numbers, and some special chars)
    if (!/^[a-zA-Z0-9._+\-]+$/.test(localPart)) {
      return { isValid: false, message: "Email address contains invalid characters" };
    }
    
    // Validate domain part (after @)
    if (!domain || domain.length === 0) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
    
    // Domain must contain at least one dot
    if (!domain.includes('.')) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
    
    // Domain cannot start or end with a dot
    if (domain.startsWith('.') || domain.endsWith('.')) {
      return { isValid: false, message: "Invalid email format" };
    }
    
    // Domain cannot have consecutive dots
    if (/\.\./.test(domain)) {
      return { isValid: false, message: "Invalid email format" };
    }
    
    // Domain cannot start or end with a hyphen
    if (domain.startsWith('-') || domain.endsWith('-')) {
      return { isValid: false, message: "Invalid email format" };
    }
    
    // Split domain into parts (subdomain.domain.tld)
    const domainParts = domain.split('.');
    
    // Each domain part must be valid
    for (const part of domainParts) {
      // Domain part cannot be empty
      if (!part || part.length === 0) {
        return { isValid: false, message: "Please enter a valid email address" };
      }
      
      // Domain part should only contain letters, numbers, and hyphens
      if (!/^[a-zA-Z0-9\-]+$/.test(part)) {
        return { isValid: false, message: "Invalid email format" };
      }
      
      // Domain part cannot start or end with hyphen
      if (part.startsWith('-') || part.endsWith('-')) {
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
      'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
      'co', 'uk', 'us', 'ca', 'au', 'de', 'fr', 'it', 'es', 'nl', 'be', 'ch', 'at',
      'se', 'no', 'dk', 'fi', 'jp', 'cn', 'in', 'br', 'mx', 'ru', 'kr', 'tw', 'sg',
      'hk', 'nz', 'za', 'ae', 'sa', 'eg', 'il', 'tr', 'pl', 'cz', 'ie', 'pt', 'gr',
      'io', 'ai', 'app', 'dev', 'tech', 'online', 'site', 'website', 'store', 'shop',
      'info', 'biz', 'me', 'tv', 'cc', 'ws', 'mobi', 'name', 'pro', 'tel', 'travel',
      'jobs', 'cat', 'asia', 'eu', 'ph', 'my', 'id', 'vn', 'th', 'pk', 'bd', 'lk'
    ];
    
    if (!validTLDs.includes(tld)) {
      return { isValid: false, message: "Please enter a valid email address with a recognized domain" };
    }
    
    // Get the main domain name (second to last part)
    const domainName = domainParts.length >= 2 ? domainParts[domainParts.length - 2].toLowerCase() : '';
    
    // Domain name must be at least 2 characters
    if (domainName.length < 2) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
    
    // Check for common email provider typos
    const commonProviders = {
      'gmail': ['gmai', 'gmial', 'gmaill', 'gmails', 'gma1l', 'gma2l', 'gma3l', 'gma4l', 'gma5l', 
                'gma6l', 'gma7l', 'gma8l', 'gma9l', 'gmali', 'gmsil', 'gnail', 'gail', 'gmai1', 
                'gmial', 'gmal', 'gmaol', 'gmaul'],
      'yahoo': ['yaho', 'yahooo', 'yahoos', 'yshoo', 'yhoo', 'yaoo', 'yahho', 'yahu'],
      'hotmail': ['hotmai', 'hotmal', 'hotmial', 'hotmails', 'hotmil', 'hotnail', 'hotmaol', 'hotmali'],
      'outlook': ['outlok', 'outloo', 'outlooks', 'putlook', 'outluk', 'outlok'],
      'icloud': ['iclod', 'iclouds', 'iclould', 'iclowd', 'iclud', 'icload'],
      'protonmail': ['protonmai', 'protonmial', 'protonmails', 'protonmal'],
      'aol': ['ao1', 'aoll', 'alo', 'aol1'],
    };
    
    // Check if the domain name is a typo of a common provider
    for (const [correct, typos] of Object.entries(commonProviders)) {
      if (typos.includes(domainName)) {
        return { isValid: false, message: `Did you mean ${correct}.${tld}? Please check your email address` };
      }
      
      // Check for domains with numbers in common providers (e.g., gma2il)
      if (correct === 'gmail' && /gma[0-9]/.test(domainName)) {
        return { isValid: false, message: "Did you mean gmail.com? Please check your email address" };
      }
      
      // Check for common providers with extra characters appended or inserted
      // This catches: gmails, gmailsjds, gmailxyz, etc.
      if (domainName.startsWith(correct) && domainName !== correct && domainName.length > correct.length) {
        return { isValid: false, message: `Did you mean ${correct}.${tld}? Please check your email address` };
      }
      
      // Check if domain ends with the provider name (extra chars before)
      // This catches: ggmail, xgmail, 123gmail, etc.
      if (domainName.endsWith(correct) && domainName !== correct && domainName.length > correct.length) {
        return { isValid: false, message: `Did you mean ${correct}.${tld}? Please check your email address` };
      }
      
      // Check if domain contains the provider name but with extra characters
      // This catches: gmials, hotmails, yahoos, etc.
      if (domainName.includes(correct) && domainName !== correct) {
        return { isValid: false, message: `Did you mean ${correct}.${tld}? Please check your email address` };
      }
    }
    
    // Check for domains that are too long (likely spam or typo)
    if (domainName.length > 30) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
    
    // Final comprehensive regex check
    const emailRegex = /^[a-zA-Z0-9._+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, message: "Please enter a valid email address" };
    }
    
    return { isValid: true, message: "" };
  };

  // Password validation functions
  const validatePassword = (password, email, name) => {
    const validation = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      noPersonalData:
        !password
          .toLowerCase()
          .includes(email?.toLowerCase().split("@")[0] || "") &&
        !password.toLowerCase().includes(name?.toLowerCase() || ""),
      notWeakPassword: !isWeakPassword(password),
    };

    setPasswordValidation(validation);

    // Calculate password strength (0-100)
    const validCount = Object.values(validation).filter(Boolean).length;
    const strength = Math.round((validCount / 7) * 100);
    setPasswordStrength(strength);

    return validation;
  };

  const isWeakPassword = (password) => {
    const weakPasswords = [
      "password",
      "123456",
      "123456789",
      "qwerty",
      "abc123",
      "password123",
      "admin",
      "letmein",
      "welcome",
      "monkey",
      "1234567890",
      "password1",
      "qwerty123",
      "dragon",
      "master",
      "hello",
      "freedom",
      "whatever",
      "qazwsx",
      "trustno1",
      "654321",
      "jordan23",
      "harley",
      "password1",
      "shadow",
      "superman",
      "qazwsx",
      "michael",
      "football",
      "jordan",
      "hunter",
      "purple",
      "soccer",
      "summer",
      "orange",
      "princess",
      "dragon",
      "passw0rd",
      "master",
      "hello",
      "freedom",
      "whatever",
    ];

    return weakPasswords.includes(password.toLowerCase());
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength < 30) return "#dc2626"; // Red
    if (strength < 60) return "#f59e0b"; // Orange
    if (strength < 80) return "#eab308"; // Yellow
    return "#16a34a"; // Green
  };

  const getPasswordStrengthText = (strength) => {
    if (strength < 30) return "Weak";
    if (strength < 60) return "Fair";
    if (strength < 80) return "Good";
    return "Strong";
  };

  // --- GOOGLE AUTHENTICATION HOOK ---
  const [_, response, promptAsync] = Google.useAuthRequest({
    androidClientId:
      "792567912347-q242e9l92m353hu4h07f4dm5hpvbjdal.apps.googleusercontent.com",
    iosClientId:
      "792567912347-942835ebp1tv39tsj52s0s93tlaou44a.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({
      native: "com.zeeeddd.mobile:/oauthredirect",
    }),
    scopes: ["openid", "profile", "email"],
  });

  // --- EFFECT HOOKS ---
  // Listens for a successful response from Google's auth session
  useEffect(() => {
    if (response?.type === "success" && response.authentication?.accessToken) {
      getUserInfo(response.authentication.accessToken);
    }
  }, [response, getUserInfo]);

  // --- ERROR HANDLING ---
  // Maps Firebase error codes to user-friendly messages
  const getFriendlyErrorMessage = (error, lockoutInfo = null, remainingAttempts = null) => {
    const errorCode = error.code || "";
    const errorMessage = error.message || "";

    // Account Lockout Errors
    if (errorMessage.includes("account is locked") || (lockoutInfo && lockoutInfo.isLockedOut)) {
      const minutes = lockoutInfo?.lockedUntilMinutes || 15;
      return `Too many failed login attempts. Your account is locked for ${minutes} minute${minutes > 1 ? 's' : ''}. Please try again later.`;
    }

    // Login/Sign In Errors (with remaining attempts)
    if (errorCode === "auth/invalid-credential" || errorCode === "auth/invalid-login-credentials") {
      console.log(" [getFriendlyErrorMessage] invalid-credential, remainingAttempts:", remainingAttempts);
      // Show remaining attempts from 2nd failed attempt onwards (add 1 to show attempts including current)
      if (remainingAttempts !== null && remainingAttempts !== undefined && remainingAttempts >= 0 && remainingAttempts <= 2) {
        const displayAttempts = remainingAttempts + 1; // Show including current attempt
        console.log(" [getFriendlyErrorMessage] displayAttempts:", displayAttempts);
        const attemptText = displayAttempts === 1 ? "attempt" : "attempts";
        const attemptWord = displayAttempts === 3 ? "Three" : 
                           displayAttempts === 2 ? "Two" : 
                           displayAttempts === 1 ? "One" : displayAttempts;
        
        // If only one attempt left, show with warning context
        if (displayAttempts === 1) {
          console.log(" [getFriendlyErrorMessage] Returning: Last attempt warning");
          return `Incorrect credentials. ${attemptWord} ${attemptText} left before your account is locked.`;
        }
        console.log(" [getFriendlyErrorMessage] Returning with count:", `${attemptWord} ${attemptText} left`);
        return `Incorrect email or password. ${attemptWord} ${attemptText} left.`;
      }
      console.log(" [getFriendlyErrorMessage] No remainingAttempts, returning default");
      return "Incorrect email or password. Please try again.";
    }
    if (errorCode === "auth/user-not-found") {
      // Show remaining attempts from 2nd failed attempt onwards (add 1 to show attempts including current)
      if (remainingAttempts !== null && remainingAttempts !== undefined && remainingAttempts >= 0 && remainingAttempts <= 2) {
        const displayAttempts = remainingAttempts + 1;
        const attemptText = displayAttempts === 1 ? "attempt" : "attempts";
        const attemptWord = displayAttempts === 3 ? "Three" : 
                           displayAttempts === 2 ? "Two" : 
                           displayAttempts === 1 ? "One" : displayAttempts;
        
        // If only one attempt left, show with warning context
        if (displayAttempts === 1) {
          return `Incorrect email or password. ${attemptWord} ${attemptText} left before your account is locked.`;
        }
        return `Incorrect email or password. ${attemptWord} ${attemptText} left.`;
      }
      return "Incorrect email or password. Please try again.";
    }
    if (errorCode === "auth/wrong-password") {
      // Show remaining attempts from 2nd failed attempt onwards (add 1 to show attempts including current)
      if (remainingAttempts !== null && remainingAttempts !== undefined && remainingAttempts >= 0 && remainingAttempts <= 2) {
        const displayAttempts = remainingAttempts + 1;
        const attemptText = displayAttempts === 1 ? "attempt" : "attempts";
        const attemptWord = displayAttempts === 3 ? "Three" : 
                           displayAttempts === 2 ? "Two" : 
                           displayAttempts === 1 ? "One" : displayAttempts;
        
        // If only one attempt left, show with warning context
        if (displayAttempts === 1) {
          return `Incorrect email or password. ${attemptWord} ${attemptText} left before your account is locked.`;
        }
        return `Incorrect email or password. ${attemptWord} ${attemptText} left.`;
      }
      return "Incorrect email or password. Please try again.";
    }
    if (errorCode === "auth/user-disabled") {
      return "This account has been disabled. Contact support.";
    }
    if (errorCode === "auth/too-many-requests") {
      return "Too many failed attempts. Please try again later.";
    }
    if (errorCode === "auth/network-request-failed") {
      return "Network error. Please check your connection.";
    }
    if (errorCode === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }

    // Registration Errors
    if (errorCode === "auth/email-already-in-use") {
      return "This email is already registered. Try signing in.";
    }
    if (errorCode === "auth/weak-password") {
      return "Password is too weak. Please use a stronger password.";
    }
    if (errorCode === "auth/operation-not-allowed") {
      return "Registration is currently unavailable. Try again later.";
    }

    // OTP/Network Errors
    if (errorMessage.includes("Network error")) {
      return "Network error. Please check your connection.";
    }
    if (errorMessage.includes("Failed to send OTP")) {
      return "Unable to send verification code. Please try again.";
    }

    // Generic fallback
    return "Something went wrong. Please try again.";
  };

  // --- AUTHENTICATION LOGIC ---
  // Handles the entire Google sign-in process after getting the token
  const getUserInfo = useCallback(
    async (token) => {
      if (!token) return;
      Logger.auth("Google authentication started");
      try {
        // Sign in to Firebase with the Google credential
        const credential = firebase.auth.GoogleAuthProvider.credential(
          null,
          token,
        );
        await firebase.auth().signInWithCredential(credential);
        Logger.auth("Google Firebase authentication successful");

        // Create or update the user in Firestore with ALL fields
        const fbUser = firebase.auth().currentUser;
        if (fbUser) {
          // Create comprehensive user document with all fields like email/password users
          const userRef = firestore.collection('users').doc(fbUser.uid);
          const userSnap = await userRef.get();
          
          if (!userSnap.exists) {
            // New Google user - create complete document
            const customMemberId = await generateCustomMemberId();
            await userRef.set({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              name: fbUser.displayName,
              role: "client",
              provider: "google",
              photoURL: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || fbUser.email)}&background=0D8ABC&color=fff&bold=true`,
              qrCodeValue: fbUser.uid,
              customMemberId: customMemberId,
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
              lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
              lastLogout: null,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('New Google user document created with all fields');
          } else {
            // Existing Google user - update with missing fields
            const existingData = userSnap.data();
            const updateData = {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              name: fbUser.displayName,
              role: "client",
              provider: "google",
              photoURL: fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(fbUser.displayName || fbUser.email)}&background=0D8ABC&color=fff&bold=true`,
              qrCodeValue: existingData.qrCodeValue || fbUser.uid,
              customMemberId: existingData.customMemberId || await generateCustomMemberId(),
              lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
              lastLogout: existingData.lastLogout || null,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // Only add createdAt if it doesn't exist
            if (!existingData.createdAt) {
              updateData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
              console.log('Adding missing createdAt field for existing Google user');
            }
            
            await userRef.set(updateData, { merge: true });
            console.log('Existing Google user document updated with missing fields');
          }
          
          // Store user data on the device for local access
          const userData = {
            id: fbUser.uid,
            email: fbUser.email,
            name: fbUser.displayName,
            picture: fbUser.photoURL,
          };
          await AsyncStorage.setItem("@user", JSON.stringify(userData));
          setUserInfo(userData);
        }
        // Navigate to home screen
        Logger.auth("Google authentication complete, navigating to dashboard");
        try {
          router.replace("/(tabs)");
        } catch (navError) {
          console.log("Navigation error:", navError.message || "Unknown error");
          // Fallback navigation
          router.push("/(tabs)");
        }
      } catch (error) {
        // Log to console for developers (string only, not error object)
        console.log("Error in Google authentication:", error.code || error.message || "Unknown error");
        const friendlyMessage = getFriendlyErrorMessage(error);
        setMessage(friendlyMessage);
      }
    },
    [router, setUserInfo, setMessage],
  );

  // Handles email/password login and registration
  const handleAuth = async () => {
    Logger.auth(`handleAuth called - mode: ${mode}`);
    setLoading(true);
    setMessage("");
    try {
      let user;
      if (mode === "register") {
        // Require name during registration
        if (!name || !name.trim()) {
          setMessage("Please enter your name.");
          setLoading(false);
          return;
        }

        // Validate email format
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
          setMessage(emailValidation.message);
          setLoading(false);
          return;
        }

        // Validate password requirements (only the 4 displayed ones)
        const validation = validatePassword(password, email, name);
        const requiredChecks = [
          validation.minLength,        // At least 8 characters
          validation.hasUppercase,     // One uppercase letter (A-Z)
          validation.hasNumber,        // One number (0-9)
          validation.hasSpecialChar,   // One special character (@#$%)
        ];
        const allRequirementsMet = requiredChecks.every(Boolean);

        if (!allRequirementsMet) {
          // Don't show error message - visual indicators (✓/✗) are enough
          setLoading(false);
          return;
        }

        // Send OTP FIRST (before creating Firebase account)
        Logger.auth("Sending OTP for registration");
        console.log("Sending OTP to:", email);
        const otpResponse = await sendOTP(email);
        console.log("OTP sent successfully:", otpResponse);
        
        // Navigate to OTP verification screen with registration data
        Logger.auth("Navigating to OTP verification");
        setLoading(false);
        router.push({
          pathname: "/otp-verification",
          params: {
            email: email,
            password: password, // Pass password for account creation after OTP verification
            name: name, // Pass name for profile setup
            otpId: otpResponse.otpId,
            expiresAt: otpResponse.expiresAt,
            mode: "register",
          },
        });
        console.log("Navigated to OTP verification screen");
        return;

        // OTP BYPASS - Direct registration without OTP verification (DISABLED)
        // DIRECT REGISTRATION - Create account immediately
        // Logger.auth("Creating Firebase account directly (OTP disabled)");
        // user = await registerUser(email, password);
        // 
        // if (user) {
        //   // Set up user profile
        //   const defaultPhotoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=0D8ABC&color=fff&bold=true`;
        //   
        //   const profileUpdate = { displayName: name };
        //   if (!user.photoURL) {
        //     profileUpdate.photoURL = defaultPhotoURL;
        //   }
        //   await updateProfile(user, profileUpdate);
        //   
        //   // Reload user
        //   await user.reload();
        //   const refreshedUser = firebase.auth().currentUser;
        //   
        //   // Create Firestore user document with ALL fields including role
        //   await firestore
        //     .collection('users')
        //     .doc(refreshedUser.uid)
        //     .set(
        //       {
        //         uid: refreshedUser.uid,
        //         email: refreshedUser.email,
        //         displayName: name,
        //         name: name,
        //         role: "client", // Add role field here
        //         provider: "password",
        //         photoURL: refreshedUser.photoURL || defaultPhotoURL,
        //         qrCodeValue: refreshedUser.uid,
        //         customMemberId: await generateCustomMemberId(), // Generate member ID
        //         createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        //         lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        //         lastLogout: null
        //       },
        //       { merge: true }
        //     );
        //   
        //   // No need for separate upsertUserInFirestore call - everything is set above
        //   
        //   // Store in AsyncStorage
        //   const userData = {
        //     id: refreshedUser.uid,
        //     email: refreshedUser.email,
        //     name: name,
        //     picture: refreshedUser.photoURL,
        //   };
        //   await AsyncStorage.setItem('@user', JSON.stringify(userData));
        //   
        //   console.log('✅ Firebase account created successfully!');
        // }
        // 
        // // Navigate directly to dashboard
        // Logger.auth("Navigating to dashboard (OTP bypassed)");
        // setLoading(false);
        // router.replace('/(tabs)');
        // return;
      } else {
        Logger.auth("Starting login process");
        
        // Validate email format
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
          setMessage(emailValidation.message);
          setLoading(false);
          return;
        }
        
        // Check if account is locked due to failed login attempts
        console.log(" Checking login attempts for:", email);
        const lockoutStatus = await checkLoginAttempts(email);
        console.log(" Lockout status:", lockoutStatus);
        
        if (lockoutStatus.isLockedOut) {
          console.log("Account is locked");
          setMessage(getFriendlyErrorMessage({ message: "account is locked" }, lockoutStatus));
        setLoading(false);
        return;
        }
        
        // Attempt login
        try {
        user = await loginUser(email, password);
          
          // Login successful - record success and clear attempts
          console.log("Login successful, recording success");
          await recordLoginAttempt(email, true);
          
        if (user && !user.photoURL) {
          const defaultPhotoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=0D8ABC&color=fff&bold=true`;
          await updateProfile(user, { photoURL: defaultPhotoURL });
          await user.reload();
          const refreshed = firebase.auth().currentUser;
          await firestore
            .collection("users")
            .doc(refreshed.uid)
            .set(
              { photoURL: refreshed.photoURL || defaultPhotoURL },
              { merge: true },
            );
          await upsertUserInFirestore(refreshed, "password");
        }
          
          // Send OTP for login verification
          Logger.auth("Sending OTP for login");
          const otpResponse = await sendOTP(email);
          
          // Navigate to OTP verification screen
          Logger.auth("Navigating to OTP verification");
          setLoading(false);
          router.push({
            pathname: "/otp-verification",
            params: {
              email: email,
              otpId: otpResponse.otpId,
              expiresAt: otpResponse.expiresAt,
              mode: "login",
            },
          });
          return;

          // OTP BYPASS - Direct login without OTP verification (DISABLED)
          // DIRECT LOGIN - Navigate to dashboard immediately
          // Logger.auth("Login successful, navigating to dashboard (OTP bypassed)");
          // setLoading(false);
          // router.replace('/(tabs)');
          // return;
        } catch (loginError) {
          // Login failed - record failed attempt
          console.log("Login failed, recording failed attempt");
          const attemptResult = await recordLoginAttempt(email, false);
          console.log(" Attempt result:", attemptResult);
          console.log(" Remaining attempts from result:", attemptResult?.remainingAttempts);
          
          // Store remaining attempts for error message
          loginError.remainingAttempts = attemptResult?.remainingAttempts;
          console.log(" Stored in loginError.remainingAttempts:", loginError.remainingAttempts);
          
          // Re-throw the error to be handled by the outer catch block
          throw loginError;
        }
      }
    } catch (err) {
      // Log to console for developers only (string only, not error object)
      console.log("Authentication error:", err.code || err.message || "Unknown error");
      console.log(" err.remainingAttempts before getFriendlyErrorMessage:", err.remainingAttempts);
      
      // Show user-friendly error message to user (with remaining attempts if available)
      const friendlyMessage = getFriendlyErrorMessage(err, null, err.remainingAttempts);
      console.log(" Friendly message generated:", friendlyMessage);
      setMessage(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- UI RENDER FUNCTIONS ---
  // Renders the email input field to avoid duplicationimage.png
  const renderEmailInput = () => {
    // Red border if: field is empty OR email format is invalid
    const hasError = message !== "" && (
      !email.trim() || 
      message.toLowerCase().includes("email") || 
      message.includes("@") ||
      message.toLowerCase().includes("invalid")
    );
    return (
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
            setMessage(""); // Clear error when user starts typing
          }}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
      autoCapitalize="none"
      keyboardType="email-address"
          placeholderTextColor="#9ca3af"
    />
      </View>
  );
  };

  // Renders the main action button (Login/Create account) to avoid duplication
  const renderAuthButton = () => {
    // Check if all 4 password requirements are met (for registration only)
    const isPasswordValid = mode === "login" || (
      passwordValidation.minLength &&
      passwordValidation.hasUppercase &&
      passwordValidation.hasNumber &&
      passwordValidation.hasSpecialChar
    );
    
    return (
        <Pressable
        style={styles.loginButton}
        onPress={() => {
          // Check for empty fields in register mode
          if (mode === "register") {
            // Count empty fields
            const emptyFields = [];
            if (!name.trim()) emptyFields.push("name");
            if (!email.trim()) emptyFields.push("email");
            if (!password.trim()) emptyFields.push("password");
            
            // If 2 or more fields are empty
            if (emptyFields.length >= 2) {
              setMessage("All fields are required");
              return;
            }
            
            // If only 1 field is empty, mention that specific field
            if (!name.trim()) {
              setMessage("Full Name is required");
              return;
            }
            if (!email.trim()) {
              setMessage("Email address is required");
              return;
            }
            if (!password.trim()) {
              setMessage("Password is required");
              return;
            }
            
            // Validate email format (only if not empty)
            const emailValidation = validateEmail(email);
            if (!emailValidation.isValid) {
              setMessage(emailValidation.message);
              return;
            }
          }
          
          // Check for empty email and password in login mode
          if (mode === "login") {
            // Count empty fields
            const emptyFields = [];
            if (!email.trim()) emptyFields.push("email");
            if (!password.trim()) emptyFields.push("password");
            
            // If both fields are empty
            if (emptyFields.length >= 2) {
              setMessage("All fields are required");
              return;
            }
            
            // If only 1 field is empty, mention that specific field
            if (!email.trim()) {
              setMessage("Email address is required");
              return;
            }
            if (!password.trim()) {
              setMessage("Password is required");
              return;
            }
            
            // Validate email format (only if not empty)
            const emailValidation = validateEmail(email);
            if (!emailValidation.isValid) {
              setMessage(emailValidation.message);
              return;
            }
          }
          
          // Block registration if password requirements aren't met
          if (mode === "register" && !isPasswordValid) {
            triggerPasswordErrorAnimation(); // Trigger red blinking border directly
            return; // Do nothing - requirements must be met
          }
          if (!loading) {
            handleAuth();
          }
        }}
        >
          <Text style={styles.loginButtonText}>
          {mode === "login" ? "Login" : "Create account"}
          </Text>
        </Pressable>
    );
  };

  // --- MAIN RENDER ---
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[styles.keyboardView, { paddingTop: insets.top + 40 }]}
      >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : (
        <>
          {/* Page Title and Subtitle */}
          <Text style={[styles.loginTitle, mode === "register" && { marginTop: -10 }]}>
            {mode === "login" ? "Hi, Welcome Back!" : "Create Account"}
          </Text>
          <Text style={styles.loginSubtitle}>
            {mode === "login"
              ? "Please login to your account."
              : "Sign up to get started with GymPlify"}
          </Text>

          {/* Name Input (Registration only) */}
          {mode === "register" && (
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
                style={[
                  styles.input,
                  nameFocused && styles.inputFocused,
                  message !== "" && !name.trim() && styles.inputError, // Only red if this field is empty
                ]}
                placeholder="John Doe"
              value={name}
                onChangeText={(text) => {
                  setName(text);
                  setMessage("");
                }}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              autoCapitalize="words"
                placeholderTextColor="#9ca3af"
            />
            </View>
          )}

          {/* Email Input */}
          {renderEmailInput()}

          {/* Password Input with Eye Icon (for both modes) */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.passwordInputContainer}>
            <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  passwordFocused && styles.inputFocused,
                  message !== "" && !password.trim() && styles.inputError, // Only red if this field is empty
                ]}
                placeholder="Enter your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                  setMessage("");
                  // Clear error animation when user types
                  if (showPasswordError || animationRef.current) {
                    if (animationRef.current) {
                      animationRef.current.stop();
                      animationRef.current = null;
                    }
                    borderColorAnim.setValue(0);
                    setShowPasswordError(false);
                  }
                if (mode === "register") {
                  validatePassword(text, email, name);
                }
              }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              secureTextEntry={!showPassword}
                placeholderTextColor="#9ca3af"
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

          {/* Error Message - Shows between password and validation container */}
          {message && (
            <Text style={[styles.message, styles.errorMessage]}>{message}</Text>
          )}

          {/* Password Validation (Registration only) */}
          {mode === "register" && password.length > 0 && (
            <Animated.View 
              style={[
                {
                  marginTop: 0,
                  padding: 12,
                  backgroundColor: showPasswordError ? "#fff5f5" : "#f8f9fa", // Light red when error
                  borderRadius: 8,
                  borderWidth: 2, // Keep border width constant
                },
                {
                  borderColor: borderColorAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['#e5e7eb', '#ef4444'] // Gray to Red - only animate color
                  }),
                }
              ]}
            >
              {/* Password Strength Meter */}
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  <View
                    style={[
                      styles.passwordStrengthFill,
                      {
                        width: `${passwordStrength}%`,
                        backgroundColor:
                          getPasswordStrengthColor(passwordStrength),
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
            </Animated.View>
          )}

          {mode === "register" && <View style={{ marginTop: 18 }} />}

          {/* Forgot Password (Login only) */}
          {mode === "login" && (
            <Pressable style={styles.forgotPassword} onPress={() => router.push('/forgot-password')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </Pressable>
          )}

          {/* Main Action Button */}
          {renderAuthButton()}

          {/* Social Login Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialButtonsContainer}>
            <Pressable
              style={styles.googleButton}
              onPress={() => promptAsync()}
            >
              <Image
                source={require("../../assets/images/google-icon.png")}
                style={styles.googlePngIcon}
                resizeMode="contain"
              />
              <Text style={styles.googleButtonText}>Google</Text>
            </Pressable>
          </View>

          {/* Switch Mode Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>
              {mode === "login"
                ? "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <Pressable
              onPress={() => {
                setMode(mode === "login" ? "register" : "login");
                setMessage("");
              }}
            >
              <Text style={styles.signupLink}>
                {mode === "login" ? "Sign up" : "Sign in"}
              </Text>
            </Pressable>
          </View>
        </>
      )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 24,
  },
  loginTitle: {
    fontSize: 32,
    fontFamily: Fonts.family.bold,
    textAlign: "left",
    marginBottom: 4,
    marginTop: 50,
    color: "#111827",
  },
  loginSubtitle: {
    fontSize: 18,
    color: "#6b7280",
    textAlign: "left",
    marginBottom: 32,
    fontFamily: Fonts.regular,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    fontSize: 16,
    color: "#111827",
    fontFamily: Fonts.regular,
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
  passwordInputContainer: {
    position: "relative",
    width: "100%",
  },
  passwordInput: {
    width: "100%",
    marginBottom: 0,
    color: "#222",
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    top: 0,
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  eyeText: {
    fontSize: 18,
    color: "#888",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#2a4eff",
    fontFamily: Fonts.family.medium,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: "#2a4eff",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#2a4eff",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  loginButtonDisabled: {
    opacity: 0.5,
    backgroundColor: "#94a3b8",
  },
  loginButtonText: {
    color: "white",
    fontFamily: Fonts.family.bold,
    fontSize: 18,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    marginHorizontal: 10,
    marginVertical: 5,
    color: "#888",
    fontSize: 14,
  },
  socialButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingVertical: 16,
    width: "100%",
    marginHorizontal: 0,
    marginBottom: 0,
    borderWidth: 2,
    borderColor: "#d1d5db",
    shadowColor: "#000",
  },
  googleButtonText: {
    color: "#374151",
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  signupText: {
    color: "#6b7280",
    fontSize: 16,
    fontFamily: Fonts.regular,
  },
  signupLink: {
    color: "#2a4eff",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
  showPasswordContainer: {
    marginBottom: 12,
  },
  showPasswordText: {
    color: "#4361EE",
    textAlign: "right",
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.family.bold,
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontFamily: Fonts.family.bold,
    fontSize: 16,
  },
  switchText: {
    marginTop: 16,
    textAlign: "center",
    color: "#2a4eff",
  },
  message: {
    marginBottom: 12,
    fontSize: 13,
    textAlign: "left",
  },
  errorMessage: {
    color: "#ef4444",
    paddingHorizontal: 10,
    fontWeight: "500",
  },
  successMessage: {
    color: "#16a34a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
    backgroundColor: "#f3f4f6",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
  },
  googlePngIcon: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  // Password validation styles
  passwordValidationContainer: {
    marginTop: 0,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  passwordStrengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  passwordStrengthBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#e9ecef",
    borderRadius: 3,
    marginRight: 10,
    overflow: "hidden",
  },
  passwordStrengthFill: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.3s ease",
  },
  passwordStrengthText: {
    fontSize: 14,
    fontFamily: Fonts.family.medium,
    fontWeight: "600",
  },
  passwordRequirements: {
    marginTop: 4,
  },
  passwordRequirementsTitle: {
    fontSize: 14,
    fontFamily: Fonts.family.medium,
    color: "#374151",
    marginBottom: 6,
  },
  passwordRequirementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
});
