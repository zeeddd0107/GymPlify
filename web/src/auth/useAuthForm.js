// Logic for handling user authentication in a React application using Firebase and a custom backend API.
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, signInWithCustomToken } from "firebase/auth";
import app from "../firebase";
import axios from "../api";

const auth = getAuth(app);

export function useAuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [mode, setMode] = useState("login");

  const loginWithCustomToken = async (token) => {
    try {
      const userCred = await signInWithCustomToken(auth, token);
      setMessage(`Welcome (via token), ${userCred.user.email}`);
    } catch (err) {
      console.error("Custom token login failed:", err);
      setMessage(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post("/auth/register", { email, password });
      await loginWithCustomToken(res.data.token);
    } catch (err) {
      setMessage(err.response?.data?.error || err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      setMessage(`Welcome, ${userCred.user.email}`);
    } catch (err) {
      setMessage(err.message);
    }
  };

  return {
    email,
    password,
    setEmail,
    setPassword,
    message,
    mode,
    setMode,
    handleRegister,
    handleLogin,
  };
}
