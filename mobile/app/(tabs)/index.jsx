import React from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { logoutUser } from "../../src/authService";
import { useRouter } from "expo-router";

console.log("HomeScreen loaded");

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutUser();
    router.replace("/auth");
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.title}>Hello World</Text>
        <Text style={styles.subtitle}>This is the first page of your app.</Text>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
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
  logoutButton: {
    marginTop: 32,
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
