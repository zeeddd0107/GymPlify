import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Modal,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import { Fonts } from "@/src/constants/Fonts";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import MembershipOverview from "@/src/components/MembershipOverview";
import useHomeDashboard from "@/src/hooks/useHomeDashboard";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const {
    email,
    refreshing,
    showQR,
    setShowQR,
    setShowProfile,
    membershipData,
    attendanceData,
    onRefresh,
    getMembershipStatusColor,
    handleRenewMembership,
    getGreeting,
  } = useHomeDashboard(router);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.appBar}>
        {/* Top Section - Icons */}
        <View style={styles.topSection}>
          <Pressable
            style={styles.profileButton}
            onPress={() => setShowProfile(true)}
          >
            <Ionicons name="person-circle-outline" size={32} color="white" />
          </Pressable>
          <View style={styles.rightIcons}>
            <Pressable style={styles.iconButton}>
              <Ionicons name="settings-outline" size={28} color="white" />
            </Pressable>
            <Pressable style={styles.iconButton}>
              <Ionicons name="mail-outline" size={28} color="white" />
            </Pressable>
          </View>
        </View>
        {/* Bottom Section - Greeting */}
        <View style={styles.bottomSection}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
        </View>
      </View>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <MembershipOverview
          colors={colors}
          membershipData={membershipData}
          attendanceData={attendanceData}
          showQR={showQR}
          setShowQR={setShowQR}
          email={email}
          getMembershipStatusColor={getMembershipStatusColor}
          handleRenewMembership={handleRenewMembership}
        />
        {/* ... keep rendering other cards/components as before ... */}
      </ScrollView>
      <FloatingActionButton
        onPress={() => setShowQR(!showQR)}
        icon="qr-code"
        position="bottom-right"
        color="#22c55e"
      />
      {/* Profile Modal and other UI remain unchanged */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    backgroundColor: "#4361EE",
    //backgroundColor: "#0f4c3a", // Dark teal background
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  profileButton: {
    padding: 5,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 10,
    marginLeft: 8,
  },
  bottomSection: {
    alignItems: "flex-start",
  },
  greetingText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
    marginBottom: 16,
  },
  cardTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 20,
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  workoutSummarySection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  workoutIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
    marginBottom: 2,
  },
  workoutSubtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
  },
  qrButton: {
    padding: 8,
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
  viewAllButton: {
    padding: 4,
  },
  viewAllText: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 14,
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
  subscriptionItem: {
    marginBottom: 16,
  },
  subscriptionInfo: {
    marginBottom: 8,
  },
  subscriptionName: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    marginBottom: 2,
  },
  subscriptionDetails: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    marginBottom: 2,
  },
  subscriptionExpiry: {
    fontFamily: Fonts.family.regular,
    fontSize: 12,
  },
  subscriptionProgress: {
    flexDirection: "row",
    alignItems: "center",
  },
  buyMoreButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  buyMoreButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 12,
  },
  notificationBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "white",
    fontFamily: Fonts.family.bold,
    fontSize: 12,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
    marginRight: 12,
    marginTop: 6,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    marginBottom: 2,
  },
  notificationMessage: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontFamily: Fonts.family.regular,
    fontSize: 12,
  },
  workoutTipText: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    lineHeight: 24,
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
  // Profile Modal Styles
  profileModalContainer: {
    flex: 1,
  },
  profileModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  profileModalCloseButton: {
    padding: 8,
  },
  profileModalHeaderTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 24,
  },
  profileModalPlaceholder: {
    width: 40,
  },
  profileModalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileOptionsContainer: {
    marginTop: 20,
  },
  profileOptionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  profileOptionText: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
  },
  profileSeparator: {
    height: 1,
    opacity: 0.2,
  },
});
