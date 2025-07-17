import { StyleSheet, Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { firebase } from "@/src/firebase";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setLastLogout } from "@/src/authService";

export default function HomeScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchEmail = async () => {
      let userEmail = firebase.auth().currentUser?.email;
      if (!userEmail) {
        // Try to get from AsyncStorage (for Google login)
        const userStr = await AsyncStorage.getItem("@user");
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            userEmail = userObj.email || userObj.name || "";
          } catch {}
        }
      }
      setEmail(userEmail || "");
    };
    fetchEmail();
  }, []);

  const handleLogout = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        await setLastLogout(user.uid);
      }
      await firebase.auth().signOut();
      router.replace("/auth");
    } catch (error) {
      // Optionally handle error
      alert("Logout failed: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Text style={styles.welcome}>
          {email ? `Welcome ${email}` : "Welcome"}
        </Text>
        <Text style={styles.title}>Hello World</Text>
        <Text style={styles.subtitle}>This is the first page of your app.</Text>
        <Pressable style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
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
  welcome: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#22c55e",
    textAlign: "center",
  },
  title: {
    fontSize: 64,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
  button: {
    marginTop: 32,
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
});
