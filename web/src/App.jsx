import { useState } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithCustomToken
} from 'firebase/auth';
import app from './firebase';
import axios from './api'; 

const auth = getAuth(app);

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  // 🔐 Log in using Firebase custom token
  const loginWithCustomToken = async (tokenFromBackend) => {
    try {
      const userCred = await signInWithCustomToken(auth, tokenFromBackend);
      console.log("Logged in with custom token:", userCred.user);
      setMessage(`Welcome (via token), ${userCred.user.email}`);
    } catch (err) {
      console.error("Custom token login failed:", err);
      setMessage(err.message);
    }
  };

  // 📥 Handle registration and use token to sign in
  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post('/auth/register', { email, password });
      const { token } = response.data;

      await loginWithCustomToken(token); // ✅ login immediately after register
    } catch (error) {
      console.error("Registration failed:", error);
      setMessage(error.response?.data?.error || error.message);
    }
  };

  // 🔐 Handle normal login
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setMessage(`Welcome, ${user.email}`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>GymPlify {mode === 'login' ? 'Login' : 'Register'}</h1>

      <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
        <div>
          <label>Email:</label><br />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div style={{ marginTop: '1rem' }}>
          <label>Password:</label><br />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>
          {mode === 'login' ? 'Login' : 'Register'}
        </button>
      </form>

      <div style={{ marginTop: '1rem' }}>
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          Switch to {mode === 'login' ? 'Register' : 'Login'}
        </button>
      </div>

      {message && (
        <p style={{ marginTop: '1rem', color: message.startsWith('Welcome') ? 'green' : 'red' }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default App;
