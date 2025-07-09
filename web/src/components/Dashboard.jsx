import { useState } from "react";
import { useAuth } from "@/context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDumbbell,
  faUser,
  faChalkboardTeacher,
  faBox,
  faClipboard,
  faBook,
  faUsers,
} from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  const { signOut } = useAuth();

  const navItems = [
    { label: "Dashboard", icon: faBox, key: "dashboard" },
    { label: "Subscriptions", icon: faUser, key: "subscriptions" },
    { label: "Coaching Sessions", icon: faChalkboardTeacher, key: "coaching" },
    { label: "Inventory", icon: faBox, key: "inventory" },
    {
      label: "Subscription Requests",
      icon: faClipboard,
      key: "subscription-requests",
    },
    { label: "Equipment Guide", icon: faBook, key: "equipment-guide" },
    { label: "Staff", icon: faUsers, key: "staff" },
  ];

  const [activeNav, setActiveNav] = useState("dashboard");

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // setErrorMsg("Failed to sign out"); // This line was removed as per the edit hint.
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white shadow-lg h-screen fixed flex flex-col justify-between overflow-auto">
        <div>
          <div className="p-6 text-center border-b border-[#b1b2b3]">
            <div className="flex items-center justify-center gap-2">
              <FontAwesomeIcon
                icon={faDumbbell}
                className="text-primary text-4xl"
              />
              <h1 className="text-2xl font-bold">GymPlify</h1>
            </div>
          </div>
          <nav className="mt-6 flex-1">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.key} className="px-3">
                  <button
                    onClick={() => setActiveNav(item.key)}
                    className={`w-full flex items-center gap-3 px-4 rounded-xl transition-colors font-medium text-left
                      ${
                        activeNav === item.key
                          ? "bg-primary/10 text-primary font-semibold py-3"
                          : "text-gray-700 hover:bg-gray-100 py-3"
                      }
                    `}
                  >
                    <FontAwesomeIcon icon={item.icon} className="text-lg" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
    </div>
  );
};

export default Dashboard;
