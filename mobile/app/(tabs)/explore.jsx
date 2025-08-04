import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
} from "react-native";
import { useEffect, useState } from "react";
import { firebase, firestore } from "@/src/firebase";
import QRCode from "react-native-qrcode-svg";

function generateNewQrValue(uid) {
  // Generate a new unique QR value (e.g., UID + timestamp + random)
  return `${uid}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export default function QRCodeScreen() {
  const [qrValue, setQrValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInitial, setUserInitial] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");
  const [regenerating, setRegenerating] = useState(false);

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

  const handleRegenerate = async () => {
    const user = firebase.auth().currentUser;
    if (!user) return;
    setRegenerating(true);
    try {
      const newQrValue = generateNewQrValue(user.uid);
      await firestore.collection("users").doc(user.uid).set(
        {
          qrCodeValue: newQrValue,
        },
        { merge: true },
      );
      setQrValue(newQrValue);
      Alert.alert("QR Code Updated", "Your QR code has been regenerated.");
    } catch {
      Alert.alert("Error", "Failed to regenerate QR code.");
    }
    setRegenerating(false);
  };

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
          <QRCode value={qrValue} size={250} />
        ) : (
          <Text>No QR code found.</Text>
        )}
      </View>
      <Button
        title={regenerating ? "Regenerating..." : "Regenerate QR"}
        onPress={handleRegenerate}
        disabled={regenerating || loading}
      />
      {qrValue && <Text style={styles.qrValue}>{qrValue}</Text>}
      <Text style={styles.handle}>{telegramHandle}</Text>
    </View>
  );
}

// Call this function after a successful QR scan
export async function recordAttendance(userId) {
  try {
    const today = new Date();
    const dateString = today.toISOString().split("T")[0]; // YYYY-MM-DD

    // Check if there's already an attendance record for today
    const attendanceRef = firestore
      .collection("attendance")
      .where("userId", "==", userId)
      .where("date", "==", dateString);

    const snapshot = await attendanceRef.get();

    if (snapshot.empty) {
      // No record for today, create check-in
      await firestore.collection("attendance").add({
        userId,
        date: dateString,
        checkInTime: firebase.firestore.FieldValue.serverTimestamp(),
        checkOutTime: null,
      });
    } else {
      // Record exists, update checkOutTime
      const doc = snapshot.docs[0];
      await firestore.collection("attendance").doc(doc.id).update({
        checkOutTime: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
  } catch (err) {
    console.log("Failed to record attendance:", err);
  }
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
  qrValue: {
    color: "#888",
    fontSize: 14,
    marginTop: 12,
    marginBottom: 4,
    textAlign: "center",
    wordBreak: "break-all",
  },
});
