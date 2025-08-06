import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { Fonts } from "@/src/constants/Fonts";

export default function MembershipOverview({
  colors,
  membershipData,
  showQR,
  email,
  getMembershipStatusColor,
  handleRenewMembership,
}) {
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
  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <View style={styles.cardHeader} />
      {showQR && (
        <View style={styles.qrContainer}>
          <QRCode
            value={`gymplify-checkin-${email}`}
            size={120}
            color={colors.text}
            backgroundColor={colors.background}
          />
          <Text style={[styles.qrText, { color: colors.icon }]}>
            Show this QR code at the gym entrance
          </Text>
        </View>
      )}
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
        <Text style={[styles.planText, { color: colors.text }]}>
          {membershipData.plan}
        </Text>
        <Text style={[styles.expiryText, { color: colors.icon }]}>
          Expires: {membershipData.expiresAt}
        </Text>
        {membershipData.daysUntilExpiry <= 30 && (
          <Pressable
            style={styles.renewalButton}
            onPress={handleRenewMembership}
          >
            <Text style={styles.renewalButtonText}>Renew Membership</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
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
  qrContainer: {
    alignItems: "center",
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginTop: 16,
  },
  qrText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  membershipStatus: {
    marginTop: 16,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusLabel: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
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
  planText: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    marginBottom: 4,
  },
  expiryText: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    marginBottom: 12,
  },
  renewalButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  renewalButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 14,
  },
});
