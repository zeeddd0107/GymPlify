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
    return (
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={24} color={colors.icon} />
          <Text style={[styles.loadingText, { color: colors.icon }]}>
            Loading membership data...
          </Text>
        </View>
      </View>
    );
  }

  const daysLeft = getDaysLeftFromSubscriptions();

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
          Expires: {membershipData.expiresAt}
        </Text>
      </View>
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

export default MembershipOverview;
