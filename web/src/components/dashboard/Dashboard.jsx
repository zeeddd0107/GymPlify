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
      {/* Sidebar section */}
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
        className={`h-screen flex-1 bg-zinc-100 space-y-2 transition-all duration-300 ${open ? "ml-72" : "ml-20"}`}
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

        {/* Subscriptions Table */}
        <div className="w-full px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
