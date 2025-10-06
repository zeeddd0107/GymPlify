import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/src/context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import { useColorScheme } from "@/src/hooks";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Only log when state changes
  if (user && !loading) {
    console.log("🛡️ AuthGuard: User authenticated, showing app");
  } else if (!user && !loading) {
    console.log("🛡️ AuthGuard: No user, redirecting to auth");
  }

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.replace("/(tabs)");
      } else {
        // User is not authenticated, redirect to auth
        router.replace("/auth");
      }
    }
  }, [user, loading, router]);

  // Add a small delay to prevent rapid navigation changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading && !user) {
        // console.log("🛡️ AuthGuard: Timeout - ensuring user is redirected to auth");
        router.replace("/auth");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [loading, user, router]);

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
