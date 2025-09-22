import { firebase, googleProvider } from "@/src/services/firebase";
import { firestore } from "@/src/services/firebase";
import { sendEmailVerification } from "firebase/auth";

// Function to generate custom Member ID
const generateCustomMemberId = async () => {
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
  // Send email verification
  await sendEmailVerification(user);

  // Add a small delay to ensure user document is fully written
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Get user data from Firestore to access customMemberId and displayName
  const userDoc = await firestore.collection("users").doc(user.uid).get();
  const userData = userDoc.data();

  console.log("User data for subscription creation:", userData);

  // Create a new subscription for the user
  // Use server timestamp for consistency and accuracy
  const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();

  // Calculate endDate as one month after startDate
  // We'll use a batch write to ensure both timestamps are consistent
  const batch = firestore.batch();
  const subscriptionRef = firestore.collection("subscriptions").doc();

  // Get current date for endDate calculation
  const now = new Date();
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 1);

  const subscriptionData = {
    userId: user.uid,
    plan: "basic",
    status: "active",
    startDate: serverTimestamp,
    endDate: firebase.firestore.Timestamp.fromDate(endDate),
    createdAt: serverTimestamp,
    customMemberId: userData?.customMemberId || null,
    displayName: userData?.displayName || user.email || "Unknown User",
  };

  console.log("Subscription data to be created:", subscriptionData);

  batch.set(subscriptionRef, subscriptionData);

  await batch.commit();
  return user;
}

export async function loginUser(email, password) {
  const userCredential = await firebase
    .auth()
    .signInWithEmailAndPassword(email, password);
  const user = userCredential.user;
  // Only allow login if email is verified
  if (!user.emailVerified) {
    throw new Error("Please verify your email address before logging in.");
  }
  // Only update lastLogin, not createdAt
  await firestore.collection("users").doc(user.uid).set(
    {
      lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return user;
}

export async function signInWithGoogle() {
  const result = await firebase.auth().signInWithPopup(googleProvider);
  const user = result.user;
  await upsertUserInFirestore(user, "google");

  // Add a small delay to ensure user document is fully written
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Check if user already has a subscription
  const existingSubs = await firestore
    .collection("subscriptions")
    .where("userId", "==", user.uid)
    .get();

  if (existingSubs.empty) {
    // Get user data from Firestore to access customMemberId and displayName
    const userDoc = await firestore.collection("users").doc(user.uid).get();
    const userData = userDoc.data();

    console.log("User data for Google subscription creation:", userData);

    // Create a new subscription only if one doesn't exist
    // Use server timestamp for consistency and accuracy
    const serverTimestamp = firebase.firestore.FieldValue.serverTimestamp();

    // Calculate endDate as one month after startDate
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    const batch = firestore.batch();
    const subscriptionRef = firestore.collection("subscriptions").doc();

    const subscriptionData = {
      userId: user.uid,
      plan: "basic",
      status: "active",
      startDate: serverTimestamp,
      endDate: firebase.firestore.Timestamp.fromDate(endDate),
      createdAt: serverTimestamp,
      customMemberId: userData?.customMemberId || null,
      displayName: userData?.displayName || user.email || "Unknown User",
    };

    console.log("Google subscription data to be created:", subscriptionData);

    batch.set(subscriptionRef, subscriptionData);

    await batch.commit();
  }

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
  await firestore.collection("users").doc(uid).set(
    {
      lastLogout: firebase.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function signOut() {
  const user = firebase.auth().currentUser;
  if (user) {
    await setLastLogout(user.uid);
  }
  await firebase.auth().signOut();
}
