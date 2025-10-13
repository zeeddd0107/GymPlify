import { useState } from "react";
import { Alert } from "react-native";
import { fetchAttendanceData } from "@/src/services/dashboardService";
import { useAuth } from "@/src/context";
import Logger from "@/src/utils/logger";

export const useAttendance = () => {
  const [attendanceData, setAttendanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user: authUser, loading: authLoading } = useAuth();

  const fetchAttendanceDataHook = async () => {
    try {
      // Prevent multiple simultaneous fetches
      if (isLoading) {
        Logger.debug("Attendance fetch already in progress, skipping");
        return;
      }

      Logger.hook("useAttendance", "Fetching attendance data");

      // Don't fetch if authentication is still loading
      if (authLoading) {
        Logger.debug("Authentication still loading, skipping attendance fetch");
        return;
      }

      // Don't fetch if no authenticated user
      if (!authUser) {
        Logger.debug("No authenticated user, skipping attendance fetch");
        return;
      }

      // Don't fetch if user ID is not available
      if (!authUser.id) {
        Logger.debug("No user ID available, skipping attendance fetch");
        return;
      }

      setIsLoading(true);
      Logger.hook("useAttendance", `Fetching data for user: ${authUser.email}`);
      const attendance = await fetchAttendanceData(authUser.id);
      setAttendanceData(attendance);
      Logger.hook(
        "useAttendance",
        `Attendance data fetched: ${attendance.totalVisits} visits`,
      );
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      Alert.alert("Error", "Failed to load attendance data");
    } finally {
      setIsLoading(false);
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
    isLoading,
  };
};
