import { firebase, googleProvider } from "./firebase";
import { firestore } from "./firebase";
import { sendEmailVerification } from "firebase/auth";

export async function upsertUserInFirestore(user, provider) {
  if (!user) return;
  const userRef = firestore.collection("users").doc(user.uid);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    await userRef.set(
      {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: "client",
        provider,
        photoURL: user.photoURL,
        qrCodeValue: user.uid, // Store unique QR code value
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
        photoURL: user.photoURL,
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
  // Create a new subscription for the user
  // Get the current timestamp for startDate
  const startDate = firebase.firestore.Timestamp.now();
  // Calculate endDate as one month after startDate
  const endDate = new Date(startDate.toDate());
  endDate.setMonth(endDate.getMonth() + 1);
  // Add the subscription document with endDate
  await firestore.collection("subscriptions").add({
    userId: user.uid,
    plan: "basic",
    status: "active",
    startDate: startDate,
    endDate: firebase.firestore.Timestamp.fromDate(endDate), // endDate is one month after startDate
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
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
  // Always create a new subscription for debugging
  // Get the current timestamp for startDate
  const startDate = firebase.firestore.Timestamp.now();
  // Calculate endDate as one month after startDate
  const endDate = new Date(startDate.toDate());
  endDate.setMonth(endDate.getMonth() + 1);
  await firestore.collection("subscriptions").add({
    userId: user.uid,
    plan: "basic",
    status: "active",
    startDate: startDate,
    endDate: firebase.firestore.Timestamp.fromDate(endDate), // endDate is one month after startDate
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return user;
}

export async function setLastLogout(uid) {
  await firestore.collection("users").doc(uid).set(
    {
      lastLogout: firebase.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
