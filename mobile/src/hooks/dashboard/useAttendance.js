import { useState } from "react";
import { Alert } from "react-native";
import { firebase } from "@/src/services/firebase";
import { fetchAttendanceData } from "@/src/services/dashboardService";

export const useAttendance = () => {
  const [attendanceData, setAttendanceData] = useState(null);

  const fetchAttendanceDataHook = async () => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) return;

      const attendance = await fetchAttendanceData(user.uid);
      setAttendanceData(attendance);
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
