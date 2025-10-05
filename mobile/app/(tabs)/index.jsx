import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import { Fonts } from "@/src/constants/Fonts";
import { useColorScheme } from "@/src/hooks";
import { FloatingActionButton } from "@/src/components";
import {
  MembershipOverview,
  AttendanceSummary,
  UpcomingSessions,
  WorkoutTip,
} from "@/src/components/dashboard";
import SubscriptionPlans from "@/src/components/dashboard/SubscriptionPlans";
import { useDashboard } from "@/src/hooks";

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  const {
    refreshing,
    showQR,
    email,
    membershipData,
    attendanceData,
    upcomingSessions,
    workoutTip,
    notifications,
    // eslint-disable-next-line no-unused-vars
    subscriptions,
    hasActiveSubscription,
    isDataLoaded,
    onRefresh,
    getGreeting,
    handleRenewMembership,
    getMembershipStatusColor,
    getDaysLeftFromSubscriptions,
    getProgressPercentage,
  } = useDashboard();

  // Add loading state to prevent flash of SubscriptionPlans
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Manage initial loading state
  useEffect(() => {
    // If data is loaded, we're no longer in initial load
    if (isDataLoaded) {
      setIsInitialLoad(false);
    }
  }, [isDataLoaded]);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      // console.log("🏠 HomeScreen - Loading timeout reached, showing content");
      setIsInitialLoad(false);
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, []);

  // Debug logging to see what's happening
  // console.log("🏠 HomeScreen Debug:");
  // console.log("  - hasActiveSubscription:", hasActiveSubscription);
  // console.log("  - membershipData:", membershipData);
  // console.log("  - isInitialLoad:", isInitialLoad);
  // console.log("  - Will show:", isInitialLoad ? "Loading..." : (hasActiveSubscription ? "Home Dashboard" : "Subscription Plans"));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Always show app bar for logged-in users */}
      <View style={[styles.appBar, { paddingTop: insets.top + 10 }]}>
        {/* Top Section - Icons */}
        <View style={styles.topSection}>
          <Pressable
            style={styles.profileButton}
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="person-circle-outline" size={32} color="white" />
          </Pressable>
          <View style={styles.rightIcons}>
            <Pressable style={styles.iconButton}>
              <Ionicons name="settings-outline" size={28} color="white" />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push("/notifications")}
            >
              <View style={styles.iconWrapper}>
                <Ionicons name="mail-outline" size={28} color="white" />
                {notifications.filter((n) => n.unread).length > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {notifications.filter((n) => n.unread).length}
                    </Text>
                  </View>
                )}
              </View>
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
        {isInitialLoad ? (
          // Show loading state during initial load to prevent flash
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading...
            </Text>
          </View>
        ) : hasActiveSubscription ? (
          // Show home dashboard for users with active subscription
          <>
            <MembershipOverview
              membershipData={membershipData}
              showQR={showQR}
              email={email}
              colors={colors}
              getMembershipStatusColor={getMembershipStatusColor}
              getDaysLeftFromSubscriptions={getDaysLeftFromSubscriptions}
              handleRenewMembership={handleRenewMembership}
            />
            <AttendanceSummary
              attendanceData={attendanceData}
              colors={colors}
              getProgressPercentage={getProgressPercentage}
              onPress={() => router.push("/attendance-history")}
            />
            <UpcomingSessions
              upcomingSessions={upcomingSessions}
              colors={colors}
            />
            <WorkoutTip workoutTip={workoutTip} colors={colors} />
          </>
        ) : (
          // Show subscription plans for users without active subscription
          <SubscriptionPlans
            colors={colors}
            onSelectPlan={(plan) => {
              console.log("Selected plan:", plan);
              // TODO: Implement subscription purchase logic
            }}
          />
        )}
      </ScrollView>

      {hasActiveSubscription && (
        <FloatingActionButton
          onPress={() => router.push("/my-qr-code")}
          icon="qr-code"
        />
      )}
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
  iconWrapper: {
    position: "relative",
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
    paddingHorizontal: 0,
  },
  scrollViewFullscreen: {
    paddingTop: 20, // Add some top padding when no header
    paddingHorizontal: 0, // Remove horizontal padding for fullscreen
  },

  notificationBadge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  notificationBadgeText: {
    color: "#ffffff",
    fontFamily: Fonts.family.bold,
    fontSize: 10,
    lineHeight: 12,
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
    marginTop: 10,
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
  // Notifications Modal Styles
  notificationsModal: {
    flex: 1,
  },
  notificationsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeaderTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 20,
  },
  modalPlaceholder: {
    width: 40,
  },
  notificationsModalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationsContainer: {
    paddingVertical: 20,
  },
  emptyNotifications: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyNotificationsText: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
  },
  emptyNotificationsSubtext: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  loadingText: {
    fontFamily: Fonts.family.medium,
    fontSize: 18,
  },
});
