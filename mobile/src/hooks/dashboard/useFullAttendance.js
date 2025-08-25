import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { firebase } from "@/src/services/firebase";
import { fetchAllAttendanceRecords } from "@/src/services/dashboardService";

export const useFullAttendance = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState([]);

  const open = useCallback(async () => {
    setIsVisible(true);
    setIsLoading(true);
    try {
      const user = firebase.auth().currentUser;
      if (!user) {
        setRecords([]);
        return;
      }
      const data = await fetchAllAttendanceRecords(user.uid);
      setRecords(data);
    } catch (error) {
      console.error("Error loading attendance records:", error);
      Alert.alert("Error", "Failed to load attendance records");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const close = useCallback(() => setIsVisible(false), []);

  const summary = useMemo(() => {
    if (!records || records.length === 0) {
      return { total: 0 };
    }
    return { total: records.length };
  }, [records]);

  return {
    isVisible,
    isLoading,
    records,
    open,
    close,
    summary,
    setRecords,
  };
};
