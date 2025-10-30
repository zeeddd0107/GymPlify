import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQrcode,
  faUserCheck,
  faUserTimes,
  faClock,
  faSpinner,
  faSearch,
  faUser,
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
  
  // Mode toggle state (default: 'qr')
  const [mode, setMode] = useState("qr"); // 'qr' or 'manual'
  
  // Manual check-in states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    // Only focus QR input when in QR mode
    if (mode === "qr") {
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
    }
  }, [loading, mode]);

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

  // Search for users by name in subscriptions
  const searchUsers = async (searchTerm) => {
    if (!searchTerm.trim() || searchTerm.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setSearchLoading(true);
    try {
      // Fetch all active subscriptions
      const subscriptionsRef = collection(db, "subscriptions");
      const subscriptionsQuery = query(
        subscriptionsRef,
        where("status", "==", "active")
      );
      const snapshot = await getDocs(subscriptionsQuery);
      
      const subscriptionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log("Active subscriptions found:", subscriptionsData.length);

      // Enrich subscriptions with user data if needed
      const enrichedResults = await Promise.all(
        subscriptionsData.map(async (sub) => {
          try {
            // Check if we need to fetch user data
            const hasDisplayName = sub.userDisplayName || sub.displayName;
            
            if (hasDisplayName && !hasDisplayName.includes("@")) {
              // Use existing display name from subscription
              return {
                userId: sub.userId,
                displayName: sub.userDisplayName || sub.displayName,
                customMemberId: sub.customMemberId || "",
                email: sub.userEmail || sub.email || "",
                subscriptionId: sub.id,
                status: sub.status
              };
            }
            
            // Fetch from users collection if display name not in subscription
            const userDoc = await getDoc(doc(db, "users", sub.userId));
            const userData = userDoc.data();
            
            return {
              userId: sub.userId,
              displayName: userData?.displayName || userData?.name || sub.displayName || "Unknown User",
              customMemberId: userData?.customMemberId || sub.customMemberId || "",
              email: userData?.email || sub.userEmail || sub.email || "",
              subscriptionId: sub.id,
              status: sub.status
            };
          } catch (error) {
            console.error("Error enriching subscription data:", error);
            return {
              userId: sub.userId,
              displayName: sub.userDisplayName || sub.displayName || "Unknown User",
              customMemberId: sub.customMemberId || "",
              email: sub.userEmail || sub.email || "",
              subscriptionId: sub.id,
              status: sub.status
            };
          }
        })
      );

      // Filter by search term
      const searchLower = searchTerm.toLowerCase();
      const filtered = enrichedResults.filter(user => {
        return (
          user.displayName.toLowerCase().includes(searchLower) ||
          user.customMemberId.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      });

      console.log("Filtered results:", filtered.length);
      setSearchResults(filtered);
      setShowSearchResults(filtered.length > 0);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle user selection for manual check-in
  const handleUserSelect = async (user) => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    
    // Use the existing processQRCode function with the user's ID
    await processQRCode(user.userId);
  };

  // Handle mode switching
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setStatus(""); // Clear status when switching modes
    setQrValue(""); // Clear QR input
    setSearchQuery(""); // Clear search query
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        {/* Mode Toggle Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
          <div className="flex gap-3 max-w-2xl mx-auto">
            <button
              onClick={() => handleModeSwitch("qr")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === "qr"
                  ? "bg-primary text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FontAwesomeIcon icon={faQrcode} className="text-lg" />
              Scan QR Code
            </button>
            <button
              onClick={() => handleModeSwitch("manual")}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                mode === "manual"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FontAwesomeIcon icon={faSearch} className="text-lg" />
              Manual Check-In
            </button>
          </div>
        </div>

        {/* QR Scanner Mode */}
        {mode === "qr" && (
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
        )}

        {/* Manual Check-In Mode */}
        {mode === "manual" && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="max-w-2xl mx-auto">
              {/* Manual Check-In Section */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-2xl text-white"
                  />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Manual Check-In
                </h2>
              
              {/* Search Input */}
              <div className="relative" ref={searchRef}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FontAwesomeIcon
                    icon={searchLoading ? faSpinner : faSearch}
                    className={`text-gray-400 ${searchLoading ? "animate-spin" : ""}`}
                  />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all duration-200 placeholder-gray-400"
                  placeholder="Search by name, member ID, or email..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => searchQuery && setShowSearchResults(true)}
                  disabled={loading}
                />
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user.userId}
                        onClick={() => handleUserSelect(user)}
                        className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-3"
                      >
                        <div className="flex-shrink-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <FontAwesomeIcon icon={faUser} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {user.displayName}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            {user.customMemberId && (
                              <span className="font-medium text-primary">
                                {user.customMemberId}
                              </span>
                            )}
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                {/* No Results Message */}
                {showSearchResults && searchQuery && searchResults.length === 0 && !searchLoading && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-600">
                    No active members found matching "{searchQuery}"
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-500 mt-3">
                Search for a member by name, member ID, or email to manually record their attendance.
              </p>
            </div>

            {/* Status Display for Manual Mode */}
            {status && !showConfirmation && (
              <div
                className={`p-4 rounded-xl border-2 ${statusInfo.bgColor} ${statusInfo.textColor} transition-all duration-300 mt-6`}
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
        )}

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
