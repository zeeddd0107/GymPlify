import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { registerUser, loginUser } from "@/src/authService";

export default function AuthScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuthAction = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (mode === "register") {
        await registerUser(email, password);
        setMessage("Welcome! Account created successfully.");
      } else {
        await loginUser(email, password);
        setMessage("Welcome back!");
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="#22c55e" />
      ) : (
        <Pressable style={styles.button} onPress={handleAuthAction}>
          <Text style={styles.buttonText}>
            {mode === "login" ? "Login" : "Create Account"}
          </Text>
        </Pressable>
      )}
      <Pressable
        disabled={loading}
        onPress={() => setMode(mode === "login" ? "register" : "login")}
      >
        <Text style={styles.switchText}>
          {mode === "login"
            ? "Don't have an account? Register"
            : "Already have an account? Login"}
        </Text>
      </Pressable>
      {message && (
        <Text
          style={[
            styles.message,
            message.startsWith("Welcome")
              ? styles.successMessage
              : styles.errorMessage,
          ]}
        >
          {message}
        </Text>
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
});
