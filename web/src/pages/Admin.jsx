import { useAuth } from "@/context";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/");
    }
  }, [isAdmin, loading, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-4">
        Welcome, admin! You have full control over the system.
      </p>
      {/* Add admin controls here, e.g. user management, system settings, etc. */}
      <div className="mt-6">
        <a href="/" className="text-blue-600 hover:underline">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
};

export default Admin;
