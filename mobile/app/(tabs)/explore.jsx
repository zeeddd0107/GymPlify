import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { firebase, firestore } from "@/src/firebase";
import QRCode from "react-native-qrcode-svg";

export default function QRCodeScreen() {
  const [qrValue, setQrValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInitial, setUserInitial] = useState("");
  const [telegramHandle, setTelegramHandle] = useState(""); // Placeholder, update as needed

  useEffect(() => {
    const fetchQr = async () => {
      setLoading(true);
      const user = firebase.auth().currentUser;
      if (!user) {
        setLoading(false);
        return;
      }
      setUserInitial(
        user.displayName
          ? user.displayName[0].toUpperCase()
          : user.email
            ? user.email[0].toUpperCase()
            : "?",
      );
      // Optionally, fetch Telegram handle from user profile or Firestore
      setTelegramHandle(
        user.displayName
          ? `@${user.displayName.replace(/\s/g, "").toUpperCase()}`
          : "",
      );
      try {
        const userDoc = await firestore.collection("users").doc(user.uid).get();
        if (userDoc.exists && userDoc.data().qrCodeValue) {
          setQrValue(userDoc.data().qrCodeValue);
        } else {
          setQrValue(null);
        }
      } catch {
        setQrValue(null);
      }
      setLoading(false);
    };
    fetchQr();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{userInitial}</Text>
        </View>
      </View>
      <View style={styles.qrContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#22c55e" />
        ) : qrValue ? (
          <QRCode value={qrValue} size={240} />
        ) : (
          <Text>No QR code found.</Text>
        )}
      </View>
      <Text style={styles.handle}>{telegramHandle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#10131a",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e74c3c",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -24,
    zIndex: 2,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 24,
  },
  qrContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  handle: {
    color: "#1da1f2",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 16,
  },
});
