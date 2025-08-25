import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

const AttendanceSummary = ({
  attendanceData,
  colors,
  getProgressPercentage,
  onPress,
}) => {
  if (!attendanceData) {
    return (
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={24} color={colors.icon} />
          <Text style={[styles.loadingText, { color: colors.icon }]}>
            Loading attendance data...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="View full attendance"
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.background, opacity: pressed ? 0.95 : 1 },
      ]}
    >
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        Attendance Summary
      </Text>

      <View style={styles.attendanceGrid}>
        <View style={styles.attendanceItem}>
          <Text style={[styles.attendanceNumber, { color: colors.tint }]}>
            {attendanceData.visitsThisWeek}
          </Text>
          <Text style={[styles.attendanceLabel, { color: colors.icon }]}>
            This Week
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${getProgressPercentage(attendanceData.visitsThisWeek, attendanceData.weeklyGoal)}%`,
                  backgroundColor: colors.tint,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.attendanceItem}>
          <Text style={[styles.attendanceNumber, { color: colors.tint }]}>
            {attendanceData.visitsThisMonth}
          </Text>
          <Text style={[styles.attendanceLabel, { color: colors.icon }]}>
            This Month
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${getProgressPercentage(attendanceData.visitsThisMonth, attendanceData.monthlyGoal)}%`,
                  backgroundColor: colors.tint,
                },
              ]}
            />
          </View>
        </View>
      </View>

      <Text style={[styles.lastCheckIn, { color: colors.icon }]}>
        Last check-in: {attendanceData.lastCheckIn}
      </Text>
    </Pressable>
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
  cardTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 20,
    marginBottom: 10,
  },
  attendanceGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  attendanceItem: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  attendanceNumber: {
    fontFamily: Fonts.family.bold,
    fontSize: 32,
    marginBottom: 4,
  },
  attendanceLabel: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "#f3f4f6",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  lastCheckIn: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    marginLeft: 12,
  },
});

export default AttendanceSummary;
