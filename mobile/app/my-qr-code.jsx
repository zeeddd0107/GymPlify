import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { firebase, firestore } from "@/src/services/firebase";
import QRCode from "react-native-qrcode-svg";
import { Fonts } from "@/src/constants/Fonts";
import { useTheme } from "@/src/context";
import { useDashboard } from "@/src/hooks/dashboard";
import { getUserActiveSubscription } from "@/src/services/subscriptionService";
import { StatusBar, setStatusBarStyle } from "expo-status-bar";
// Use legacy API for writeAsStringAsync to avoid SDK 54 deprecation errors
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";

function generateNewQrValue(uid) {
  // Generate a new unique QR value (ex. UID + timestamp + random)
  return `${uid}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

export default function MyQRCodeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { hasActiveSubscription } = useDashboard();

  const [qrValue, setQrValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInitial, setUserInitial] = useState("");
  const [Handle, setHandle] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
  const qrRef = useRef(null);

  // Set status bar style for QR code screen
  useEffect(() => {
    setStatusBarStyle("dark", true);
  }, []);

  useEffect(() => {
    const fetchQr = async () => {
      setLoading(true);
      setIsSubscriptionExpired(false);

      const user = firebase.auth().currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if subscription is expired first
      try {
        const activeSubscription = await getUserActiveSubscription(user.uid);
        if (activeSubscription && activeSubscription.isExpired) {
          setIsSubscriptionExpired(true);
          setLoading(false);
          return;
        }

        // If no active subscription or subscription is not expired, check hasActiveSubscription
        if (!hasActiveSubscription) {
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking subscription expiry:", error);
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
  }, [hasActiveSubscription]);

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

  const handleDownload = async () => {
    try {
      if (!qrValue || !qrRef.current) {
        Alert.alert("QR Code", "No QR code to download.");
        return;
      }

      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission required",
          "Please allow media library access to save the QR code.",
        );
        return;
      }

      // Convert QR SVG to base64 PNG
      qrRef.current.toDataURL(async (data) => {
        try {
          const fileUri = FileSystem.cacheDirectory + `qr_${Date.now()}.png`;
          // Some environments may not expose FileSystem.EncodingType.Base64; use literal 'base64'
          await FileSystem.writeAsStringAsync(fileUri, data, {
            encoding: "base64",
          });

          const asset = await MediaLibrary.createAssetAsync(fileUri);
          // Save to library; createAlbumAsync may fail on iOS if album doesn't exist
          try {
          await MediaLibrary.createAlbumAsync("Download", asset, false);
          } catch (_) {
            await MediaLibrary.saveToLibraryAsync(fileUri);
          }

          Alert.alert("Saved", "QR code has been saved to your gallery.");
        } catch (err) {
          console.error("Save QR error:", err);
          Alert.alert("Error", "Failed to save the QR code.");
        }
      });
    } catch (e) {
      console.error(e);
      Alert.alert(
        "Error",
        "Something went wrong while downloading the QR code.",
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="dark" />

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
        {isSubscriptionExpired ? (
          <View style={styles.expiredContainer}>
            <View style={styles.expiredIcon}>
              <Ionicons name="time-outline" size={48} color="#DC2626" />
            </View>
            <Text style={[styles.expiredTitle, { color: theme.text }]}>
              Subscription Expired
            </Text>
            <Text style={[styles.expiredSubtext, { color: theme.text }]}>
              Your subscription has expired. Renew your subscription to access
              QR code and other premium features.
            </Text>
            <Pressable
              style={styles.renewButton}
              onPress={() => router.push("/subscriptions")}
            >
              <Text style={styles.renewButtonText}>Renew Subscription</Text>
            </Pressable>
          </View>
        ) : loading || !qrValue ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.tint} />
          </View>
        ) : (
          <>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: theme.tint }]}>
                <Text style={[styles.avatarText, { color: theme.background }]}>
                  {userInitial}
                </Text>
              </View>
            </View>
            <View style={styles.qrCard}>
              <View style={styles.qrContainer}>
                <QRCode
                  value={qrValue}
                  size={300}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                  ecl="H"
                  quietZone={16}
                  getRef={(c) => (qrRef.current = c)}
                />
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <Pressable
                style={[
                  styles.regenerateButton,
                  { backgroundColor: theme.tint },
                ]}
                onPress={handleRegenerate}
                disabled={regenerating || loading}
              >
                <Text
                  style={[
                    styles.regenerateButtonText,
                    { color: theme.background },
                  ]}
                >
                  {regenerating ? "Regenerating..." : "Regenerate QR"}
                </Text>
              </Pressable>
              <View style={{ height: 12 }} />
              <Pressable
                style={[
                  styles.regenerateButton,
                  { backgroundColor: theme.tint },
                ]}
                onPress={handleDownload}
                disabled={loading || !qrValue}
              >
                <Text
                  style={[
                    styles.regenerateButtonText,
                    { color: theme.background },
                  ]}
                >
                  Download QR
                </Text>
              </Pressable>
            </View>
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  expiredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  expiredTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 24,
    marginTop: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  expiredSubtext: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  renewButton: {
    backgroundColor: "#4361EE",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  renewButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
});
