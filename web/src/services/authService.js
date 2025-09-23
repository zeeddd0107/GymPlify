import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth, googleProvider, db } from "@/config/firebase";
import { doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
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
      const user = userCredential.user;

      // 2. Add user to Firestore 'users' collection (only set createdAt if not exists)
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
            provider: "password",
            lastLogin: serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            provider: "password",
            lastLogin: serverTimestamp(),
          },
          { merge: true },
        );
      }

      // 3. Register user in backend
      const response = await api.post("/auth/register", {
        email,
        password,
      });

      // 4. Store the custom token from backend
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
      const user = userCredential.user;

      // Update lastLogin in Firestore (do not update createdAt)
      await setDoc(
        doc(db, "users", user.uid),
        {
          lastLogin: serverTimestamp(),
        },
        { merge: true },
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
      // Step 1: Firebase popup authentication
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Add or update user in Firestore 'users' collection
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            createdAt: serverTimestamp(),
            provider: "google",
            lastLogin: serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || null,
            photoURL: user.photoURL || null,
            provider: "google",
            lastLogin: serverTimestamp(),
          },
          { merge: true },
        );
      }

      // Register/login user in backend with Google data
      const response = await api.post("/auth/google", {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
      });

      if (response.data.token) {
        // Step 4: Store backend token
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
      const user = auth.currentUser;
      if (user) {
        // Update lastLogout in Firestore
        await setDoc(
          doc(db, "users", user.uid),
          {
            lastLogout: serverTimestamp(),
          },
          { merge: true },
        );
      }
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

  // Update user profile
  async updateProfile(profileData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profileData.displayName,
        phoneNumber: profileData.phoneNumber,
      });

      // Update Firestore user document
      await setDoc(
        doc(db, "users", user.uid),
        {
          displayName: profileData.displayName,
          phoneNumber: profileData.phoneNumber,
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Get user data from Firestore
  async getUserData(uid) {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        throw new Error("User document not found");
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Update user password
  async updatePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new AuthService();
