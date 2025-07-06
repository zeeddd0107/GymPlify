import React, { createContext, useContext, useEffect, useState } from "react";
import authService from "@/services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to auth state changes
    const unsubscribe = authService.onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (email, password) => {
    try {
      const result = await authService.register(email, password);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const result = await authService.signIn(email, password);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      throw error;
    }
  };

  const getUsers = async () => {
    try {
      return await authService.getUsers();
    } catch (error) {
      throw error;
    }
  };

  const deleteUser = async (uid) => {
    try {
      return await authService.deleteUser(uid);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    register,
    signIn,
    signOut,
    getUsers,
    deleteUser,
    isAuthenticated: authService.isAuthenticated(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
