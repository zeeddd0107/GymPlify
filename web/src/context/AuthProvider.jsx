import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import authService from "@/services/authService";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
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
