import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "@/config/firebase";
import api from "./api";

class AuthService {
  // Register user with Firebase and backend
  async register(email, password) {
    try {
      // 1. Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // 2. Register user in backend
      const response = await api.post("/auth/register", {
        email,
        password,
      });

      // 3. Store the custom token from backend
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      return {
        user: userCredential.user,
        backendData: response.data,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Sign in user with email/password
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Get custom token from backend
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      return userCredential.user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Sign in with Google
  async signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Register/login user in backend with Google data
      const response = await api.post("/auth/google", {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
      });

      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
      }

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Sign out user
  async signOut() {
    try {
      await signOut(auth);
      localStorage.removeItem("authToken");
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!auth.currentUser && !!localStorage.getItem("authToken");
  }

  // Get users list (admin function)
  async getUsers() {
    try {
      const response = await api.get("/auth/users");
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Delete user (admin function)
  async deleteUser(uid) {
    try {
      const response = await api.delete("/auth/delete", {
        data: { uid },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new AuthService();
