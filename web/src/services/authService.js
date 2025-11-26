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
import loginAttemptService from "./loginAttemptService";

class AuthService {
  // Let me register a new user in both Firebase and our backend
  async register(email, password) {
    try {
      // First, let me create the user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Now I need to add them to our Firestore users collection
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

      // Time to register them in our backend too
      const response = await api.post("/auth/register", {
        email,
        password,
      });

      // Let me store that custom token from the backend
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

  // Let me sign in a user with their email and password
  async signIn(email, password) {
    try {
      // First, let me check if this account is locked
      const isLocked = await loginAttemptService.isAccountLocked(email);
      if (isLocked) {
        const remainingTime =
          await loginAttemptService.getRemainingLockoutTime(email);
        const minutes = Math.ceil(remainingTime / 60);
        throw new Error(
          `Account locked due to multiple failed attempts. Try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
        );
      }

      // IMPORTANT: Set OTP pending flag BEFORE signing in
      // This prevents the race condition where onAuthStateChanged fires before we can set the flag
      localStorage.setItem("otpPending", "true");
      localStorage.setItem("pendingEmail", email);

      // Validate credentials by signing in temporarily
      await signInWithEmailAndPassword(auth, email, password);
      // Great! Now let me reset their login attempts since they got in
      await loginAttemptService.resetAttempts(email);

      // And clear any local attempts to keep things clean
      loginAttemptService.clearAllLocalAttempts();

      // Try to get backend token (optional - may fail if backend is not running)
      // Silently fail if backend is unavailable - OTP flow doesn't require it
      try {
        const response = await api.post("/auth/login", {
          email,
          password,
        });

        if (response.data.token) {
          localStorage.setItem("authToken", response.data.token);
        }
      } catch {
        // Silently continue - backend token is optional for web OTP flow
      }

      // IMPORTANT: Sign out immediately - user needs to verify OTP first
      await signOut(auth);

      // Return indicator that OTP verification is needed
      return {
        requiresOTP: true,
        email: email,
        user: null,
      };
    } catch (error) {
      // Clear OTP pending flags on error
      localStorage.removeItem("otpPending");
      localStorage.removeItem("pendingEmail");

      // Firebase is giving me some specific error codes to handle
      if (error.code === "auth/invalid-email") {
        throw new Error("Please enter a valid email address.");
      } else if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password"
      ) {
        // Let me record this failed attempt and get a status message
        const attemptResult =
          await loginAttemptService.recordFailedAttempt(email);
        const statusMessage =
          await loginAttemptService.getAttemptStatusMessage(email);

        if (attemptResult.isLocked) {
          throw new Error(statusMessage);
        } else {
          throw new Error(`Invalid email or password. ${statusMessage || ""}`);
        }
      } else if (error.code === "auth/user-not-found") {
        throw new Error("No account found with this email.");
      } else if (error.code === "auth/too-many-requests") {
        throw new Error("Too many failed attempts. Please try again later.");
      } else if (error.code === "auth/user-disabled") {
        throw new Error(
          "Your account has been disabled. Please contact support.",
        );
      } else if (error.message.includes("Account locked")) {
        // Just pass along the lockout message as-is
        throw error;
      } else {
        // For any other errors, let me give a friendly message instead of the raw Firebase error
        throw new Error(
          "Login failed. Please check your email and password and try again.",
        );
      }
    }
  }

  // Let me handle Google sign-in
  async signInWithGoogle() {
    try {
      // First, let me do the Firebase popup authentication
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Now let me add or update this user in our Firestore users collection
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

      // Time to register/login them in our backend with their Google data
      const response = await api.post("/auth/google", {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
      });

      if (response.data.token) {
        // Let me store that backend token
        localStorage.setItem("authToken", response.data.token);
      }

      // Let me reset their login attempts since Google sign-in was successful
      await loginAttemptService.resetAttempts(user.email);
      loginAttemptService.clearAllLocalAttempts();

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Let me sign out the user
  async signOut() {
    try {
      const user = auth.currentUser;
      if (user) {
        // Let me update their last logout time in Firestore
        await setDoc(
          doc(db, "users", user.uid),
          {
            lastLogout: serverTimestamp(),
          },
          { merge: true },
        );

        // Let me clear any login attempts for this user's email
        if (user.email) {
          await loginAttemptService.resetAttempts(user.email);
        }
      }

      // And clear all local login attempts on logout
      loginAttemptService.clearAllLocalAttempts();

      await signOut(auth);
      localStorage.removeItem("authToken");
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Let me get the current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Let me listen to auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }

  // Let me check if the user is authenticated
  isAuthenticated() {
    return !!auth.currentUser && !!localStorage.getItem("authToken");
  }

  // Let me get the users list (this is an admin function)
  async getUsers() {
    try {
      const response = await api.get("/auth/users");
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Let me delete a user (this is an admin function)
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

  // Let me update the user's profile
  async updateProfile(profileData) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }

      // Let me update their Firebase Auth profile
      const updateData = {
        displayName: profileData.displayName,
        phoneNumber: profileData.phoneNumber,
      };

      // Include photoURL if provided
      if (profileData.photoURL) {
        updateData.photoURL = profileData.photoURL;
      }

      await updateProfile(user, updateData);

      // And update their Firestore user document
      const firestoreData = {
        displayName: profileData.displayName,
        phoneNumber: profileData.phoneNumber,
        updatedAt: serverTimestamp(),
      };

      // Include photoURL in Firestore if provided
      if (profileData.photoURL) {
        firestoreData.photoURL = profileData.photoURL;
      }

      await setDoc(doc(db, "users", user.uid), firestoreData, { merge: true });

      // Force a refresh of the user's token to trigger auth state change
      await user.reload();

      return auth.currentUser;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Let me get user data from Firestore
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

  // Let me update the user's password
  async updatePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }

      // Let me re-authenticate the user with their current password
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword,
      );
      await reauthenticateWithCredential(user, credential);

      // Now let me update their password
      await updatePassword(user, newPassword);

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new AuthService();
