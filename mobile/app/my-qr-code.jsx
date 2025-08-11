import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
  Pressable,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { firebase, firestore } from "@/src/services/firebase";
import QRCode from "react-native-qrcode-svg";
import { Fonts } from "@/src/constants/Fonts";
import { useTheme } from "@/src/context/useTheme";

function generateNewQrValue(uid) {
  // Generate a new unique QR value (e.g., UID + timestamp + random)
  return `${uid}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export default function MyQRCodeScreen() {
  const navigation = useNavigation();

  // Hide the header for this screen
  React.useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [qrValue, setQrValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInitial, setUserInitial] = useState("");
  const [Handle, setHandle] = useState("");
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
      setHandle(
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          My QR Code
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
            <Text style={[styles.avatarText, { color: theme.background }]}>
              {userInitial}
            </Text>
          </View>
        </View>
        <View style={styles.qrCard}>
          <View style={styles.qrContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={theme.tint} />
            ) : qrValue ? (
              <QRCode value={qrValue} size={250} />
            ) : (
              <Text style={[styles.noQrText, { color: theme.text }]}>
                No QR code found.
              </Text>
            )}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.regenerateButton, { backgroundColor: theme.tint }]}
            onPress={handleRegenerate}
            disabled={regenerating || loading}
          >
            <Text
              style={[styles.regenerateButtonText, { color: theme.background }]}
            >
              {regenerating ? "Regenerating..." : "Regenerate QR"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 20,
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: -50,
  },
  qrCard: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: -30,
    zIndex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontFamily: Fonts.bold,
  },
  qrContainer: {
    alignItems: "center",
    minHeight: 300,
    justifyContent: "center",
  },
  noQrText: {
    fontSize: 16,
    fontFamily: Fonts.medium,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
  },
  regenerateButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 200,
    alignItems: "center",
  },
  regenerateButtonText: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
});
