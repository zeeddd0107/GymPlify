import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Image,
  Alert,
  RefreshControl,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { firebase } from "@/src/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import { Fonts } from "@/src/constants/Fonts";
import { useColorScheme } from "@/src/hooks/useColorScheme";
import QRCode from "react-native-qrcode-svg";
import FloatingActionButton from "@/src/components/FloatingActionButton";
import {
  fetchMembershipData,
  fetchAttendanceData,
  fetchUpcomingSessions,
  fetchActiveSubscriptions,
  fetchNotifications,
  getWorkoutTip,
  renewMembership,
  buyMoreSessions,
} from "@/src/services/dashboardService";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Dashboard data state
  const [membershipData, setMembershipData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [workoutTip, setWorkoutTip] = useState(null);

  useEffect(() => {
    fetchUserData();
    fetchDashboardData();
  }, []);

  const fetchUserData = async () => {
    try {
      let userEmail = firebase.auth().currentUser?.email;
      if (!userEmail) {
        const userStr = await AsyncStorage.getItem("@user");
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            userEmail = userObj.email || userObj.name || "";
          } catch {
            // ignore JSON parse errors
          }
        }
      }
      setEmail(userEmail || "");

      // TODO: Fetch actual user data from Firebase
      setUserData({
        name: "John Doe",
        email: userEmail,
        profilePicture: null,
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) return;

      // Fetch all dashboard data in parallel
      const [membership, attendance, sessions, subs, notifs, tip] =
        await Promise.all([
          fetchMembershipData(user.uid),
          fetchAttendanceData(user.uid),
          fetchUpcomingSessions(user.uid),
          fetchActiveSubscriptions(user.uid),
          fetchNotifications(user.uid),
          Promise.resolve(getWorkoutTip()),
        ]);

      setMembershipData(membership);
      setAttendanceData(attendance);
      setUpcomingSessions(sessions);
      setSubscriptions(subs);
      setNotifications(notifs);
      setWorkoutTip(tip);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      Alert.alert("Error", "Failed to load dashboard data");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserData(), fetchDashboardData()]);
    setRefreshing(false);
  };

  const handleProfileSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await firebase.auth().signOut();
            setShowProfile(false);
            router.replace("/auth");
          } catch (error) {
            Alert.alert("Error", "Failed to sign out: " + error.message);
          }
        },
      },
    ]);
  };

  const handleProfileOptionPress = (option) => {
    // TODO: Implement navigation to specific screens
    Alert.alert("Coming Soon", `${option} feature will be available soon!`);
  };

  const getMembershipStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "#22c55e";
      case "Expiring Soon":
        return "#f59e0b";
      case "Expired":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  const getProgressPercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  const handleRenewMembership = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        Alert.alert("Error", "Please log in to renew membership");
        return;
      }

      const result = await renewMembership(user.uid, membershipData.planId);
      if (result.success) {
        Alert.alert("Success", "Membership renewed successfully!");
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      Alert.alert("Error", "Failed to renew membership: " + error.message);
    }
  };

  const handleBuyMoreSessions = async (subscriptionType) => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        Alert.alert("Error", "Please log in to purchase sessions");
        return;
      }

      const result = await buyMoreSessions(user.uid, subscriptionType, 5);
      if (result.success) {
        Alert.alert("Success", "Sessions purchased successfully!");
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      Alert.alert("Error", "Failed to purchase sessions: " + error.message);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const userName = userData?.name?.split(" ")[0] || "User";

    if (hour < 12) {
      return `Good morning, ${userName} 🌅`;
    } else if (hour < 17) {
      return `Good afternoon, ${userName} ☀️`;
    } else {
      return `Good evening, ${userName} 🌙`;
    }
  };

  const renderMembershipOverview = () => {
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
        <View style={styles.cardHeader}>
          {/* Profile section removed as requested */}
        </View>

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
              onPress={() => handleRenewMembership()}
            >
              <Text style={styles.renewalButtonText}>Renew Membership</Text>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  const renderAttendanceSummary = () => {
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
      <View style={[styles.card, { backgroundColor: colors.background }]}>
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
      </View>
    );
  };

  const renderUpcomingSessions = () => {
    if (!upcomingSessions.length) {
      return (
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Upcoming Sessions
            </Text>
            <Pressable style={styles.viewAllButton}>
              <Text style={[styles.viewAllText, { color: colors.tint }]}>
                View All
              </Text>
            </Pressable>
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
          <Pressable style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: colors.tint }]}>
              View All
            </Text>
          </Pressable>
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

  const renderActiveSubscriptions = () => {
    if (!subscriptions.length) {
      return (
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Active Subscriptions
          </Text>
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={48} color={colors.icon} />
            <Text style={[styles.emptyStateText, { color: colors.icon }]}>
              No active subscriptions
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.icon }]}>
              Purchase a package to get started
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          Active Subscriptions
        </Text>

        {subscriptions.map((subscription) => (
          <View key={subscription.id} style={styles.subscriptionItem}>
            <View style={styles.subscriptionInfo}>
              <Text style={[styles.subscriptionName, { color: colors.text }]}>
                {subscription.name}
              </Text>
              <Text
                style={[styles.subscriptionDetails, { color: colors.icon }]}
              >
                {subscription.remaining} of {subscription.total} sessions
                remaining
              </Text>
              <Text style={[styles.subscriptionExpiry, { color: colors.icon }]}>
                Valid until: {subscription.validUntil}
              </Text>
            </View>
            <View style={styles.subscriptionProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${(subscription.remaining / subscription.total) * 100}%`,
                      backgroundColor: colors.tint,
                    },
                  ]}
                />
              </View>
              <Pressable
                style={styles.buyMoreButton}
                onPress={() => handleBuyMoreSessions(subscription.type)}
              >
                <Text style={styles.buyMoreButtonText}>Buy More</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderNotifications = () => {
    if (!notifications.length) {
      return (
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Notifications
            </Text>
          </View>
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-outline"
              size={48}
              color={colors.icon}
            />
            <Text style={[styles.emptyStateText, { color: colors.icon }]}>
              No notifications
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.icon }]}>
              You're all caught up!
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Notifications
          </Text>
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {notifications.filter((n) => n.unread).length}
            </Text>
          </View>
        </View>

        {notifications.slice(0, 2).map((notification) => (
          <View key={notification.id} style={styles.notificationItem}>
            {notification.unread && <View style={styles.unreadDot} />}
            <View style={styles.notificationContent}>
              <Text style={[styles.notificationTitle, { color: colors.text }]}>
                {notification.title}
              </Text>
              <Text
                style={[styles.notificationMessage, { color: colors.icon }]}
              >
                {notification.message}
              </Text>
              <Text style={[styles.notificationTime, { color: colors.icon }]}>
                {notification.timestamp}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderWorkoutTip = () => {
    if (!workoutTip) {
      return null;
    }

    return (
      <View style={[styles.card, { backgroundColor: colors.background }]}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>
          {workoutTip.title}
        </Text>
        <Text style={[styles.workoutTipText, { color: colors.icon }]}>
          {workoutTip.tip}
        </Text>
      </View>
    );
  };

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
        {renderMembershipOverview()}
        {renderAttendanceSummary()}
        {renderUpcomingSessions()}
        {renderActiveSubscriptions()}
        {renderNotifications()}
        {renderWorkoutTip()}
      </ScrollView>

      <FloatingActionButton
        onPress={() => setShowQR(!showQR)}
        icon="qr-code"
        position="bottom-right"
        color="#22c55e"
      />

      {/* Profile Modal */}
      <Modal
        visible={showProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowProfile(false)}
      >
        <View
          style={[
            styles.profileModalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Header */}
          <View style={styles.profileModalHeader}>
            <Pressable
              style={styles.profileModalCloseButton}
              onPress={() => setShowProfile(false)}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
            <Text
              style={[styles.profileModalHeaderTitle, { color: colors.text }]}
            >
              Profile
            </Text>
            <View style={styles.profileModalPlaceholder} />
          </View>

          {/* Profile Options */}
          <ScrollView
            style={styles.profileModalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.profileOptionsContainer}>
              {[
                {
                  id: 1,
                  title: "Account Transaction History",
                  icon: "receipt-outline",
                  onPress: () =>
                    handleProfileOptionPress("Account Transaction History"),
                },
                {
                  id: 2,
                  title: "GymPlify Rewards",
                  icon: "star-outline",
                  onPress: () => handleProfileOptionPress("GymPlify Rewards"),
                },
                {
                  id: 3,
                  title: "Personal",
                  icon: "person-outline",
                  onPress: () => handleProfileOptionPress("Personal"),
                },
                {
                  id: 4,
                  title: "Payment Methods",
                  icon: "card-outline",
                  onPress: () => handleProfileOptionPress("Payment Methods"),
                },
                {
                  id: 5,
                  title: "Refund Unused Balance",
                  icon: "card-outline",
                  onPress: () =>
                    handleProfileOptionPress("Refund Unused Balance"),
                },
                {
                  id: 6,
                  title: "Settings",
                  icon: "settings-outline",
                  onPress: () => handleProfileOptionPress("Settings"),
                },
                {
                  id: 7,
                  title: "Sign out",
                  icon: "log-out-outline",
                  onPress: handleProfileSignOut,
                },
              ].map((option, index) => (
                <View key={option.id}>
                  <Pressable
                    style={styles.profileOptionItem}
                    onPress={option.onPress}
                  >
                    <Text
                      style={[styles.profileOptionText, { color: colors.text }]}
                    >
                      {option.title}
                    </Text>
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={colors.icon}
                    />
                  </Pressable>
                  {index < 6 && (
                    <View
                      style={[
                        styles.profileSeparator,
                        { backgroundColor: colors.icon },
                      ]}
                    />
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
    marginBottom: 2,
  },
  userEmail: {
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
