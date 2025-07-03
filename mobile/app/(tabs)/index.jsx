<<<<<<< HEAD
import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { logoutUser } from "../../src/authService";
import { useRouter } from "expo-router";

console.log("HomeScreen loaded");
=======
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { firebase } from "@/src/firebase";
>>>>>>> test-from-old-commit

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
<<<<<<< HEAD
    await logoutUser();
    router.replace("/auth");
=======
    try {
      await firebase.auth().signOut();
      router.replace("/auth");
    } catch (error) {
      // Optionally handle error
      alert("Logout failed: " + error.message);
    }
>>>>>>> test-from-old-commit
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Hello World</Text>
        <Text style={styles.subtitle}>This is the first page of your app.</Text>
<<<<<<< HEAD
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
=======
        <Pressable style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
>>>>>>> test-from-old-commit
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
<<<<<<< HEAD
  logoutButton: {
    marginTop: 32,
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
=======
  button: {
    marginTop: 32,
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
>>>>>>> test-from-old-commit
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
