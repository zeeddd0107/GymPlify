import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

const ScheduledSessions = ({ sessions, loading }) => {
  if (loading) {
    return (
      <View style={styles.scheduledSessionsSection}>
        <Text style={styles.scheduledSessionsTitle}>Added Sessions</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading sessions...</Text>
        </View>
      </View>
    );
  }

  if (sessions.length === 0) {
    return null;
  }

  return (
    <View style={styles.scheduledSessionsSection}>
      <Text style={styles.scheduledSessionsTitle}>Added Sessions</Text>
      {sessions.map((session) => (
        <View key={session.id} style={styles.sessionCard}>
          <View style={styles.sessionAccent} />
          <View style={styles.sessionContent}>
            <View style={styles.sessionHeaderRow}>
              <View style={styles.sessionHeaderLeft}>
                <Ionicons name="calendar-outline" size={16} color="#4361EE" />
                <Text style={styles.sessionTitle}>
                  {session.dayName}, {session.dateDisplay}
                </Text>
              </View>
              <View style={styles.sessionBadge}>
                <Text style={styles.sessionBadgeText}>Upcoming</Text>
              </View>
            </View>
            <View style={styles.sessionMetaRow}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.sessionMetaText}>{session.time}</Text>
            </View>
            <View style={styles.sessionMetaRow}>
              <Ionicons name="fitness" size={16} color="#4361EE" />
              <Text style={[styles.sessionMetaText, styles.workoutTypeText]}>
                {session.workoutType}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  scheduledSessionsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    color: "#666",
  },
  scheduledSessionsTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
    marginBottom: 12,
  },
  sessionCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sessionAccent: {
    width: 6,
    backgroundColor: "#4361EE",
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  sessionContent: {
    flex: 1,
    padding: 14,
  },
  sessionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sessionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sessionTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
  sessionBadge: {
    backgroundColor: "#E8EDFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  sessionBadgeText: {
    fontFamily: Fonts.family.medium,
    fontSize: 12,
    color: "#4361EE",
  },
  sessionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  sessionMetaText: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    color: "#4B5563",
  },
  workoutTypeText: {
    fontFamily: Fonts.family.semiBold,
    color: "#4361EE",
  },
});

export default ScheduledSessions;
