import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import authService from "@/services/authService";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";
import {
  startListeningForSubscriptionRequests,
  stopListeningForSubscriptionRequests,
} from "@/services/subscriptionRequestListener";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  // Removed needsEmailVerification

  // Initialize session timeout management only when user is logged in
  const sessionTimeout = useSessionTimeout(user);
  const { showWarning, timeRemaining, extendSession, logoutNow } =
    sessionTimeout;

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      // Check if OTP verification is pending
      const otpPending = localStorage.getItem("otpPending");
      
      if (firebaseUser && otpPending === "true") {
        // User is logged in but OTP verification is pending
        // Don't set the user yet - wait for OTP verification
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Convert Firebase User to plain object for better reactivity
      if (firebaseUser) {
        const userPlainObject = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          phoneNumber: firebaseUser.phoneNumber,
          providerData: firebaseUser.providerData,
          metadata: firebaseUser.metadata,
        };
        console.log(" User authenticated, photoURL:", userPlainObject.photoURL);
        setUser(userPlainObject);
      } else {
        setUser(null);
      }
      
      setLoading(false);
      if (firebaseUser) {
        const token = await firebaseUser.getIdTokenResult();
        const userIsAdmin = !!token.claims.admin;
        setIsAdmin(userIsAdmin);
        
        // Start listening for subscription requests if user is admin
        if (userIsAdmin) {
          startListeningForSubscriptionRequests(firebaseUser.uid);
        }
      } else {
        setIsAdmin(false);
        // Stop listening when user logs out
        stopListeningForSubscriptionRequests();
      }
    });
    return () => {
      unsubscribe();
      stopListeningForSubscriptionRequests();
    };
  }, []);

  const register = (email, password) => authService.register(email, password);
  const signIn = (email, password) => authService.signIn(email, password);
  const signInWithGoogle = () => authService.signInWithGoogle();
  const signOut = () => authService.signOut();
  const getUsers = () => authService.getUsers();
  const deleteUser = (uid) => authService.deleteUser(uid);
  
  // Wrap updateProfile to refresh user state after update
  const updateProfile = async (profileData) => {
    const result = await authService.updateProfile(profileData);
    
    // Force a complete reload of the user to ensure all properties are updated
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      await currentUser.reload();
      const refreshedUser = authService.getCurrentUser();
      console.log("Profile updated, refreshed user photoURL:", refreshedUser?.photoURL);
      
      // Create a plain object from the user to ensure proper reactivity
      // Firebase User objects have special getters that don't work well with spread
      const userPlainObject = {
        uid: refreshedUser.uid,
        email: refreshedUser.email,
        displayName: refreshedUser.displayName,
        photoURL: refreshedUser.photoURL,
        emailVerified: refreshedUser.emailVerified,
        phoneNumber: refreshedUser.phoneNumber,
        providerData: refreshedUser.providerData,
        metadata: refreshedUser.metadata,
        // Add any other properties needed
      };
      
      // Force state update with new object reference
      setUser(userPlainObject);
    }
    
    return result;
  };
  
  const updatePassword = (currentPassword, newPassword) =>
    authService.updatePassword(currentPassword, newPassword);
  const getUserData = (uid) => authService.getUserData(uid);

  const value = {
    user,
    loading,
    isAdmin,
    // Removed needsEmailVerification
    register,
    signIn,
    signInWithGoogle,
    signOut,
    getUsers,
    deleteUser,
    updateProfile,
    updatePassword,
    getUserData,
    isAuthenticated: authService.isAuthenticated(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {user && (
        <SessionTimeoutWarning
          visible={showWarning}
          timeRemaining={timeRemaining}
          onExtend={extendSession}
          onLogout={logoutNow}
        />
      )}
    </AuthContext.Provider>
  );
};
