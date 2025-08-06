import { useEffect, useState } from "react";
import { firebase } from "@/src/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setLastLogout } from "@/src/authService";
import {
  fetchMembershipData,
  fetchAttendanceData,
  fetchUpcomingSessions,
  fetchActiveSubscriptions,
  fetchNotifications,
  getWorkoutTip,
  renewMembership,
  buyMoreSessions,
} from "@/src/dashboardService";

export default function useHomeDashboard(router) {
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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
            // Fallback if parsing fails
          }
        }
      }
      setEmail(userEmail || "");
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
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUserData(), fetchDashboardData()]);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (user) {
        await setLastLogout(user.uid);
      }
      await firebase.auth().signOut();
      router.replace("/auth");
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  };

  const handleProfileSignOut = async () => {
    alert("Sign out is handled in the profile modal.");
  };

  const handleProfileOptionPress = (option) => {
    alert(`${option} feature will be available soon!`);
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
        alert("Please log in to renew membership");
        return;
      }
      const result = await renewMembership(user.uid, membershipData.planId);
      if (result.success) {
        alert("Membership renewed successfully!");
        fetchDashboardData();
      }
    } catch (error) {
      alert("Failed to renew membership: " + error.message);
    }
  };

  const handleBuyMoreSessions = async (subscriptionType) => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        alert("Please log in to purchase sessions");
        return;
      }
      const result = await buyMoreSessions(user.uid, subscriptionType, 5);
      if (result.success) {
        alert("Sessions purchased successfully!");
        fetchDashboardData();
      }
    } catch (error) {
      alert("Failed to purchase sessions: " + error.message);
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

  return {
    email,
    userData,
    refreshing,
    showQR,
    setShowQR,
    showProfile,
    setShowProfile,
    membershipData,
    attendanceData,
    upcomingSessions,
    subscriptions,
    notifications,
    workoutTip,
    fetchUserData,
    fetchDashboardData,
    onRefresh,
    handleLogout,
    handleProfileSignOut,
    handleProfileOptionPress,
    getMembershipStatusColor,
    getProgressPercentage,
    handleRenewMembership,
    handleBuyMoreSessions,
    getGreeting,
  };
}
