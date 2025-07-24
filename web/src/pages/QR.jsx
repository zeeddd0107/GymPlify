import React, { useState, useRef, useEffect } from "react";
import { db } from "@/config/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  updateDoc,
} from "firebase/firestore";

const QR = () => {
  const [qrValue, setQrValue] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus input on mount
    if (inputRef.current) inputRef.current.focus();
    // Handler to refocus input on any keydown if not focused
    const handleGlobalKeyDown = () => {
      if (document.activeElement !== inputRef.current && !loading) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [loading]);

  const handleInputChange = (e) => {
    setQrValue(e.target.value);
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter" && qrValue.trim()) {
      setLoading(true);
      setStatus("");
      const value = qrValue.trim();
      try {
        // Extract userId from qrValue (format: userId_timestamp_randomNumber or just userId)
        const userId = value.split("_")[0];
        if (!userId) throw new Error("Could not extract userId from QR code.");
        // Fetch user info
        const userDoc = await getDoc(doc(db, "users", userId));
        if (!userDoc.exists())
          throw new Error(`User with userId ${userId} not found.`);
        const userInfo = userDoc.data();

        // --- TEMP LOGGING FOR DEBUGGING INDEX ERRORS ---
        console.log("[DEBUG] Attempting attendance query for userId:", userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        console.log("[DEBUG] Query params:", {
          userId,
          today,
        });
        // --- END TEMP LOGGING ---

        // --- Attendance Logic for Multiple Sessions per Day ---
        const attendanceQuery = query(
          collection(db, "attendance"),
          where("userId", "==", userId),
          where("checkInTime", ">=", today), // Only today
          orderBy("checkInTime", "desc"),
          limit(1),
        );
        let attendanceSnap;
        try {
          attendanceSnap = await getDocs(attendanceQuery);
        } catch (firestoreErr) {
          // --- TEMP LOGGING FOR DEBUGGING INDEX ERRORS ---
          console.error("[DEBUG] Firestore query error:", firestoreErr);
          setStatus("Firestore index error: check console for details.");
          setLoading(false);
          return;
          // --- END TEMP LOGGING ---
        }
        let openSessionDoc = null;
        attendanceSnap.forEach((doc) => {
          const data = doc.data();
          if (!data.checkOutTime) {
            openSessionDoc = { id: doc.id, ...data };
          }
        });

        if (openSessionDoc) {
          // --- Check-Out Logic ---
          // Prevent double check-out: only set checkOutTime if not already set
          if (openSessionDoc.checkOutTime) {
            setStatus("You have already checked out for your last session.");
          } else {
            const checkOutTime = new Date();
            // Calculate session duration in minutes (rounded)
            let duration = null;
            if (
              openSessionDoc.checkInTime &&
              openSessionDoc.checkInTime.toDate
            ) {
              duration = Math.round(
                (checkOutTime - openSessionDoc.checkInTime.toDate()) / 60000,
              ); // duration in minutes
            }
            await updateDoc(doc(db, "attendance", openSessionDoc.id), {
              checkOutTime: checkOutTime,
              duration: duration, // Store duration in minutes (integer)
            });
            setStatus(
              `Checked out! Session duration: ${duration ? duration : "-"} min.`,
            );
          }
        } else {
          // --- Check-In Logic ---
          await addDoc(collection(db, "attendance"), {
            userId,
            checkInTime: serverTimestamp(),
            checkOutTime: null, // Not checked out yet
            duration: null, // Will be set on check-out
            userInfo,
            qrValue: value,
          });
          // Display user's display name if available, otherwise fallback to userId
          setStatus(`Checked in for: ${userInfo.displayName || userId}`);
        }
        setQrValue("");
      } catch (err) {
        setStatus(err.message || "Error processing attendance.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-primary mb-4">QR</h1>
      <p>
        Scan or enter a QR code value below. Attendance will be recorded
        automatically when you press Enter.
      </p>
      <input
        ref={inputRef}
        type="text"
        className="mt-4 p-2 border rounded w-full max-w-md"
        placeholder="Scan QR code here..."
        value={qrValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={loading}
        autoFocus
      />
      {status && (
        <div
          className={`mt-4 ${status.startsWith("Attendance recorded") ? "text-green-600" : "text-red-600"}`}
        >
          {status}
        </div>
      )}
    </div>
  );
};

export default QR;
