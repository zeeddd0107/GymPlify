import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import { useColorScheme } from "@/src/hooks";
import Logger from "@/src/utils/logger";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Only log when state changes
  if (user && !loading) {
    Logger.render("AuthGuard", "User authenticated, showing app");
  } else if (!user && !loading) {
    Logger.render("AuthGuard", "No user, redirecting to auth");
  }

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // User is not authenticated, redirect to auth
        router.replace("/auth");
      }
      // If user is authenticated, don't redirect - let them stay on current screen
    }
  }, [user, loading, router]);

  // Show loading screen while checking authentication state
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <View style={styles.content}>
          <ActivityIndicator size="large" color={colors.tint} />
          <View style={styles.textContainer}>
            <View style={styles.textWrapper}>
              <View style={styles.textLine} />
              <View style={styles.textLine} />
              <View style={styles.textLine} />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // Always render children - the navigation logic handles the routing
  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  textContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  textWrapper: {
    alignItems: "center",
  },
  textLine: {
    width: 200,
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    marginVertical: 2,
  },
});
