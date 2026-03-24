import { db } from "@/config/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

class UserService {
  /**
   * Save or update user information in the Firestore database
   * @param {Object} user - The Firebase Auth user object
   * @param {string} provider - The authentication provider (e.g., "password", "google")
   */
  async saveUserToFirestore(user, provider) {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      provider: provider,
      lastLogin: serverTimestamp(),
    };

    // Only set createdAt if the user doesn't already exist
    if (!userSnap.exists()) {
      userData.createdAt = serverTimestamp();
    }

    await setDoc(userRef, userData, { merge: true });
  }

  // Let me update the user's last logout time
  async updateUserLastLogout(uid) {
    await setDoc(
      doc(db, "users", uid),
      {
        lastLogout: serverTimestamp(),
      },
      { merge: true },
    );
  }

  // Let me update the user's profile data
  async updateUserProfile(uid, profileData) {
    const firestoreData = {
      displayName: profileData.displayName,
      phoneNumber: profileData.phoneNumber,
      updatedAt: serverTimestamp(),
    };

    if (profileData.photoURL) {
      firestoreData.photoURL = profileData.photoURL;
    }

    await setDoc(doc(db, "users", uid), firestoreData, { merge: true });
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
}

export default new UserService();
