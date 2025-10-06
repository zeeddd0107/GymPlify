import { useState } from "react";
import { Alert } from "react-native";
import { fetchAttendanceData } from "@/src/services/dashboardService";
import { useAuth } from "@/src/context";

export const useAttendance = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const { user: authUser, loading: authLoading } = useAuth();

  const fetchAttendanceDataHook = async () => {
    try {
      console.log("🔍 useAttendance - fetchAttendanceDataHook called");
      console.log("🔍 useAttendance - authLoading:", authLoading);
      console.log("🔍 useAttendance - authUser:", authUser);

      // Don't fetch if authentication is still loading
      if (authLoading) {
        console.log(
          "🔍 useAttendance - Authentication still loading, skipping attendance fetch",
        );
        return;
      }

      // Don't fetch if no authenticated user
      if (!authUser) {
        console.log(
          "🔍 useAttendance - No authenticated user, skipping attendance fetch",
        );
        return;
      }

      // Don't fetch if user ID is not available
      if (!authUser.id) {
        console.log(
          "🔍 useAttendance - No user ID available, skipping attendance fetch",
        );
        return;
      }

      console.log(
        "🔍 useAttendance - Fetching attendance for user:",
        authUser.email,
      );
      const attendance = await fetchAttendanceData(authUser.id);
      setAttendanceData(attendance);
      console.log("🔍 useAttendance - Attendance data fetched:", attendance);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      Alert.alert("Error", "Failed to load attendance data");
    }
  };

  const getProgressPercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  return {
    attendanceData,
    setAttendanceData,
    fetchAttendanceDataHook,
    getProgressPercentage,
  };
};
