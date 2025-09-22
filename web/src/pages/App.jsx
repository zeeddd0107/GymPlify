import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "@/context";
import { LoginForm, RegisterForm, Dashboard } from "@/components";
import DashboardHome from "./DashboardHome";
import { Subscriptions, Sessions, Inventory, Requests, Guide, Staff } from ".";
import Admin from "./Admin";
import QR from "./QR";
import ProfileSettings from "./ProfileSettings";

function App() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  // Remove all email verification state/logic

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

  // If no user is logged in, show login or register form
  if (!user) {
    return showRegister ? (
      <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
    ) : (
      <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
