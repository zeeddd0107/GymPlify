import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";

import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme, useAuth } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import { firebase as _firebase } from "@/src/services/firebase";
import { LogoutConfirmationModal } from "@/src/components/shared";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user: authUser, loading: authLoading } = useAuth();

  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
        photoURL: authUser.picture,
      });
      setEmail(authUser.email || "");

      console.log("🔍 Profile - Profile data loaded:", {
        email: authUser.email,
        displayName: authUser.name,
        uid: authUser.id,
        picture: authUser.picture,
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, [authUser, authLoading]);

  // Removed unused handleProfileOptionPress to satisfy linter

  const handleMyQRCode = () => {
    router.push("/my-qr-code");
  };

  const handleSubscriptions = () => {
    router.push("/subscriptions");
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

  const handleSignOut = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    setShowLogoutModal(false);

    let signOutError = null;
    try {
      // Use the authService signOut function which includes lastLogout tracking
      const { signOut: authSignOut } = await import(
        "@/src/services/authService"
      );
      await authSignOut();
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
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
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
      title: "Subscriptions",
      icon: "card-outline",
      onPress: handleSubscriptions,
    },
    {
      id: 4,
      title: "Terms and Conditions",
      icon: "document-text-outline",
      onPress: handleTermsAndConditions,
    },
    {
      id: 5,
      title: "Privacy Policy",
      icon: "shield-checkmark-outline",
      onPress: handlePrivacyPolicy,
    },
    {
      id: 6,
      title: "Logout",
      icon: "log-out-outline",
      onPress: handleSignOut,
    },
  ];

  // Show loading screen while authentication is loading
  if (authLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            Profile
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainerFull}>
          <ActivityIndicator size="large" color="#4361EE" />
          <Text style={[styles.loadingText, { color: theme.textPrimary }]}>
            Loading profile...
          </Text>
        </View>
      </View>
    );
  }

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
          {console.log("🔍 Profile - photoURL:", userData?.photoURL)}
          {userData?.photoURL ? (
            <Image
              source={{ uri: userData.photoURL }}
              style={styles.userPhoto}
              resizeMode="cover"
              onError={(error) => {
                console.log("🔍 Profile - Image load error:", error);
              }}
              onLoad={() => {
                console.log("🔍 Profile - Image loaded successfully");
              }}
            />
          ) : (
            <Ionicons name="person" size={40} color={theme.icon} />
          )}
        </View>
        <Text style={[styles.userName, { color: theme.textPrimary }]}>
          {userData?.displayName || "User"}
        </Text>
        <Text style={[styles.userEmail, { color: theme.text }]}>{email}</Text>
      </View>

      {/* Profile Options */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {profileOptions.map((option) => (
            <View key={option.id}>
              <Pressable
                style={[
                  styles.profileOption,
                  option.id === 6 && styles.signOutOption,
                ]}
                onPress={option.onPress}
                disabled={isLoggingOut && option.id === 6}
              >
                <Text
                  style={[
                    styles.profileOptionText,
                    {
                      color:
                        option.id === 6 ? theme.textError : theme.textPrimary,
                    },
                  ]}
                >
                  {option.title}
                </Text>
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={option.id === 6 ? theme.textError : theme.icon}
                />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        visible={showLogoutModal}
        onClose={handleCancelLogout}
        onConfirm={handleConfirmLogout}
        isLoading={isLoggingOut}
      />

      {/* Loading Overlay */}
      {isLoggingOut && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4361EE" />
            <Text style={styles.loadingText}>Signing out...</Text>
          </View>
        </View>
      )}
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
  userPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 200,
  },
  loadingText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "white",
    marginTop: 12,
  },
  loadingContainerFull: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
});
