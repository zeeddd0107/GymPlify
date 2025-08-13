import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import { useSessions } from "@/src/hooks";
import { SessionCard } from "@/src/components";

export default function SessionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const { sessions, loading, refreshing, error, onRefresh } = useSessions();

  const handleSessionPress = (session) => {
    // Handle session selection if needed
    console.log("Session selected:", session);
  };

  const handleCreateSession = () => {
    router.push("/create-session");
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Sessions
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading sessions...
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
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Sessions
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.scrollContentContainer}
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF6B6B" />
            <Text style={[styles.errorText, { color: theme.text }]}>
              Error loading sessions
            </Text>
            <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>
              {error}
            </Text>
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#CCC" />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Sessions Yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Book your first workout session to get started
            </Text>
          </View>
        ) : (
          <View style={styles.sessionsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Your Sessions
            </Text>
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onPress={() => handleSessionPress(session)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Create Session Button */}
      <View
        style={[
          styles.floatingButtonContainer,
          { paddingBottom: insets.bottom + 15 },
        ]}
      >
        <Pressable
          style={styles.createSessionButton}
          onPress={handleCreateSession}
        >
          <Text style={styles.createSessionButtonText}>Create Session</Text>
        </Pressable>
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
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 22,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 72, // Enough space for the floating button
  },
  createSessionButton: {
    backgroundColor: "#4361EE",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingButtonContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 15,
  },
  createSessionButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
  },
  sessionsContainer: {
    marginHorizontal: 20,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 24,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 20,
    marginBottom: 16,
    marginTop: 8,
  },
});
