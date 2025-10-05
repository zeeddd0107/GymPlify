import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme, useAuth } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import { firebase } from "@/src/services/firebase";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user: authUser, loading: authLoading } = useAuth();

  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadUserData();
  }, [authUser, authLoading, loadUserData]);

  const loadUserData = useCallback(async () => {
    try {
      console.log("🔍 Profile - loadUserData called");
      console.log("🔍 Profile - authLoading:", authLoading);
      console.log("🔍 Profile - authUser:", authUser);

      // Don't load if authentication is still loading
      if (authLoading) {
        console.log(
          "🔍 Profile - Authentication still loading, skipping profile data load",
        );
        return;
      }

      // Don't load if no authenticated user
      if (!authUser) {
        console.log(
          "🔍 Profile - No authenticated user, skipping profile data load",
        );
        setUserData(null);
        setEmail("");
        return;
      }

      console.log(
        "🔍 Profile - Loading profile data for user:",
        authUser.email,
      );

      // Use authentication context data
      setUserData({
        email: authUser.email,
        displayName: authUser.name,
        uid: authUser.id,
      });
      setEmail(authUser.email || "");

      console.log("🔍 Profile - Profile data loaded:", {
        email: authUser.email,
        displayName: authUser.name,
        uid: authUser.id,
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [authLoading, authUser]);

  // Removed unused handleProfileOptionPress to satisfy linter

  const handleMyQRCode = () => {
    router.push("/my-qr-code");
  };

  const handleLoginInformation = () => {
    const userEmail = userData?.email || email;
    Alert.alert(
      "Login Information",
      "Email: " +
        userEmail +
        "\n\nTo change your password, please contact support.",
      [
        {
          text: "Copy Email",
          onPress: () => {
            // Note: Clipboard functionality requires expo-clipboard package
            // For now, just show the email in an alert
            Alert.alert("Email", userEmail);
          },
        },
        {
          text: "OK",
          style: "default",
        },
      ],
    );
  };

  const handleTermsAndConditions = () => {
    Alert.alert(
      "Terms and Conditions",
      "By using GymPlify, you agree to our terms and conditions. Please read the full document on our website.",
      [
        {
          text: "View Full Terms",
          onPress: () => {
            // You can implement web view or navigation to terms page
            Alert.alert("Opening terms and conditions...");
          },
        },
        {
          text: "OK",
          style: "default",
        },
      ],
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      "Privacy Policy",
      "Your privacy is important to us. We collect and use your information as described in our privacy policy.",
      [
        {
          text: "View Full Policy",
          onPress: () => {
            // You can implement web view or navigation to privacy policy page
            Alert.alert("Opening privacy policy...");
          },
        },
        {
          text: "OK",
          style: "default",
        },
      ],
    );
  };

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          let signOutError = null;
          try {
            await firebase.auth().signOut();
          } catch (error) {
            signOutError = error;
            console.error("Error signing out:", error);
          } finally {
            try {
              await AsyncStorage.clear();
            } catch (error) {
              console.warn("Failed to clear AsyncStorage:", error);
            }
            router.replace("/auth");
          }
          if (signOutError) {
            Alert.alert(
              "Sign-out issue",
              signOutError?.message ||
                "Failed to sign out from server, but local session was cleared.",
            );
          }
        },
      },
    ]);
  };

  const profileOptions = [
    {
      id: 1,
      title: "Login Information",
      icon: "key-outline",
      onPress: handleLoginInformation,
    },
    {
      id: 2,
      title: "My QR Code",
      icon: "qr-code-outline",
      onPress: handleMyQRCode,
    },
    {
      id: 3,
      title: "Terms and Conditions",
      icon: "document-text-outline",
      onPress: handleTermsAndConditions,
    },
    {
      id: 4,
      title: "Privacy Policy",
      icon: "shield-checkmark-outline",
      onPress: handlePrivacyPolicy,
    },
    {
      id: 5,
      title: "Logout",
      icon: "log-out-outline",
      onPress: handleSignOut,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Profile
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* User Info */}
      <View
        style={[styles.userInfoSection, { backgroundColor: theme.background }]}
      >
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={40} color={theme.icon} />
        </View>
        <Text style={[styles.userName, { color: theme.textPrimary }]}>
          {userData?.displayName || "User"}
        </Text>
        <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
          {email}
        </Text>
      </View>

      {/* Profile Options */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {profileOptions.map((option) => (
            <View key={option.id}>
              <Pressable
                style={[
                  styles.profileOption,
                  option.id === 5 && styles.signOutOption,
                ]}
                onPress={option.onPress}
              >
                <Text
                  style={[
                    styles.profileOptionText,
                    {
                      color:
                        option.id === 5 ? theme.textError : theme.textPrimary,
                    },
                  ]}
                >
                  {option.title}
                </Text>
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={option.id === 5 ? theme.textError : theme.icon}
                />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 22,
  },
  headerPlaceholder: {
    width: 40,
  },
  userInfoSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  userAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontFamily: Fonts.family.bold,
    fontSize: 24,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  profileOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.01)",
    borderRadius: 12,
    marginVertical: 4,
  },
  signOutOption: {
    marginTop: 20,
  },
  profileOptionText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    flex: 1,
  },
  separator: {
    height: 1,
    opacity: 0.3,
  },
});
