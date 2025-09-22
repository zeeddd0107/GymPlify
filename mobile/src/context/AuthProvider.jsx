import { useEffect, useState } from "react";
import { View } from "react-native";
import { firebase } from "@/src/services/firebase";
import { AuthContext } from "./AuthContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log("AuthProvider: Starting sign out process");
      const { signOut: authSignOut } = await import(
        "@/src/services/authService"
      );
      await authSignOut();
      console.log("AuthProvider: Sign out completed");
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if there's an error, try to sign out from Firebase directly
      try {
        await firebase.auth().signOut();
        console.log("AuthProvider: Fallback sign out completed");
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
