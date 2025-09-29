import { Outlet } from "react-router-dom";
import { FaSearch, FaUsers } from "react-icons/fa";
import {
  MdSpaceDashboard,
  MdOutlineSubscriptions,
  MdOutlineInventory,
  MdOutlinePendingActions,
  MdOutlinePlayCircle,
} from "react-icons/md";
import { GiWeightLiftingUp } from "react-icons/gi";
import { useDashboard } from "../hooks";
import Sidebar from "../ui/Sidebar";
import BottomNavigation from "../ui/BottomNavigation";
import Navbar from "../ui/Navbar";

const Dashboard = () => {
  // Use the custom dashboard hook for all logic
  const { open, activeMenu, Menus, handleMenuClick, toggleSidebar } =
    useDashboard();

  // Map menu icons to actual components
  const getMenuIcon = (iconName) => {
    const iconMap = {
      MdSpaceDashboard: <MdSpaceDashboard />,
      MdOutlineSubscriptions: <MdOutlineSubscriptions />,
      GiWeightLiftingUp: <GiWeightLiftingUp />,
      MdOutlineInventory: <MdOutlineInventory />,
      MdOutlinePendingActions: <MdOutlinePendingActions />,
      MdOutlinePlayCircle: <MdOutlinePlayCircle />,
      FaSearch: <FaSearch />,
      FaUsers: <FaUsers />,
    };
    return iconMap[iconName] || null;
  };

  return (
    <div className="w-full flex">
      {/* Sidebar section - only visible on lg screens and above */}
      <Sidebar
        open={open}
        activeMenu={activeMenu}
        menus={Menus}
        onMenuClick={handleMenuClick}
        onToggleSidebar={toggleSidebar}
        getMenuIcon={getMenuIcon}
      />

      {/* Dashboard Layout section */}
      <div
        className={`h-screen flex-1 bg-zinc-100 space-y-2 transition-all duration-300 ${
          open ? "lg:ml-72" : "lg:ml-20"
        }`}
      >
        {/* Navbar section */}
        <Navbar
          title={
            activeMenu
              ? Menus.find((menu) => menu.key === activeMenu)?.title ||
                "Dashboard"
              : "Dashboard"
          }
        />

        {/* Main content with bottom padding for mobile navigation */}
        <div className="w-full px-4 lg:px-10 pb-20 lg:pb-0">
          <Outlet />
        </div>
      </div>

      {/* Bottom Navigation - only visible on screens smaller than lg */}
      <BottomNavigation
        activeMenu={activeMenu}
        menus={Menus}
        onMenuClick={handleMenuClick}
        getMenuIcon={getMenuIcon}
      />
    </div>
  );
};

export default Dashboard;
