import { firebase, googleProvider } from "@/src/services/firebase";
import { firestore } from "@/src/services/firebase";

// Function to generate custom Member ID
export const generateCustomMemberId = async () => {
  try {
    // Get the counter document
    const counterRef = firestore.collection("counters").doc("memberId");
    const counterDoc = await counterRef.get();

    let nextNumber = 1;
    if (counterDoc.exists) {
      nextNumber = counterDoc.data().currentNumber + 1;
    }

    // Update the counter
    await counterRef.set({
      currentNumber: nextNumber,
      lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Generate the custom Member ID (MBR-00001 format)
    const memberId = `MBR-${nextNumber.toString().padStart(5, "0")}`;
    return memberId;
  } catch (error) {
    console.error("Error generating Member ID:", error);
    // Fallback: use timestamp-based ID
    const timestamp = Date.now();
    return `MBR-${timestamp.toString().slice(-5)}`;
  }
};

export async function upsertUserInFirestore(user, provider) {
  if (!user) return;
  const userRef = firestore.collection("users").doc(user.uid);
  const userSnap = await userRef.get();

  // Build a non-null photoURL fallback using ui-avatars
  const fallbackPhotoURL =
    user.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      user.displayName || user.email || "User",
    )}&background=0D8ABC&color=fff&bold=true`;

  if (!userSnap.exists) {
    // Generate custom Member ID for new users
    const customMemberId = await generateCustomMemberId();

    await userRef.set(
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        name: user.displayName, // Also set name field for consistency
        role: "client",
        provider,
        photoURL: fallbackPhotoURL,
        qrCodeValue: user.uid, // Store unique QR code value
        customMemberId: customMemberId, // Store custom Member ID
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  } else {
    // Existing user: do not update createdAt
    await userRef.set(
      {
        uid: user.uid,
        email: user.email,
        provider,
        displayName: user.displayName,
        name: user.displayName, // Also set name field for consistency
        role: "client", // Add role field for existing users too
        photoURL: fallbackPhotoURL,
        qrCodeValue: userSnap.data().qrCodeValue || user.uid, // Preserve or set QR code value
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }
}

export async function registerUser(email, password) {
  const userCredential = await firebase
    .auth()
    .createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;
  await upsertUserInFirestore(user, "password");

  // Note: Email verification is handled by OTP system, not Firebase email links
  console.log("User registration completed successfully");
  return user;
}

export async function loginUser(email, password) {
  const userCredential = await firebase
    .auth()
    .signInWithEmailAndPassword(email, password);
  const user = userCredential.user;
  
  // Note: Email verification is handled by OTP system after login
  // No need to check user.emailVerified here
  
  // Only update lastLogin if user document exists
  const userDoc = await firestore.collection("users").doc(user.uid).get();
  if (userDoc.exists) {
    await firestore.collection("users").doc(user.uid).update({
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }
  return user;
}

export async function signInWithGoogle() {
  const result = await firebase.auth().signInWithPopup(googleProvider);
  const user = result.user;
  await upsertUserInFirestore(user, "google");

  // Google authentication completed - no automatic subscription creation
  console.log("Google authentication completed successfully");
  return user;
}

// Function to check if subscription is expired
const isSubscriptionExpired = (endDate) => {
  if (!endDate) return false;
  const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
  const today = new Date();
  // Set both dates to start of day for accurate comparison
  const endDateOnly = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
  );
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  return endDateOnly < todayOnly;
};

// Function to update expired subscriptions
export async function updateExpiredSubscriptions() {
  try {
    const subscriptionsRef = firestore.collection("subscriptions");
    const snapshot = await subscriptionsRef.get();

    const batch = firestore.batch();
    let updateCount = 0;

    snapshot.forEach((doc) => {
      const subscription = doc.data();
      if (
        isSubscriptionExpired(subscription.endDate) &&
        subscription.status !== "expired"
      ) {
        batch.update(doc.ref, { status: "expired" });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Updated ${updateCount} expired subscriptions`);
    }
  } catch (error) {
    console.error("Error updating expired subscriptions:", error);
  }
}

export async function setLastLogout(uid) {
  // Only update lastLogout if user document exists
  const userDoc = await firestore.collection("users").doc(uid).get();
  if (userDoc.exists) {
    await firestore.collection("users").doc(uid).update({
      lastLogout: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }
}

export async function signOut() {
  const user = firebase.auth().currentUser;
  if (user) {
    await setLastLogout(user.uid);
  }
  await firebase.auth().signOut();
}
