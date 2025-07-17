import { firebase, googleProvider } from "./firebase";
import { firestore } from "./firebase";

export async function upsertUserInFirestore(user, provider) {
  if (!user) return;
  await firestore.collection("users").doc(user.uid).set({
    uid: user.uid,
    email: user.email,
    provider,
    displayName: user.displayName,
    photoURL: user.photoURL,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastLoggedIn: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}

export async function registerUser(email, password) {
  const userCredential = await firebase
    .auth()
    .createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;
  await upsertUserInFirestore(user, "password");
  return user;
}

export async function loginUser(email, password) {
  const userCredential = await firebase
    .auth()
    .signInWithEmailAndPassword(email, password);
  return userCredential.user;
}

export async function signInWithGoogle() {
  const result = await firebase.auth().signInWithPopup(googleProvider);
  const user = result.user;
  await upsertUserInFirestore(user, "google");
  return user;
}

export async function setLastLogout(uid) {
  await firestore.collection("users").doc(uid).set({
    lastLogout: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
}
