import { useEffect, useState } from "react";
import { View } from "react-native";
import { firebase } from "@/src/services/firebase";
import { AuthContext } from "./AuthContext.js";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    // First, try to restore user from AsyncStorage
    const restoreUserFromStorage = async () => {
      try {
        const userData = await AsyncStorage.getItem("@user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log(
            "AuthProvider: ✅ Restored user from AsyncStorage:",
            parsedUser.email,
          );

          // Check if the user has a valid ID
          if (!parsedUser.id) {
            console.log(
              "AuthProvider: ❌ User restored from storage but no ID found, waiting for Firebase auth",
            );
            // Don't set user if no ID - wait for Firebase auth to restore properly
            return false;
          }

          // Ensure the user object has all required fields
          const completeUserData = {
            id: parsedUser.id,
            email: parsedUser.email,
            name: parsedUser.name,
            picture: parsedUser.picture,
          };

          // console.log("AuthProvider: 🔍 Complete user data:", completeUserData);

          // Set user immediately for faster UI response
          setUser(completeUserData);
          return true; // User was restored from storage
        } else {
          console.log("AuthProvider: ❌ No user data in AsyncStorage");
          return false;
        }
      } catch (error) {
        console.log(
          "AuthProvider: ❌ Error reading AsyncStorage:",
          error.message,
        );
        return false;
      }
    };

    // Restore user from storage first
    const initializeAuth = async () => {
      const userRestored = await restoreUserFromStorage();

      // If we restored a user from storage, try to restore Firebase auth state
      if (userRestored) {
        console.log(
          "AuthProvider: 🔄 User restored from storage, checking Firebase auth state",
        );
        try {
          // Force Firebase to check current auth state
          const currentUser = firebase.auth().currentUser;
          if (currentUser) {
            console.log(
              "AuthProvider: ✅ Firebase auth state already restored:",
              currentUser.email,
            );
            console.log(
              "AuthProvider: 🔍 Firebase current user UID:",
              currentUser.uid,
            );

            // Verify that the Firebase user matches the stored user
            const storedUser = await AsyncStorage.getItem("@user");
            if (storedUser) {
              const parsedStoredUser = JSON.parse(storedUser);
              if (parsedStoredUser.id !== currentUser.uid) {
                console.log(
                  "AuthProvider: ⚠️ User ID mismatch - stored:",
                  parsedStoredUser.id,
                  "Firebase:",
                  currentUser.uid,
                );
                console.log(
                  "AuthProvider: 🔄 Updating stored user with Firebase data",
                );

                // Update stored user with Firebase data
                const updatedUserData = {
                  id: currentUser.uid,
                  email: currentUser.email,
                  name: currentUser.displayName,
                  picture: currentUser.photoURL,
                };
                await AsyncStorage.setItem(
                  "@user",
                  JSON.stringify(updatedUserData),
                );
                setUser(updatedUserData);
              }
            }

            setFirebaseReady(true);
          } else {
            console.log(
              "AuthProvider: ⏳ Firebase auth state not yet restored, waiting...",
            );
            // Force Firebase to check auth state by calling a method that triggers the auth state listener
            try {
              await firebase.auth().currentUser?.getIdToken();
            } catch {
              console.log(
                "AuthProvider: 🔍 No current user token available yet",
              );
            }
          }
        } catch (error) {
          console.log(
            "AuthProvider: ❌ Error checking Firebase auth state:",
            error,
          );
        }
      } else {
        console.log("AuthProvider: ❌ No user restored from storage");
        // Check what's actually in AsyncStorage
        try {
          const storedData = await AsyncStorage.getItem("@user");
          console.log("AuthProvider: 🔍 AsyncStorage content:", storedData);
        } catch (error) {
          console.log("AuthProvider: ❌ Error reading AsyncStorage:", error);
        }
      }
    };

    initializeAuth();

    // Add a timeout to give Firebase time to restore auth state
    const firebaseTimeout = setTimeout(async () => {
      if (!firebaseReady) {
        console.log(
          "AuthProvider: ⏰ Firebase timeout - checking if we should keep stored user",
        );
        setFirebaseReady(true);

        // Check if we have a stored user and Firebase still hasn't restored auth state
        const storedUser = await AsyncStorage.getItem("@user");
        if (storedUser) {
          console.log(
            "AuthProvider: ⏰ Timeout with stored user - keeping user and setting loading to false",
          );
          // Keep the stored user and set loading to false so the app can proceed
          setLoading(false);
        } else {
          console.log(
            "AuthProvider: ⏰ Timeout with no stored user - setting loading to false",
          );
          setLoading(false);
        }
      }
    }, 5000); // 5 second timeout

    // Then listen to Firebase auth state changes
    const unsubscribe = firebase
      .auth()
      .onAuthStateChanged(async (firebaseUser) => {
        console.log(
          "AuthProvider: 🔥 Firebase auth state changed",
          firebaseUser ? "User logged in" : "User logged out",
        );

        // Mark Firebase as ready after first auth state change
        if (!firebaseReady) {
          setFirebaseReady(true);
          console.log("AuthProvider: 🔥 Firebase is now ready");
        }

        if (firebaseUser) {
          console.log(
            "AuthProvider: ✅ Firebase user authenticated:",
            firebaseUser.email,
          );
          console.log("AuthProvider: 🔍 Firebase user UID:", firebaseUser.uid);

          // User is logged in - store in AsyncStorage
          const userData = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            picture: firebaseUser.photoURL,
          };

          // console.log("AuthProvider: 🔍 Setting user data:", userData);
          await AsyncStorage.setItem("@user", JSON.stringify(userData));
          setUser(userData);

          // Also check if this is a different user than what we had before
          if (user && user.id !== firebaseUser.uid) {
            console.log(
              "AuthProvider: 🔄 Different user detected, updating state",
            );
          }
        } else {
          console.log("AuthProvider: ❌ Firebase user logged out");
          // Check if we have a stored user in AsyncStorage
          const storedUser = await AsyncStorage.getItem("@user");

          if (storedUser) {
            // We have a stored user, but Firebase says no user
            // This could mean Firebase auth state hasn't restored yet, or user is actually logged out
            if (!firebaseReady) {
              console.log(
                "AuthProvider: ⏳ Firebase not ready yet, keeping stored user",
              );
              // Keep the stored user until Firebase is ready
              // Don't clear the user, just set loading to false
              setLoading(false);
            } else {
              console.log(
                "AuthProvider: ❌ Firebase ready and no user - user was logged out",
              );
              // Firebase is ready and says no user, so clear everything
              await AsyncStorage.removeItem("@user");
              setUser(null);
            }
          } else {
            console.log(
              "AuthProvider: ❌ No stored user and Firebase says no user - clearing state",
            );
            setUser(null);
          }
        }

        setLoading(false);
      });

    return () => {
      unsubscribe();
      clearTimeout(firebaseTimeout);
    };
  }, []);

  const signOut = async () => {
    try {
      console.log("AuthProvider: Starting sign out process");
      const { signOut: authSignOut } = await import(
        "@/src/services/authService"
      );
      await authSignOut();

      // Clear AsyncStorage on sign out
      await AsyncStorage.removeItem("@user");
      console.log("AuthProvider: Sign out completed and AsyncStorage cleared");
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if there's an error, try to sign out from Firebase directly
      try {
        await firebase.auth().signOut();
        await AsyncStorage.removeItem("@user");
        console.log(
          "AuthProvider: Fallback sign out completed and AsyncStorage cleared",
        );
      } catch (fallbackError) {
        console.error("Fallback sign out failed:", fallbackError);
      }
    }
  };

  // Debug logging - only show essential info
  if (user) {
    console.log("AuthProvider: User authenticated:", user.email);
  } else if (!loading) {
    console.log("AuthProvider: No user, redirecting to auth");
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
