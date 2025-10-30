import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "@/context";
import { LoginForm, RegisterForm, Dashboard } from "@/components";
import OTPVerification from "@/components/forms/OTPVerification";
import ResetPassword from "@/components/forms/ResetPassword";
import { sendOTP } from "@/services/otpService";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/config/firebase";
import DashboardHome from "./DashboardHome";
import { Subscriptions, Sessions, Inventory, Requests, Guide, Staff } from ".";
import Admin from "./Admin";
import QR from "./QR";
import ProfileSettings from "./ProfileSettings";

function App() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [otpData, setOtpData] = useState(null); // { email, otpId, expiresAt, password, mode }
  const [resetPasswordData, setResetPasswordData] = useState(null); // { email, resetCode }

  // Check for existing OTP pending state on mount (in case of page refresh)
  useEffect(() => {
    const otpPending = localStorage.getItem("otpPending");
    const pendingEmail = localStorage.getItem("pendingEmail");
    
    if (otpPending === "true" && pendingEmail && !otpData) {
      // User refreshed during OTP verification - clear the flags
      localStorage.removeItem("otpPending");
      localStorage.removeItem("pendingEmail");
    }
  }, [otpData]);

  // Handle successful login - send OTP
  const handleLoginSuccess = async (email, password) => {
    try {
      // Send OTP to user's email
      const response = await sendOTP(email, 'login');
      
      // Store OTP data and show verification screen
      setOtpData({
        email,
        password, // Store temporarily for re-authentication after OTP
        otpId: response.otpId,
        expiresAt: response.expiresAt,
        mode: 'login', // Explicitly set mode as login
      });
    } catch (error) {
      console.error('Failed to send OTP:', error);
      throw error;
    }
  };

  // Handle successful OTP verification
  const handleOTPVerified = async (response) => {
    try {
      // Check if this is for password reset
      if (otpData.mode === 'forgot-password') {
        console.log('OTP verified for password reset');
        
        // Show reset password screen with reset code
        setResetPasswordData({
          email: otpData.email,
          resetCode: response.resetCode,
        });
        
        // Clear OTP data
        setOtpData(null);
        return;
      }
      
      // Otherwise, it's for login
      // Clear OTP pending flags BEFORE re-authentication
      localStorage.removeItem("otpPending");
      localStorage.removeItem("pendingEmail");
      
      // Re-authenticate user with their credentials
      const userCredential = await signInWithEmailAndPassword(auth, otpData.email, otpData.password);
      const user = userCredential.user;
      
      // Update last login time in Firestore
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
      const { db } = await import("@/config/firebase");
      
      await setDoc(
        doc(db, "users", user.uid),
        {
          lastLogin: serverTimestamp(),
        },
        { merge: true }
      );
      
      // Clear OTP data
      setOtpData(null);
      
      // Auth state change will be detected by AuthProvider
    } catch (error) {
      console.error('Failed to complete authentication:', error);
      throw error;
    }
  };

  // Handle password reset success
  const handleResetPasswordSuccess = () => {
    // Go back to login (modal already shown in ResetPassword component)
    setResetPasswordData(null);
  };

  // Handle back to login from OTP screen
  const handleBackToLogin = () => {
    // Clear OTP pending flags
    localStorage.removeItem("otpPending");
    localStorage.removeItem("pendingEmail");
    setOtpData(null);
  };

  // Show loading animation while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, show appropriate screen
  if (!user) {
    // Show Reset Password screen if we have reset password data
    if (resetPasswordData) {
      return (
        <ResetPassword
          email={resetPasswordData.email}
          resetCode={resetPasswordData.resetCode}
          onBack={() => setResetPasswordData(null)}
          onSuccess={handleResetPasswordSuccess}
        />
      );
    }

    // Show OTP verification if we have OTP data
    if (otpData) {
      return (
        <OTPVerification
          email={otpData.email}
          otpId={otpData.otpId}
          expiresAt={otpData.expiresAt}
          mode={otpData.mode}
          onVerified={handleOTPVerified}
          onBack={handleBackToLogin}
        />
      );
    }
    
    // Show register or login form
    return showRegister ? (
      <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginForm 
        onSwitchToRegister={() => setShowRegister(true)}
        onLoginSuccess={handleLoginSuccess}
        onForgotPasswordFlow={(email, resetCode) => {
          setResetPasswordData({ email, resetCode });
        }}
      />
    );
  }

  // If user is logged in, show dashboard and subroutes
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />}>
          <Route index element={<DashboardHome />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="requests" element={<Requests />} />
          <Route path="guide" element={<Guide />} />
          <Route path="staff" element={<Staff />} />
          <Route path="qr" element={<QR />} />
          <Route path="profile" element={<ProfileSettings />} />
        </Route>
        <Route path="admin" element={<Admin />} />
        {/* Catch all unknown routes and redirect to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
