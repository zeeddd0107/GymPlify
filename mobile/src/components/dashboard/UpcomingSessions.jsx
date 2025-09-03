import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";
import { useRouter } from "expo-router";

const UpcomingSessions = ({ upcomingSessions, colors }) => {
  const router = useRouter();

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
          <Pressable
            style={styles.bookSessionButton}
            onPress={() => router.push("/(tabs)/sessions")}
          >
            <Text style={styles.bookSessionButtonText}>Book Session</Text>
          </Pressable>
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
        <Pressable
          style={styles.viewAllButton}
          onPress={() => router.push("/(tabs)/sessions")}
        >
          <Text style={[styles.viewAllText, { color: colors.tint }]}>
            View all
          </Text>
        </Pressable>
      </View>

      {upcomingSessions.map((session) => {
        // Format the session date and time for display
        const sessionDate =
          session.scheduledDate || session.startTime || session.date;
        const dateToDisplay = sessionDate?.toDate
          ? sessionDate.toDate()
          : new Date(sessionDate);

        const formattedTime = dateToDisplay.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const isToday =
          dateToDisplay.toDateString() === new Date().toDateString();
        const isTomorrow =
          dateToDisplay.toDateString() ===
          new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();

        return (
          <View key={session.id} style={styles.sessionItem}>
            <View style={styles.dateTimeContainer}>
              <View style={styles.dateContainer}>
                <Text style={[styles.dayText, { color: colors.tint }]}>
                  {dateToDisplay.getDate()}
                </Text>
                <Text style={[styles.monthText, { color: colors.icon }]}>
                  {dateToDisplay.toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </Text>
              </View>
              <View style={styles.timeContainer}>
                <Text style={[styles.timeText, { color: colors.text }]}>
                  {session.title || "Workout Session"}
                </Text>
                <View style={styles.dateTimeInfo}>
                  <Text style={[styles.weekdayText, { color: colors.icon }]}>
                    {formattedTime}
                  </Text>
                  {(isToday || isTomorrow) && (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: isToday ? "#22c55e" : "#f59e0b" },
                      ]}
                    >
                      <Text style={styles.badgeText}>
                        {isToday ? "Today" : "Tomorrow"}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <View style={styles.sessionIndicator}>
              <View style={styles.indicatorDot} />
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 16,
    shadowColor: "#4d4d4d",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 20,
  },
  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
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
    marginBottom: 20,
  },
  bookSessionButton: {
    backgroundColor: "#4361EE",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  bookSessionButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 14,
    textAlign: "center",
  },
  sessionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D3D3D3",
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateContainer: {
    alignItems: "center",
    marginRight: 16,
    minWidth: 48,
    borderWidth: 2,
    borderColor: "#4361EE",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#f8fafc",
  },
  dayText: {
    fontFamily: Fonts.family.bold,
    fontSize: 20,
    lineHeight: 24,
  },
  monthText: {
    fontFamily: Fonts.family.medium,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timeContainer: {
    alignItems: "flex-start",
    flex: 1,
  },
  timeText: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
    marginBottom: 10,
    lineHeight: 22,
  },
  dateTimeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  weekdayText: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    color: "#64748b",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 11,
  },
  sessionIndicator: {
    marginLeft: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4361EE",
  },
});

export default UpcomingSessions;
