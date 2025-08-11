import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

const UpcomingSessions = ({ upcomingSessions, colors }) => {
  if (!upcomingSessions.length) {
    return (
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Upcoming Sessions
          </Text>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color={colors.icon} />
          <Text style={[styles.emptyStateText, { color: colors.icon }]}>
            No upcoming sessions
          </Text>
          <Text style={[styles.emptyStateSubtext, { color: colors.icon }]}>
            Book a session to get started
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Upcoming Sessions
        </Text>
      </View>

      {upcomingSessions.map((session) => (
        <View key={session.id} style={styles.sessionItem}>
          <View style={styles.sessionInfo}>
            <Text style={[styles.sessionType, { color: colors.text }]}>
              {session.type}
            </Text>
            <Text style={[styles.sessionCoach, { color: colors.icon }]}>
              with {session.coach}
            </Text>
            <Text style={[styles.sessionTime, { color: colors.icon }]}>
              {session.date} at {session.time} ({session.duration})
            </Text>
          </View>
          <View style={styles.sessionActions}>
            <Pressable style={styles.joinButton}>
              <Text style={styles.joinButtonText}>Join</Text>
            </Pressable>
            <Pressable style={styles.cancelButton}>
              <Text style={[styles.cancelButtonText, { color: colors.icon }]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 20,
    marginBottom: 10,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    textAlign: "center",
  },
  sessionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionType: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    marginBottom: 2,
  },
  sessionCoach: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    marginBottom: 2,
  },
  sessionTime: {
    fontFamily: Fonts.family.regular,
    fontSize: 12,
  },
  sessionActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  joinButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  joinButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 12,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelButtonText: {
    fontFamily: Fonts.family.regular,
    fontSize: 12,
  },
});

export default UpcomingSessions;
