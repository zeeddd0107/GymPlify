import { useState } from "react";
import { firebase, firestore } from "@/src/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useUserData = () => {
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState(null);

  const fetchUserData = async () => {
    let userEmail = "";
    try {
      userEmail = firebase.auth().currentUser?.email;
      if (!userEmail) {
        const userStr = await AsyncStorage.getItem("@user");
        if (userStr) {
          try {
            const userObj = JSON.parse(userStr);
            userEmail = userObj.email || userObj.name || "";
          } catch {
            // ignore JSON parse errors
          }
        }
      }
      setEmail(userEmail || "");

      // Fetch actual user data from Firebase
      const user = firebase.auth().currentUser;
      if (user) {
        // Get user's display name from Firebase Auth
        const displayName = user.displayName;

        // If no display name in Auth, try to get from Firestore
        if (!displayName) {
          try {
            const userDoc = await firestore
              .collection("users")
              .doc(user.uid)
              .get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              setUserData({
                name: userData.displayName || userData.name || "User",
                email: userEmail,
                profilePicture:
                  user.photoURL || userData.profilePicture || null,
              });
            } else {
              setUserData({
                name: "User",
                email: userEmail,
                profilePicture: user.photoURL || null,
              });
            }
          } catch (error) {
            console.error("Error fetching user data from Firestore:", error);
            setUserData({
              name: displayName || "User",
              email: userEmail,
              profilePicture: user.photoURL || null,
            });
          }
        } else {
          setUserData({
            name: displayName,
            email: userEmail,
            profilePicture: user.photoURL || null,
          });
        }
      } else {
        setUserData({
          name: "User",
          email: userEmail || "",
          profilePicture: null,
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData({
        name: "User",
        email: userEmail || "",
        profilePicture: null,
      });
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    const userName = userData?.name?.split(" ")[0] || "User";

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
    fetchUserData,
    getGreeting,
  };
};
