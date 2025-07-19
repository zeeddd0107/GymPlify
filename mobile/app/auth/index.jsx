import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Button,
} from "react-native";
import { loginUser, registerUser, upsertUserInFirestore } from "@/src/authService";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { makeRedirectUri } from "expo-auth-session";
import { firebase } from "@/src/firebase";
import { firestore } from "@/src/firebase";

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "792567912347-q242e9l92m353hu4h07f4dm5hpvbjdal.apps.googleusercontent.com",
    iosClientId: "792567912347-942835ebp1tv39tsj52s0s93tlaou44a.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({
      native: "com.zeeeddd.mobile:/oauthredirect",
    }),
    scopes: ['openid', 'profile', 'email'],
  });

  // Listen to Google Sign-In response
  useEffect(() => {
    if (response?.type === "success" && response.authentication?.accessToken) {
      getUserInfo(response.authentication.accessToken);
    }
  }, [response]);

  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      // Sign in to Firebase Auth with Google access token
      const credential = firebase.auth.GoogleAuthProvider.credential(null, token);
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
          console.log("Google API response not ok:", res.status, res.statusText);
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
  };

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
        await firestore.collection("users").doc(user.uid).set({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
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
      ) : (
        <>
          <Text style={{ fontSize: 12, marginBottom: 10 }}>
            {JSON.stringify(userInfo, null, 2)}
          </Text>

          <Button title="Sign in with Google" onPress={() => promptAsync()} />
          <Button
            title="Delete local storage"
            onPress={() => {
              AsyncStorage.removeItem("@user");
              setUserInfo(null);
            }}
          />
          <Button
            title="Log debug info"
            onPress={() => {
              console.log("Google response:", response);
              console.log("Access Token:", response?.authentication?.accessToken);
              console.log("userInfo state:", userInfo);
            }}
          />

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
            <Text style={{ color: '#1d4ed8', textAlign: 'right' }}>
              {showPassword ? 'Hide' : 'Show'} Password
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
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f3f4f6",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
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
    color: "#1d4ed8",
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
});
