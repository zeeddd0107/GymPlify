import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import authService from "@/services/authService";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
import { SessionTimeoutWarning } from "@/components/SessionTimeoutWarning";

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
    const unsubscribe = authService.onAuthStateChange(async (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        const token = await user.getIdTokenResult();
        setIsAdmin(!!token.claims.admin);
        // Removed needsEmailVerification logic
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const register = (email, password) => authService.register(email, password);
  const signIn = (email, password) => authService.signIn(email, password);
  const signInWithGoogle = () => authService.signInWithGoogle();
  const signOut = () => authService.signOut();
  const getUsers = () => authService.getUsers();
  const deleteUser = (uid) => authService.deleteUser(uid);
  const updateProfile = (profileData) => authService.updateProfile(profileData);
  const updatePassword = (currentPassword, newPassword) =>
    authService.updatePassword(currentPassword, newPassword);

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
