import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  loginUser,
  registerUser,
  upsertUserInFirestore,
} from "@/src/services/authService";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from "expo-auth-session";
import { firebase, firestore } from "@/src/services/firebase";
import { Feather } from "@expo/vector-icons";
import { sendEmailVerification } from "firebase/auth";
import { updateProfile } from "firebase/auth";
import { Fonts } from "@/src/constants/Fonts";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
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
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [resent, setResent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [name, setName] = useState(""); // Add name state
  const verificationTimerRef = useRef(null);

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

  // Start a 5-minute timer after registration for email verification
  useEffect(() => {
    if (!awaitingVerification) {
      // If we exit verification state, clear any pending timer
      if (verificationTimerRef.current) {
        clearTimeout(verificationTimerRef.current);
        verificationTimerRef.current = null;
      }
      return;
    }

    // Clear any previous timer before starting a new one
    if (verificationTimerRef.current) {
      clearTimeout(verificationTimerRef.current);
    }

    const id = setTimeout(
      async () => {
        const user = firebase.auth().currentUser;
        if (user && !user.emailVerified) {
          try {
            // Delete user document from 'users' collection
            await firestore.collection("users").doc(user.uid).delete();
            // Delete all subscriptions for this user
            const subsSnap = await firestore
              .collection("subscriptions")
              .where("userId", "==", user.uid)
              .get();
            const batch = firestore.batch();
            subsSnap.forEach((doc) => batch.delete(doc.ref));
            await batch.commit();
            // Delete the Firebase Auth user
            await user.delete();
            setMessage("Please register again.");
            setAwaitingVerification(false);
            setMode("register");
          } catch {
            setMessage(
              "Failed to delete unverified account and related data. Please try again.",
            );
          }
        }
      },
      5 * 60 * 1000,
    );

    verificationTimerRef.current = id;

    // Cleanup this timer when component unmounts or verification state ends
    return () => {
      if (id) clearTimeout(id);
      if (verificationTimerRef.current === id)
        verificationTimerRef.current = null;
    };
  }, [awaitingVerification]);

  // --- AUTHENTICATION LOGIC ---
  // Handles the entire Google sign-in process after getting the token
  const getUserInfo = useCallback(
    async (token) => {
      if (!token) return;
      try {
        // Sign in to Firebase with the Google credential
        const credential = firebase.auth.GoogleAuthProvider.credential(
          null,
          token,
        );
        await firebase.auth().signInWithCredential(credential);

        // Create or update the user in Firestore
        const fbUser = firebase.auth().currentUser;
        if (fbUser) {
          await upsertUserInFirestore(fbUser, "google");
          // Create a subscription if one doesn't exist
          const subSnap = await firestore
            .collection("subscriptions")
            .where("userId", "==", fbUser.uid)
            .get();
          if (subSnap.empty) {
            // Get the current timestamp for startDate
            const startDate = firebase.firestore.Timestamp.now();
            // Calculate endDate as one month after startDate
            const endDate = new Date(startDate.toDate());
            endDate.setMonth(endDate.getMonth() + 1);
            await firestore.collection("subscriptions").add({
              userId: fbUser.uid,
              plan: "basic",
              status: "active",
              startDate: startDate,
              endDate: firebase.firestore.Timestamp.fromDate(endDate), // endDate is one month after startDate
              createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
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
        try {
          router.replace("/(tabs)");
        } catch (navError) {
          console.log("Navigation error:", navError);
          // Fallback navigation
          router.push("/(tabs)");
        }
      } catch (error) {
        console.log("Error in Google authentication:", error);
        setMessage("Google authentication failed. Please try again.");
      }
    },
    [router, setUserInfo, setMessage],
  );

  // Handles email/password login and registration
  const handleAuth = async () => {
    setLoading(true);
    setMessage("");
    setResent(false);
    try {
      let user;
      if (mode === "register") {
        // Require name during registration
        if (!name || !name.trim()) {
          setMessage("Please enter your name.");
          setLoading(false);
          return;
        }
        user = await registerUser(email, password);
        if (user) {
          // Compute a default avatar URL when no photo is provided
          const defaultPhotoURL = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=0D8ABC&color=fff&bold=true`;

          // Update Firebase Auth profile with displayName and default photo if missing
          const profileUpdate = { displayName: name };
          if (!user.photoURL) {
            profileUpdate.photoURL = defaultPhotoURL;
          }
          await updateProfile(user, profileUpdate);

          // Reload to ensure we have the latest user values
          await user.reload();
          const refreshedUser = firebase.auth().currentUser;

          // Persist displayName and photoURL in Firestore
          await firestore
            .collection("users")
            .doc(refreshedUser.uid)
            .set(
              {
                displayName: name,
                photoURL: refreshedUser.photoURL || defaultPhotoURL,
              },
              { merge: true },
            );

          // Ensure user record has non-null photoURL (updates custom fields via merge)
          await upsertUserInFirestore(refreshedUser, "password");
        }
        // After registration, show verification screen
        setAwaitingVerification(true);
        setLoading(false);
        return;
      } else {
        user = await loginUser(email, password);
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
      }
      // Update the user's last login timestamp
      if (user) {
        await firestore.collection("users").doc(user.uid).set(
          {
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }
      router.replace("/(tabs)");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- UI RENDER FUNCTIONS ---
  // Renders the email input field to avoid duplication
  const renderEmailInput = () => (
    <TextInput
      style={styles.input}
      placeholder={mode === "login" ? "Email or phone number" : "Email"}
      value={email}
      onChangeText={setEmail}
      autoCapitalize="none"
      keyboardType="email-address"
      placeholderTextColor="#bdbdbd"
    />
  );

  // Renders the main action button (Login/Create account) to avoid duplication
  const renderAuthButton = () => (
    <Pressable
      style={styles.loginButton}
      onPress={handleAuth}
      disabled={loading}
    >
      <Text style={styles.loginButtonText}>
        {mode === "login" ? "Login" : "Create account"}
      </Text>
    </Pressable>
  );

  // --- MAIN RENDER ---
  if (awaitingVerification) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
        <Text style={styles.loginTitle}>Verify your email</Text>
        <Text style={styles.loginSubtitle}>
          We've sent a verification link to your email address. Please check
          your inbox and click the link to verify your account.
        </Text>
        <Pressable
          style={[styles.loginButton, { marginTop: 24 }]}
          onPress={async () => {
            setChecking(true);
            setMessage("");
            try {
              const user = firebase.auth().currentUser;
              await user.reload();
              if (user.emailVerified) {
                setAwaitingVerification(false);
                router.replace("/(tabs)");
              } else {
                setMessage("Email not verified yet. Please check your inbox.");
              }
            } catch {
              setMessage(
                "Failed to check verification status. Please try again.",
              );
            } finally {
              setChecking(false);
            }
          }}
          disabled={checking}
        >
          <Text style={styles.loginButtonText}>
            {checking ? "Checking..." : "Continue"}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.loginButton,
            { backgroundColor: "#888", marginTop: 12 },
          ]}
          onPress={async () => {
            setResent(false);
            setMessage("");
            try {
              const user = firebase.auth().currentUser;
              await sendEmailVerification(user);
              setResent(true);
            } catch {
              setMessage(
                "Failed to resend verification email. Please try again later.",
              );
            }
          }}
        >
          <Text style={styles.loginButtonText}>Resend Verification Email</Text>
        </Pressable>
        {resent && (
          <Text style={{ color: "green", marginTop: 8 }}>
            Verification email resent!
          </Text>
        )}
        {message && (
          <Text style={[styles.message, styles.errorMessage]}>{message}</Text>
        )}
      </View>
    );
  }
  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : (
        <>
          {/* Page Title and Subtitle */}
          <Text style={styles.loginTitle}>
            {mode === "login" ? "Sign In" : "Sign Up"}
          </Text>
          <Text style={styles.loginSubtitle}>
            {mode === "login"
              ? "Enter valid email/number and password to continue"
              : "Create an account to get started"}
          </Text>

          {/* Email Input */}
          {renderEmailInput()}

          {/* Name Input (Registration only) */}
          {mode === "register" && (
            <TextInput
              style={styles.input}
              placeholder="Name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              placeholderTextColor="#bdbdbd"
            />
          )}

          {/* Password Input with Eye Icon (for both modes) */}
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#bdbdbd"
            />
            <Pressable
              style={styles.eyeButton}
              onPress={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <Feather name="eye-off" size={20} color="#bdbdbd" />
              ) : (
                <Feather name="eye" size={20} color="#bdbdbd" />
              )}
            </Pressable>
          </View>

          {mode === "register" && <View style={{ marginTop: 18 }} />}

          {/* Forgot Password (Login only) */}
          {mode === "login" && (
            <Pressable style={styles.forgotPassword} onPress={() => {}}>
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

          {/* Common Error Message */}
          {message && (
            <Text style={[styles.message, styles.errorMessage]}>{message}</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 24,
    backgroundColor: "#f3f4f6",
  },
  loginTitle: {
    fontSize: 40,
    fontFamily: Fonts.family.bold,
    textAlign: "center",
    marginBottom: 12,
    marginTop: 150,
  },
  loginSubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    fontSize: 16,
    color: "#222",
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  passwordInput: {
    flex: 1,
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
    marginVertical: 16,
  },
  forgotPasswordText: {
    color: "#2a4eff",
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    marginVertical: 5,
  },
  loginButton: {
    backgroundColor: "#2a4eff",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#2a4eff",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
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
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  googleButtonText: {
    color: "#212427",
    fontFamily: Fonts.family.bold,
    fontSize: 18,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  signupText: {
    color: "#888",
    fontSize: 14,
  },
  signupLink: {
    color: "#2a4eff",
    fontFamily: Fonts.family.bold,
    fontSize: 14,
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
    marginTop: 16,
    textAlign: "center",
  },
  errorMessage: {
    color: "#dc2626",
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
});
