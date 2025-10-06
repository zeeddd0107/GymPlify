import { useState, useEffect, useCallback } from "react";
import { firestore } from "@/src/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/src/context";

export const useUserData = () => {
  const [email, setEmail] = useState("");
  const [activeSubscriptionId, setActiveSubscriptionId] = useState(null);
  const [userData, setUserData] = useState(null);
  const { user: authUser, loading: authLoading } = useAuth();

  const fetchUserData = useCallback(async () => {
    // console.log("🔍 useUserData - fetchUserData called");

    // Don't proceed if authentication is still loading
    if (authLoading) {
      // console.log("🔍 useUserData - Authentication still loading, skipping fetch");
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
          setUserData({
            name: userObj.name || "User",
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
            const userName =
              userData.displayName ||
              userData.name ||
              (userEmail ? userEmail.split("@")[0] : "User");
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
        // No authenticated user
        const noUserData = {
          name: "User",
          email: userEmail || "",
          profilePicture: null,
        };
        setUserData(noUserData);

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
      const errorUserData = {
        name: "User",
        email: userEmail || "",
        profilePicture: null,
      };
      setUserData(errorUserData);

      // Clear AsyncStorage on error
      try {
        await AsyncStorage.removeItem("@user");
        // console.log("🔍 useUserData - Cleared AsyncStorage (error)");
      } catch (storageError) {
        console.error("Error clearing AsyncStorage:", storageError);
      }
    }
  }, [authUser, authLoading]);

  // Trigger fetchUserData when authentication state changes
  useEffect(() => {
    if (!authLoading) {
      fetchUserData();
    }
  }, [authUser, authLoading, fetchUserData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    // Better fallback logic for user names
    let userName = "User";

    if (userData?.name && userData.name.trim() !== "") {
      userName = userData.name.split(" ")[0];
    } else if (userData?.email) {
      // If no display name, use email prefix as fallback
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
    fetchUserData,
    getGreeting,
  };
};
