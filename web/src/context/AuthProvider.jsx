import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import authService from "@/services/authService";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  // Removed needsEmailVerification

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
    isAuthenticated: authService.isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
