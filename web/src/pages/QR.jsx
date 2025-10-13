import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQrcode,
  faUserCheck,
  faUserTimes,
  faClock,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FaTimes } from "react-icons/fa";
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(null);
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

  // Auto-process QR code when input changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (qrValue.trim() && !loading) {
        processQRCode(qrValue.trim());
      }
    }, 500); // 500ms delay to avoid processing while typing

    return () => clearTimeout(timer);
  }, [qrValue, loading]);

  const processQRCode = async (value) => {
    if (!value || loading) return;

    setLoading(true);
    setStatus("");

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
          if (openSessionDoc.checkInTime && openSessionDoc.checkInTime.toDate) {
            duration = Math.round(
              (checkOutTime - openSessionDoc.checkInTime.toDate()) / 60000,
            ); // duration in minutes
          }

          // Check if session is too short (less than 3 minutes)
          if (duration < 3) {
            // Show confirmation prompt for short sessions
            setPendingCheckout({
              sessionId: openSessionDoc.id,
              checkOutTime: checkOutTime,
              duration: duration,
              checkInTime: openSessionDoc.checkInTime,
            });
            setShowConfirmation(true);
            setStatus(
              `You've just checked in ${duration === 0 ? "a few seconds" : `${duration} minute${duration !== 1 ? "s" : ""}`} ago. Do you want to check out now?`,
            );
          } else {
            // Process check-out normally for sessions 3+ minutes
            await updateDoc(doc(db, "attendance", openSessionDoc.id), {
              checkOutTime: checkOutTime,
              duration: duration, // Store duration in minutes (integer)
            });
            setStatus(
              `Checked out! Session duration: ${duration ? duration : "-"} min.`,
            );
          }
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
  };

  const handleKeyDown = async (e) => {
    // Keep Enter key functionality as backup
    if (e.key === "Enter" && qrValue.trim() && !loading) {
      processQRCode(qrValue.trim());
    }
  };

  // Handle confirmation actions
  const handleConfirmCheckout = async () => {
    if (!pendingCheckout) return;

    setLoading(true);
    try {
      await updateDoc(doc(db, "attendance", pendingCheckout.sessionId), {
        checkOutTime: pendingCheckout.checkOutTime,
        duration: pendingCheckout.duration,
      });
      setStatus(
        `Checked out! Session duration: ${pendingCheckout.duration ? pendingCheckout.duration : "-"} min.`,
      );
    } catch (error) {
      console.error("Checkout error:", error);
      setStatus("Error processing checkout. Please try again.");
    } finally {
      setLoading(false);
      setShowConfirmation(false);
      setPendingCheckout(null);
      setQrValue("");
    }
  };

  const handleCancelCheckout = () => {
    setShowConfirmation(false);
    setPendingCheckout(null);
    setStatus("Checkout cancelled. You remain checked in.");
    setQrValue("");
  };

  // Determine status type and icon
  const getStatusInfo = () => {
    if (!status) return { type: "", icon: null, bgColor: "", textColor: "" };

    if (status.includes("Checked in")) {
      return {
        type: "success",
        icon: faUserCheck,
        bgColor: "bg-green-50 border-green-200",
        textColor: "text-green-800",
      };
    } else if (status.includes("Checked out")) {
      return {
        type: "info",
        icon: faUserTimes,
        bgColor: "bg-blue-50 border-blue-200",
        textColor: "text-blue-800",
      };
    } else if (status.includes("already checked out")) {
      return {
        type: "warning",
        icon: faClock,
        bgColor: "bg-yellow-50 border-yellow-200",
        textColor: "text-yellow-800",
      };
    } else if (
      status.includes("Do you want to check out now") ||
      status.includes("cancelled")
    ) {
      return {
        type: "warning",
        icon: faClock,
        bgColor: "bg-orange-50 border-orange-200",
        textColor: "text-orange-800",
      };
    } else {
      return {
        type: "error",
        icon: faUserTimes,
        bgColor: "bg-red-50 border-red-200",
        textColor: "text-red-800",
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Main Scanner Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="max-w-2xl mx-auto">
            {/* Scanner Input Section */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                <FontAwesomeIcon
                  icon={faQrcode}
                  className="text-2xl text-white"
                />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Scan QR Code
              </h2>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={loading ? faSpinner : faQrcode}
                    className={`text-gray-400 ${loading ? "animate-spin" : ""}`}
                  />
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 placeholder-gray-400"
                  placeholder="Scan QR code or enter code manually..."
                  value={qrValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  autoFocus
                />
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Scan or manually enter a QR code value to record gym attendance.
                The system will automatically check members in or out based on
                their current status.
              </p>
            </div>

            {/* Status Display */}
            {status && !showConfirmation && (
              <div
                className={`p-4 rounded-xl border-2 ${statusInfo.bgColor} ${statusInfo.textColor} transition-all duration-300`}
              >
                <div className="flex items-center">
                  {statusInfo.icon && (
                    <FontAwesomeIcon
                      icon={statusInfo.icon}
                      className="text-xl mr-3 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{status}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 py-8 md:py-4 lg:py-6"
            onClick={handleCancelCheckout}
          >
            <div
              className="bg-white rounded-lg w-full max-w-lg mx-4 flex flex-col max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 md:px-7 md:py-4 pt-5 pb-4 border-b border-gray/50 flex-shrink-0">
                <h2 className="text-xl font-semibold text-gray-800 pr-2">
                  Confirm Checkout
                </h2>
                <button
                  onClick={handleCancelCheckout}
                  className="p-2.5 text-gray-900 hover:text-gray-600 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-200 ease-in-out group flex-shrink-0"
                >
                  <FaTimes className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto px-6 md:px-7 py-4 md:py-5">
                {/* Clock Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="text-xl text-orange-600"
                    />
                  </div>
                </div>

                {/* Confirmation Message */}
                <div className="text-center mb-1">
                  <p className="text-gray-700 text-base leading-relaxed">
                    {status}
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 md:px-7 pt-5 pb-6 border-t border-gray/50 flex-shrink-0">
                <div className="px-12 flex justify-between">
                  {/* Cancel Button - Secondary styling */}
                  <button
                    onClick={handleCancelCheckout}
                    disabled={loading}
                    className="pl-8 px-6 py-3 !text-sm font-medium rounded-xl border border-gray-300 bg-white text-primary hover:bg-gray-50 hover:border-primary focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-90 disabled:cursor-not-allowed disabled:hover:bg-white"
                  >
                    Stay Checked In
                  </button>

                  {/* Delete Button - Primary styling with red background */}
                  <button
                    onClick={handleConfirmCheckout}
                    disabled={loading}
                    className="px-6 py-3 !text-sm font-medium rounded-xl border border-transparent bg-red-500 text-white hover:bg-red-600 focus:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 ease-in-out disabled:opacity-90 disabled:cursor-not-allowed disabled:hover:bg-red-500"
                  >
                    {loading ? "Processing..." : "Yes, Check Out"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QR;
