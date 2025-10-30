import { useState, useEffect, useCallback } from "react";
import { firebase, firestore } from "@/src/services/firebase";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const useSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSessions = useCallback(async () => {
    try {
      setError(null);
      const user = firebase.auth().currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      const snapshot = await firestore
        .collection("sessions")
        .where("userId", "==", user.uid)
        .get();

      console.log("Fetched sessions count:", snapshot.docs.length);
      console.log(
        "Raw session docs:",
        snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() })),
      );

      const sessionsData = snapshot.docs
        .map((doc) => {
          const data = doc.data();
          const sessionDate = data.scheduledDate?.toDate
            ? data.scheduledDate.toDate()
            : new Date(data.scheduledDate);

          return {
            id: doc.id,
            dateISO: sessionDate.toISOString(),
            dayName: dayNames[sessionDate.getDay()],
            dateDisplay: `${monthNames[sessionDate.getMonth()]} ${sessionDate.getDate()}, ${sessionDate.getFullYear()}`,
            time: data.timeSlot || "Time not specified",
            workoutType: data.workoutType || "Workout",
            scheduledDate: data.scheduledDate,
            status: data.status,
            type: data.type || "solo",
            title: data.title || "Untitled Session",
            descriptions: data.descriptions || "",
          };
        })
        .filter((session) => {
          console.log("Session status check:", {
            id: session.id,
            status: session.status,
          });
          return session.status === "scheduled" || session.status === "completed";
        })
        .sort((a, b) => {
          const dateA = a.scheduledDate?.toDate
            ? a.scheduledDate.toDate()
            : new Date(a.scheduledDate);
          const dateB = b.scheduledDate?.toDate
            ? b.scheduledDate.toDate()
            : new Date(a.scheduledDate);
          return dateA - dateB;
        });

      console.log(
        "Final sessions data:",
        sessionsData.map((s) => ({
          id: s.id,
          title: s.title,
          status: s.status,
        })),
      );
      setSessions(sessionsData);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSessions();
    setRefreshing(false);
  }, [fetchSessions]);

  const deleteSession = useCallback(
    async (sessionId) => {
      try {
        await firestore.collection("sessions").doc(sessionId).delete();
        // Refresh the sessions list after deletion
        await fetchSessions();
        return { success: true };
      } catch (error) {
        console.error("Error deleting session:", error);
        return { success: false, error: error.message };
      }
    },
    [fetchSessions],
  );

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    sessions,
    loading,
    refreshing,
    error,
    onRefresh,
    refetch: fetchSessions,
    deleteSession,
  };
};
