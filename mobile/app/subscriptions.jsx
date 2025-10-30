import React from "react";
import { StyleSheet, Text, View, Pressable, ScrollView } from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import { SubscriptionPlans } from "@/src/components";

export default function SubscriptionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Check if user came from registration (new user)
  const fromRegistration = params?.fromRegistration === 'true';

  // Handle back button navigation
  const handleBack = () => {
    if (fromRegistration) {
      // New users: go to dashboard instead of back to registration
      router.replace('/(tabs)');
    } else {
      // Existing users: normal back navigation
      router.back();
    }
  };

  // Define colors for SubscriptionPlans component
  const colors = {
    background: theme.background,
    text: theme.text,
    textSecondary: theme.textSecondary,
    tint: theme.tint,
    icon: theme.icon,
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </Pressable>
        <View style={styles.headerSide} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <SubscriptionPlans
          colors={colors}
          onSelectPlan={(plan) => {
            console.log("Selected plan:", plan);
            // TODO: Implement subscription purchase logic
          }}
        />
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
    padding: 8,
  },
  headerSide: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
});
