import React, { useState, useEffect } from "react";
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
import { useTheme } from "@/src/context/useTheme";
import { Fonts } from "@/src/constants/Fonts";
import { firebase } from "@/src/services/firebase";

export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userEmail = await AsyncStorage.getItem("userEmail");
      setEmail(userEmail || "");

      const user = firebase.auth().currentUser;
      if (user) {
        setUserData({
          email: user.email,
          displayName: user.displayName,
          uid: user.uid,
        });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleProfileOptionPress = (option) => {
    Alert.alert(
      "Coming Soon",
      `${option} functionality will be available soon.`,
    );
  };

  const handleMyQRCode = () => {
    router.push("/my-qr-code");
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
          try {
            await firebase.auth().signOut();
            await AsyncStorage.clear();
            router.replace("/auth");
          } catch (error) {
            console.error("Error signing out:", error);
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const profileOptions = [
    {
      id: 1,
      title: "My QR Code",
      icon: "qr-code-outline",
      onPress: handleMyQRCode,
    },
    {
      id: 2,
      title: "Account Transaction History",
      icon: "receipt-outline",
      onPress: () => handleProfileOptionPress("Account Transaction History"),
    },
    {
      id: 3,
      title: "GymPlify Rewards",
      icon: "star-outline",
      onPress: () => handleProfileOptionPress("GymPlify Rewards"),
    },
    {
      id: 4,
      title: "Personal",
      icon: "person-outline",
      onPress: () => handleProfileOptionPress("Personal"),
    },
    {
      id: 5,
      title: "Payment Methods",
      icon: "card-outline",
      onPress: () => handleProfileOptionPress("Payment Methods"),
    },
    {
      id: 6,
      title: "Notifications",
      icon: "notifications-outline",
      onPress: () => handleProfileOptionPress("Notifications"),
    },
    {
      id: 7,
      title: "Privacy",
      icon: "shield-outline",
      onPress: () => handleProfileOptionPress("Privacy"),
    },
    {
      id: 8,
      title: "Sign Out",
      icon: "log-out-outline",
      onPress: handleSignOut,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* User Info */}
      <View
        style={[styles.userInfoSection, { backgroundColor: theme.background }]}
      >
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={40} color={theme.icon} />
        </View>
        <Text style={[styles.userName, { color: theme.text }]}>
          {userData?.displayName || "User"}
        </Text>
        <Text style={[styles.userEmail, { color: theme.icon }]}>{email}</Text>
      </View>

      {/* Profile Options */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.optionsContainer}>
          {profileOptions.map((option, index) => (
            <View key={option.id}>
              <Pressable
                style={[
                  styles.profileOption,
                  option.id === 8 && styles.signOutOption,
                ]}
                onPress={option.onPress}
              >
                <Text
                  style={[
                    styles.profileOptionText,
                    { color: option.id === 8 ? "#FF6B6B" : theme.text },
                  ]}
                >
                  {option.title}
                </Text>
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={option.id === 8 ? "#FF6B6B" : theme.icon}
                />
              </Pressable>
              {index < profileOptions.length - 1 && (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: theme.icon + "20" },
                  ]}
                />
              )}
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
    fontSize: 20,
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
  },
  profileOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  signOutOption: {
    marginTop: 20,
  },
  profileOptionText: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
  },
  separator: {
    height: 1,
    opacity: 0.3,
  },
});
