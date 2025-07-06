import { firebase } from "./firebase";

export async function registerUser(email, password) {
    const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
    return userCredential.user;
}

export async function loginUser(email, password) {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    return userCredential.user;
}
