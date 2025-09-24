import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Fonts } from "@/src/constants/Fonts";

export default function CatchAllScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Start the loading animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Redirect to home after 2 seconds
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, fadeAnim, scaleAnim]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <ActivityIndicator size="large" color="#2a4eff" />
          <Text style={styles.title}>Signing you in...</Text>
          <Text style={styles.subtitle}>
            Please wait while we set up your account
          </Text>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.family.bold,
    color: "#1f2937",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.family.regular,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
