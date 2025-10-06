import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

const MembershipOverview = ({
  membershipData,
  colors,
  getMembershipStatusColor,
  getDaysLeftFromSubscriptions,
}) => {
  if (!membershipData) {
    return null;
  }

  const daysLeft = getDaysLeftFromSubscriptions();

  // Format the endDate from the subscription
  const formatEndDate = (endDate) => {
    if (!endDate) return "N/A";

    try {
      // Handle Firestore timestamp
      const date = endDate.toDate ? endDate.toDate() : new Date(endDate);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    } catch (error) {
      console.error("Error formatting end date:", error);
      return "N/A";
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <View style={styles.membershipStatus}>
        <View style={styles.statusRow}>
          <Text style={[styles.statusLabel, { color: colors.text }]}>
            Membership Status
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: getMembershipStatusColor(
                  membershipData.status,
                ),
              },
            ]}
          >
            <Text style={styles.statusText}>{membershipData.status}</Text>
          </View>
        </View>

        {typeof daysLeft === "number" && daysLeft > 0 ? (
          <Text style={[styles.daysRemainingText, { color: colors.tint }]}>
            {daysLeft} days remaining
          </Text>
        ) : daysLeft === 0 ? (
          <Text style={[styles.daysRemainingText, { color: "#ef4444" }]}>
            Expires today
          </Text>
        ) : daysLeft < 0 ? (
          <Text style={[styles.daysRemainingText, { color: "#ef4444" }]}>
            Expired {Math.abs(daysLeft)} days ago
          </Text>
        ) : null}

        <Text style={[styles.expiryText, { color: colors.icon }]}>
          Expires: {formatEndDate(membershipData.endDate)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 20,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 12,
  },
  expiryText: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    marginTop: 2,
  },
  daysRemainingText: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 14,
    marginTop: 8,
  },
});

export default MembershipOverview;
