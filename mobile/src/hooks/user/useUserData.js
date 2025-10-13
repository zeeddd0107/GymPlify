import { useState, useEffect, useCallback } from "react";
import { firestore } from "@/src/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/src/context";

export const useUserData = () => {
  const [email, setEmail] = useState("");
  const [activeSubscriptionId, setActiveSubscriptionId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isUserDataLoading, setIsUserDataLoading] = useState(true);
  const { user: authUser, loading: authLoading } = useAuth();

  const fetchUserData = useCallback(async () => {
    // console.log("🔍 useUserData - fetchUserData called");
    setIsUserDataLoading(true);

    // Don't proceed if authentication is still loading
    if (authLoading) {
      // console.log("🔍 useUserData - Authentication still loading, skipping fetch");
      setIsUserDataLoading(false); // Set loading to false if auth is still loading
      return;
    }

    // If no authenticated user, check if we have AsyncStorage data to use temporarily
    if (!authUser) {
      // console.log("🔍 useUserData - No authenticated user, checking AsyncStorage for temporary data");

      // Try to get user data from AsyncStorage as fallback
      try {
        const userStr = await AsyncStorage.getItem("@user");
        if (userStr) {
          const userObj = JSON.parse(userStr);
          // console.log("🔍 useUserData - Found AsyncStorage data, using as temporary fallback");

          // Use AsyncStorage data temporarily while waiting for Firebase auth
          const tempUserName =
            userObj.name && userObj.name.trim() !== ""
              ? userObj.name
              : userObj.displayName && userObj.displayName.trim() !== ""
                ? userObj.displayName
                : userObj.email
                  ? userObj.email.split("@")[0]
                  : "User";

          setUserData({
            name: tempUserName,
            email: userObj.email || "",
            profilePicture: userObj.picture || null,
          });
          setEmail(userObj.email || "");

          // Don't set activeSubscriptionId yet, wait for Firebase auth to be restored
          // console.log("🔍 useUserData - Using AsyncStorage data temporarily, waiting for Firebase auth");
          return;
        }
      } catch (error) {
        console.error("🔍 useUserData - Error reading AsyncStorage:", error);
      }

      // No AsyncStorage data either, clear everything
      // console.log("🔍 useUserData - No AsyncStorage data either, clearing data");
      setUserData({
        name: "User",
        email: "",
        profilePicture: null,
      });
      setActiveSubscriptionId(null);
      setEmail("");
      return;
    }

    let userEmail = authUser.email || "";
    setEmail(userEmail);

    try {
      // First, try to get user data from AsyncStorage (for immediate access after registration)
      const userStr = await AsyncStorage.getItem("@user");
      // let hasAsyncStorageData = false;
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj.name && userObj.name.trim() !== "") {
            setUserData({
              name: userObj.name,
              email: userObj.email || userEmail,
              profilePicture: userObj.picture || null,
            });
            // hasAsyncStorageData = true;
            // Don't return early - we still need to fetch activeSubscriptionId from Firebase
          }
        } catch {
          // Continue to Firebase if AsyncStorage fails
        }
      }

      // Fetch actual user data from Firebase using authenticated user
      // console.log("🔍 useUserData - Using authenticated user:", authUser.id);
      if (authUser && authUser.id) {
        // Get user's display name from authenticated user
        // const displayName = authUser.name;

        // Always fetch from Firestore to get activeSubscriptionId and other data
        try {
          const userDoc = await firestore
            .collection("users")
            .doc(authUser.id)
            .get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            // console.log("🔍 useUserData - User document data:", userData);
            // console.log("🔍 useUserData - activeSubscriptionId from document:", userData.activeSubscriptionId);

            // Always update userData with fresh Firebase data and store in AsyncStorage
            // Prioritize name field, then displayName, then email prefix
            const userName =
              userData.name && userData.name.trim() !== ""
                ? userData.name
                : userData.displayName && userData.displayName.trim() !== ""
                  ? userData.displayName
                  : userEmail
                    ? userEmail.split("@")[0]
                    : "User";

            const freshUserData = {
              name: userName,
              email: userEmail,
              profilePicture:
                authUser.picture || userData.profilePicture || null,
            };

            setUserData(freshUserData);

            // Update AsyncStorage with fresh data
            try {
              await AsyncStorage.setItem(
                "@user",
                JSON.stringify({
                  name: userName,
                  email: userEmail,
                  picture: authUser.picture || userData.profilePicture || null,
                }),
              );
              // console.log("🔍 useUserData - Updated AsyncStorage with fresh user data");
            } catch (error) {
              console.error("Error updating AsyncStorage:", error);
            }
            // Always fetch activeSubscriptionId from Firestore
            setActiveSubscriptionId(userData.activeSubscriptionId || null);
            // console.log("🔍 useUserData - Set activeSubscriptionId to:", userData.activeSubscriptionId || null);
          } else {
            // No Firestore data, use email prefix as fallback
            const userName = userEmail ? userEmail.split("@")[0] : "User";
            const fallbackUserData = {
              name: userName,
              email: userEmail,
              profilePicture: authUser.picture || null,
            };

            setUserData(fallbackUserData);

            // Update AsyncStorage with fallback data
            try {
              await AsyncStorage.setItem(
                "@user",
                JSON.stringify({
                  name: userName,
                  email: userEmail,
                  picture: authUser.picture || null,
                }),
              );
              // console.log("🔍 useUserData - Updated AsyncStorage with fallback user data");
            } catch (error) {
              console.error("Error updating AsyncStorage:", error);
            }
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          // Use email prefix as fallback
          const userName = userEmail ? userEmail.split("@")[0] : "User";
          const errorUserData = {
            name: userName,
            email: userEmail,
            profilePicture: authUser.picture || null,
          };

          setUserData(errorUserData);

          // Update AsyncStorage with error fallback data
          try {
            await AsyncStorage.setItem(
              "@user",
              JSON.stringify({
                name: userName,
                email: userEmail,
                picture: authUser.picture || null,
              }),
            );
            // console.log("🔍 useUserData - Updated AsyncStorage with error fallback user data");
          } catch (storageError) {
            console.error("Error updating AsyncStorage:", storageError);
          }
        }
      } else {
        // No authenticated user - don't set user data, let loading state handle it
        setUserData(null);

        // Clear AsyncStorage when no user
        try {
          await AsyncStorage.removeItem("@user");
          // console.log("🔍 useUserData - Cleared AsyncStorage (no user)");
        } catch (error) {
          console.error("Error clearing AsyncStorage:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      // Don't set fallback user data on error, let loading state handle it
      setUserData(null);

      // Clear AsyncStorage on error
      try {
        await AsyncStorage.removeItem("@user");
        // console.log("🔍 useUserData - Cleared AsyncStorage (error)");
      } catch (storageError) {
        console.error("Error clearing AsyncStorage:", storageError);
      }
    } finally {
      setIsUserDataLoading(false);
    }
  }, [authUser, authLoading]);

  // Trigger fetchUserData when authentication state changes
  useEffect(() => {
    if (!authLoading) {
      fetchUserData();
    }
  }, [authUser, authLoading, fetchUserData]);

  // Add timeout to prevent infinite loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isUserDataLoading) {
        console.log(
          "🔍 useUserData - Loading timeout reached, setting loading to false",
        );
        setIsUserDataLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [isUserDataLoading]);

  const getGreeting = () => {
    const hour = new Date().getHours();

    // Show generic greeting while user data is being fetched
    if (authLoading || isUserDataLoading) {
      if (hour < 12) {
        return "Good morning 🌅";
      } else if (hour < 18) {
        return "Good afternoon ☀️";
      } else {
        return "Good evening 🌙";
      }
    }

    // If no user data yet, show generic greeting
    if (!userData) {
      if (hour < 12) {
        return "Good morning 🌅";
      } else if (hour < 18) {
        return "Good afternoon ☀️";
      } else {
        return "Good evening 🌙";
      }
    }

    // Better fallback logic for user names
    let userName = "User";

    // Prioritize name field, then displayName, then email prefix
    if (userData?.name && userData.name.trim() !== "") {
      userName = userData.name.split(" ")[0];
    } else if (userData?.displayName && userData.displayName.trim() !== "") {
      userName = userData.displayName.split(" ")[0];
    } else if (userData?.email) {
      // If no name or displayName, use email prefix as fallback
      userName = userData.email.split("@")[0];
    }

    if (hour < 12) {
      return `Good morning, ${userName} 🌅`;
    } else if (hour < 18) {
      return `Good afternoon, ${userName} ☀️`;
    } else {
      return `Good evening, ${userName} 🌙`;
    }
  };

  return {
    email,
    userData,
    activeSubscriptionId,
    isUserDataLoading,
    fetchUserData,
    getGreeting,
  };
};
