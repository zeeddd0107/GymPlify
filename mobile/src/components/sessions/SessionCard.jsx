import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

const STATUS_COLORS = {
  scheduled: "#2196F3",
  completed: "#4CAF50",
  cancelled: "#B0B0B0",
  missed: "#FF6B6B",
};

const SessionCard = ({ session, onPress }) => {
  const getWorkoutIcon = (workoutType) => {
    switch (workoutType.toLowerCase()) {
      case "chest":
        return "barbell-outline";
      case "back":
        return "body-outline";
      case "lower body":
        return "walk-outline";
      case "shoulder":
        return "fitness-outline";
      case "circuit":
        return "repeat-outline";
      default:
        return "fitness-outline";
    }
  };

  const getWorkoutColor = (workoutType) => {
    switch (workoutType.toLowerCase()) {
      case "chest":
        return "#FF6B6B";
      case "back":
        return "#45B7D1";
      case "lower body":
        return "#4ECDC4";
      case "shoulder":
        return "#FFEAA7";
      case "circuit":
        return "#96CEB4";
      default:
        return "#DDA0DD";
    }
  };

  const statusColor = STATUS_COLORS[session.status] || "#B0B0B0";
  const accentColor = getWorkoutColor(session.workoutType);
  const normalizedTitle = (session?.title || "").trim();
  const isPlaceholderTitle = /^untitled session$/i.test(normalizedTitle);
  const titleToShow =
    normalizedTitle && !isPlaceholderTitle
      ? normalizedTitle
      : session.workoutType;

  return (
    <Pressable
      style={[styles.card, { borderLeftColor: accentColor }]}
      onPress={onPress}
    >
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: accentColor }]}>
          <Ionicons
            name={getWorkoutIcon(session.workoutType)}
            size={32}
            color="#fff"
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.workoutType}>{titleToShow}</Text>
          <View style={styles.detailBlock}>
            <View style={styles.detailRowInline}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color="#888"
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>{session.dateDisplay}</Text>
            </View>
            <View style={styles.detailRowInline}>
              <Ionicons
                name="time-outline"
                size={16}
                color="#888"
                style={styles.metaIcon}
              />
              <Text style={styles.metaText}>{session.time}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 6,
    minHeight: 80,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  workoutType: {
    fontFamily: Fonts.family.bold,
    fontSize: 18,
    color: "#222",
    marginBottom: 6,
    textTransform: "capitalize",
  },
  detailBlock: {
    gap: 4,
  },
  detailRowInline: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    marginRight: 6,
  },
  metaText: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12,
    minWidth: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    fontFamily: Fonts.family.medium,
    fontSize: 13,
    color: "#fff",
    textTransform: "capitalize",
  },
});

export default SessionCard;
