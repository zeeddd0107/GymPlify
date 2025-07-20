import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Button,
  Image,
} from "react-native";
import {
  loginUser,
  registerUser,
  upsertUserInFirestore,
} from "@/src/authService";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from "expo-auth-session";
import { firebase } from "@/src/firebase";
import { firestore } from "@/src/firebase";
import { Feather } from "@expo/vector-icons";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [, setUserInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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

  // Fix useEffect dependency warning
  useEffect(() => {
    if (response?.type === "success" && response.authentication?.accessToken) {
      getUserInfo(response.authentication.accessToken);
    }
  }, [response, getUserInfo]);

  const getUserInfo = useCallback(
    async (token) => {
      if (!token) return;
      try {
        // Sign in to Firebase Auth with Google access token
        const credential = firebase.auth.GoogleAuthProvider.credential(
          null,
          token,
        );
        await firebase.auth().signInWithCredential(credential);

        // Add user to Firestore using shared helper
        const fbUser = firebase.auth().currentUser;
        if (fbUser) {
          await upsertUserInFirestore(fbUser, "google");
        }

        // Try to fetch user info from Google (optional - Firebase already has the user data)
        try {
          const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const user = await res.json();
            console.log("Fetched Google user:", user);
            await AsyncStorage.setItem("@user", JSON.stringify(user));
            setUserInfo(user);
          } else {
            console.log(
              "Google API response not ok:",
              res.status,
              res.statusText,
            );
            // Use Firebase user data instead
            if (fbUser) {
              const userData = {
                id: fbUser.uid,
                email: fbUser.email,
                name: fbUser.displayName,
                picture: fbUser.photoURL,
              };
              await AsyncStorage.setItem("@user", JSON.stringify(userData));
              setUserInfo(userData);
            }
          }
        } catch (googleErr) {
          console.log("Error fetching Google user info:", googleErr);
          // Use Firebase user data instead
          if (fbUser) {
            const userData = {
              id: fbUser.uid,
              email: fbUser.email,
              name: fbUser.displayName,
              picture: fbUser.photoURL,
            };
            await AsyncStorage.setItem("@user", JSON.stringify(userData));
            setUserInfo(userData);
          }
        }

        router.replace("/(tabs)");
      } catch (err) {
        console.log("Error in Google authentication:", err);
        setMessage("Google authentication failed. Please try again.");
      }
    },
    [router, setUserInfo, setMessage],
  );

  const handleAuth = async () => {
    setLoading(true);
    setMessage("");
    try {
      let user;
      if (mode === "register") {
        user = await registerUser(email, password);
      } else {
        user = await loginUser(email, password);
      }
      // Add/update lastLogin in Firestore
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

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
        </View>
      ) : mode === "login" ? (
        <>
          <Text style={styles.loginTitle}>Sign In</Text>
          <Text style={styles.loginSubtitle}>
            Enter valid email/number and password to continue
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Email or phone number"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.passwordInputContainer}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
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
          <Pressable style={styles.forgotPassword} onPress={() => {}}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </Pressable>

          <Pressable
            style={styles.loginButton}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </Pressable>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
          </View>

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

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Pressable
              onPress={() => {
                setMode("register");
                setMessage("");
              }}
            >
              <Text style={styles.signupLink}>Sign up</Text>
            </Pressable>
          </View>

          {message && (
            <Text style={[styles.message, styles.errorMessage]}>{message}</Text>
          )}
        </>
      ) : (
        <>
          <Text style={styles.title}>
            GymPlify {mode === "login" ? "Login" : "Register"}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable
            style={{ marginBottom: 12 }}
            onPress={() => setShowPassword((prev) => !prev)}
          >
            <Text style={{ color: "#4361EE", textAlign: "right" }}>
              {showPassword ? "Hide" : "Show"} Password
            </Text>
          </Pressable>
          <Pressable
            style={styles.button}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {mode === "login" ? "Login" : "Register"}
            </Text>
          </Pressable>
          <Pressable
            disabled={loading}
            onPress={() => {
              setMode(mode === "login" ? "register" : "login");
              setMessage("");
            }}
          >
            <Text style={styles.switchText}>
              {mode === "login"
                ? "Don't have an account? Register"
                : "Already have an account? Login"}
            </Text>
          </Pressable>
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
    paddingTop: 220, // Move content slightly down
  },
  loginTitle: {
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    marginTop: 12,
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
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  eyeButton: {
    position: "absolute",
    right: 12, // was 16, move icon further right
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
    fontWeight: "500",
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
    fontWeight: "bold",
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
  googleIcon: {
    marginRight: 8,
    // The AntDesign icon is already colored like Google
  },
  googleButtonText: {
    color: "#222",
    fontWeight: "bold",
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
    fontWeight: "bold",
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
    fontWeight: "bold",
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
