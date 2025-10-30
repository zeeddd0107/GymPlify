import { useEffect, useState, useRef } from "react";
import { View } from "react-native";
import { firebase } from "@/src/services/firebase";
import { AuthContext } from "./AuthContext.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Logger from "@/src/utils/logger";
import pushNotificationService from "@/src/services/pushNotificationService";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Prevent multiple subscriptions
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    let isMounted = true;

    // Fast path: restore from AsyncStorage for instant UI
    const restoreFromStorage = async () => {
      try {
        const userData = await AsyncStorage.getItem("@user");
        if (userData && isMounted) {
          const parsedUser = JSON.parse(userData);
          if (parsedUser?.id) {
            Logger.once("auth-restore", "AuthProvider: ✅ Restored user from storage");
            setUser({
              id: parsedUser.id,
              email: parsedUser.email,
              name: parsedUser.name,
              picture: parsedUser.picture,
            });
          }
        }
      } catch (error) {
        Logger.once("auth-restore-error", "AuthProvider: ❌ Storage restore failed");
      }
    };

    restoreFromStorage();

    // Subscribe to Firebase auth (once, for the lifetime of the app)
    const unsubscribe = firebase.auth().onAuthStateChanged(async (firebaseUser) => {
      if (!isMounted) return;

      Logger.once("auth-listener", "AuthProvider: 🔥 Auth listener active");

      if (firebaseUser) {
        const userData = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          picture: firebaseUser.photoURL,
        };
        await AsyncStorage.setItem("@user", JSON.stringify(userData));
        setUser(userData);

        // Register for push notifications
        pushNotificationService.registerForPushNotifications(firebaseUser.uid).catch((error) => {
          console.error("Failed to register for push notifications:", error);
        });
      } else {
        await AsyncStorage.removeItem("@user");
        setUser(null);
      }

      setLoading(false);
    });

    // Safety timeout: if auth doesn't resolve in 5s, stop loading
    const timeout = setTimeout(() => {
      if (isMounted) {
        Logger.once("auth-timeout", "AuthProvider: ⏰ Auth timeout, stopping loader");
        setLoading(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []); // Subscribe once, never re-run

  const signOut = async () => {
    try {
      Logger.once("auth-signout-start", "AuthProvider: Starting sign out");
      
      // Remove push token before signing out
      if (user?.id) {
        await pushNotificationService.removePushToken(user.id).catch((error) => {
          console.error("Failed to remove push token:", error);
        });
      }
      
      const { signOut: authSignOut } = await import("@/src/services/authService");
      await authSignOut();
      await AsyncStorage.removeItem("@user");
      Logger.once("auth-signout-success", "AuthProvider: Sign out completed");
    } catch (error) {
      Logger.once("auth-signout-error", "AuthProvider: Sign out error, trying fallback");
      try {
        await firebase.auth().signOut();
        await AsyncStorage.removeItem("@user");
      } catch (fallbackError) {
        console.error("Fallback sign out failed:", fallbackError);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
