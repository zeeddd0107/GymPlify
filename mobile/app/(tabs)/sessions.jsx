import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import { useSessions } from "@/src/hooks";
import { SessionCard, SessionDetailModal } from "@/src/components";

export default function SessionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [showWorkoutSchedulePopup, setShowWorkoutSchedulePopup] =
    useState(false);

  const { sessions, loading, refreshing, error, onRefresh, deleteSession } =
    useSessions();

  const handleSessionPress = (session) => {
    console.log("Session pressed:", session);
    console.log("Session ID in handleSessionPress:", session?.id);
    setSelectedSession(session);
    setIsModalVisible(true);
  };

  const handleCreateSession = () => {
    router.push("/create-session");
  };

  const handleDeleteSession = async (sessionId) => {
    const result = await deleteSession(sessionId);
    if (!result.success) {
      // You could show an error message here if needed
      console.error("Failed to delete session:", result.error);
    }
  };

  const handleEditSession = (session) => {
    // Navigate to edit session page with session ID
    console.log("Edit session called with:", session);
    console.log("Session ID:", session?.id);
    console.log(
      "Session object keys:",
      session ? Object.keys(session) : "No session",
    );

    if (!session || !session.id) {
      console.error("Invalid session object:", session);
      return;
    }

    setIsModalVisible(false);
    setSelectedSession(null);

    // Use a more robust navigation approach
    const url = `/edit-session?sessionId=${encodeURIComponent(session.id)}`;
    console.log("Navigating to:", url);
    router.push(url);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Sessions
          </Text>
          <View style={styles.headerSide} />
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
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Sessions
        </Text>
        <View style={styles.headerSide} />
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

      {/* Create Session Floating Button - Always at bottom right */}
      <View style={styles.createSessionButtonContainer}>
        <Pressable
          style={styles.createSessionButton}
          onPress={handleCreateSession}
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {/* Workout Schedule Popup */}
      <Modal
        visible={showWorkoutSchedulePopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowWorkoutSchedulePopup(false)}
      >
        <Pressable
          style={styles.popupOverlay}
          onPress={() => setShowWorkoutSchedulePopup(false)}
        >
          <Pressable
            style={styles.workoutSchedulePopup}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.popupHeader}>
              <View style={styles.headerContent}>
                <Ionicons name="fitness-outline" size={28} color="#4361EE" />
                <Text style={styles.popupTitle}>Weekly Workouts</Text>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={() => setShowWorkoutSchedulePopup(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </Pressable>
            </View>

            {/* Workout Legend Grid */}
            <View style={styles.workoutLegendContainer}>
              <View style={styles.legendGrid}>
                <View style={styles.legendItem}>
                  <View style={styles.legendIconContainer}>
                    <Ionicons
                      name="fitness-outline"
                      size={12}
                      color="#FF6B6B"
                    />
                  </View>
                  <Text style={styles.legendText}>Monday: Chest</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={styles.legendIconContainer}>
                    <Ionicons name="body-outline" size={12} color="#4ECDC4" />
                  </View>
                  <Text style={styles.legendText}>Tuesday: Lower Body</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={styles.legendIconContainer}>
                    <Ionicons
                      name="fitness-outline"
                      size={12}
                      color="#45B7D1"
                    />
                  </View>
                  <Text style={styles.legendText}>Wednesday: Back</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={styles.legendIconContainer}>
                    <Ionicons name="repeat-outline" size={12} color="#96CEB4" />
                  </View>
                  <Text style={styles.legendText}>Thursday: Circuit</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={styles.legendIconContainer}>
                    <Ionicons
                      name="fitness-outline"
                      size={12}
                      color="#FFEAA7"
                    />
                  </View>
                  <Text style={styles.legendText}>Friday: Shoulders</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={styles.legendIconContainer}>
                    <Ionicons name="body-outline" size={12} color="#DDA0DD" />
                  </View>
                  <Text style={styles.legendText}>Saturday: Lower Body</Text>
                </View>

                <View style={styles.legendItem}>
                  <View style={styles.legendIconContainer}>
                    <Ionicons name="bed-outline" size={12} color="#98D8C8" />
                  </View>
                  <Text style={styles.legendText}>Sunday: Rest</Text>
                </View>
              </View>
            </View>

            {/* Legend Description */}
            <View style={styles.legendDescription}>
              <Text style={styles.descriptionTitle}>Weekly Training Split</Text>
              <Text style={styles.descriptionText}>
                Each day focuses on specific muscle groups for optimal recovery
                and growth
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Session Detail Modal */}
      <SessionDetailModal
        visible={isModalVisible}
        session={selectedSession}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedSession(null);
        }}
        onDelete={handleDeleteSession}
        onEdit={handleEditSession}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerSide: {
    width: 40,
  },
  headerTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 20,
    flex: 1,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  createSessionButtonContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 1000,
  },
  createSessionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4361EE",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  // Popup styles
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  workoutSchedulePopup: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    maxWidth: "95%",
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
  },
  popupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F0FE",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  popupTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 22,
    color: "#1A1A1A",
    marginLeft: 12,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  // Legend styles
  workoutLegendContainer: {
    marginBottom: 24,
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 8,
  },
  legendIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f8f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  legendText: {
    fontFamily: Fonts.family.regular,
    fontSize: 12,
    color: "212427",
    flex: 1,
  },
  // Legend description
  legendDescription: {
    backgroundColor: "#F8FAFF",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E8F0FE",
  },
  descriptionTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 16,
    color: "#4361EE",
    marginBottom: 8,
    textAlign: "center",
  },
  descriptionText: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});
