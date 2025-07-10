import { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "@/context";
import { FaBell, FaSearch, FaUsers } from "react-icons/fa";

import {
  MdSpaceDashboard,
  MdOutlineSubscriptions,
  MdOutlineInventory,
  MdOutlinePendingActions,
  MdOutlinePlayCircle,
  MdOutlineLogout,
} from "react-icons/md";
import { GiWeightLiftingUp } from "react-icons/gi";
import {
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarLeftExpand,
} from "react-icons/tb";
import { FaDumbbell } from "react-icons/fa6";

const Dashboard = () => {
  const { signOut } = useAuth();
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const Menus = [
    {
      title: "Dashboard",
      icon: <MdSpaceDashboard />,
      key: "dashboard",
      path: "/",
    },
    {
      title: "Subscriptions",
      icon: <MdOutlineSubscriptions />,
      gap: true,
      key: "subscriptions",
      path: "/subscriptions",
    },
    {
      title: "Sessions",
      icon: <GiWeightLiftingUp />,
      key: "sessions",
      path: "/sessions",
    },
    {
      title: "Inventory",
      icon: <MdOutlineInventory />,
      key: "inventory",
      path: "/inventory",
    },
    {
      title: "Subscription",
      icon: <MdOutlinePendingActions />,
      key: "requests",
      path: "/requests",
    },
    {
      title: "Guide",
      icon: <MdOutlinePlayCircle />,
      key: "guide",
      path: "/guide",
    },
    { title: "Staff", icon: <FaUsers />, key: "staff", path: "/staff" },
  ];

  // Get the current active menu based on the current path
  const getCurrentActiveMenu = () => {
    const currentPath = location.pathname;
    const menu = Menus.find((m) => m.path === currentPath);
    return menu ? menu.key : "dashboard";
  };

  const [activeMenu, setActiveMenu] = useState(getCurrentActiveMenu());

  // Update active menu when location changes
  useEffect(() => {
    setActiveMenu(getCurrentActiveMenu());
  }, [location.pathname]);

  const handleMenuClick = (menuKey, menuPath) => {
    setActiveMenu(menuKey);
    navigate(menuPath);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      // error handling
    }
  };

  return (
    <div className="w-full flex">
      {/* Sidebar section */}
      <div
        className={`${open ? "w-72 p-5" : "w-20 p-4"} bg-zinc shadow-lg h-screen pt-8 fixed top-0 left-0 z-30 duration-300 ease-in-out flex flex-col justify-between`}
      >
        <div>
          {/* Toggle button sections */}
          <div
            className={`absolute cursor-pointer -right-4 top-9 w-8 h-8 p-0.5 bg-zinc-50 border-zinc-50 border-2 rounded-full text-xl flex items-center justify-center
              ${!open && "rotate-180"} transition-all ease-in-out duration-300`}
            onClick={() => setOpen(!open)}
          >
            {open ? (
              <TbLayoutSidebarLeftExpand />
            ) : (
              <TbLayoutSidebarLeftCollapse />
            )}
          </div>

          {/* Logo and title section */}
          <div className="flex justify-center gap-x-3 items-center">
            <span className="text-4xl font-bold text-primary">
              <FaDumbbell />
            </span>
            <h1
              className={`origin-left font-bold text-2xl duration-200 ease-in-out ${!open && "scale-0"}`}
            >
              GymPlify
            </h1>
          </div>

          {/* Sidebar Navbar Items section */}
          <ul className="pt-5 space-y-0">
            {Menus.map((Menu, index) => (
              <li
                key={index}
                className={`relative flex items-center h-14 rounded-xl cursor-pointer group
                transition-all ease-in-out duration-300
                ${Menu.gap ? "mt-9" : "mt-0"}
                ${activeMenu === Menu.key ? "bg-primary text-white" : "text-primary-50 hover:text-white hover:bg-primary"}`}
                onClick={() => handleMenuClick(Menu.key, Menu.path)}
                style={{
                  paddingLeft: open ? 16 : 0,
                  paddingRight: open ? 16 : 0,
                }}
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-8 text-2xl">
                  {Menu.icon}
                </div>

                {/* Label with smoother transitions like YouTube */}
                <div
                  className={`flex-1 transition-all duration-300 text-lg ${!open ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-2.5"}`}
                  style={{ minWidth: 0 }}
                >
                  {Menu.title}
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* Logout button always at the bottom */}
        <div className="pb-1">
          <li
            className={`group relative flex items-center h-14 rounded-xl cursor-pointer transition-all ease-in-out duration-300 mt-2 hover:bg-danger`}
            onClick={handleSignOut}
            style={{
              paddingLeft: open ? 16 : 0,
              paddingRight: open ? 16 : 0,
            }}
          >
            <div className="flex items-center justify-center w-8 text-2xl text-danger group-hover:text-white">
              <MdOutlineLogout />
            </div>
            <div
              className={`flex-1 transition-all duration-300 text-lg text-danger group-hover:text-white ${!open ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-2.5"}`}
              style={{ minWidth: 0 }}
            >
              Logout
            </div>
          </li>
        </div>
      </div>

      {/* Dashboard Layout section */}
      <div
        className={`h-screen flex-1 bg-zinc-100 space-y-6 transition-all duration-300 ${open ? "ml-72" : "ml-20"}`}
      >
        {/* Navbar section */}
        <div className="w-full h-[8ch] px-12 bg-zinc-50 shadow-md flex items-center justify-between">
          <div className="w-96 border border-zinc-300 rounded-full h-11 flex items-center justify-center">
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 h-full rounded-full outline-none border-none bg-zinc-50 px-4"
            />

            <button className="px-4 h-full flex items-center justify-center text-base text-zinc-600 border-l border-zinc-300">
              <FaSearch />
            </button>
          </div>

          <div className="flex items-center gap-x-8">
            {/* Notification */}
            <button className="relative">
              <div className="w-5 h-5 bg-zinc-50 flex items-center justify-center absolute -top-1.5 -right-2.5 rounded-full p-0.5">
                <span className="bg-red-600 text-white rounded-full w-full h-full flex items-center justify-center text-xs">
                  3
                </span>
              </div>
              <FaBell className="text-xl" />
            </button>

            {/* Profile img */}
            <img
              src="https://cdn.pixabay.com/photo/2016/11/21/11/17/model-1844729_640.jpg"
              alt="profile img"
              className="w-11 h-11 rounded-full object-cover object-center cursor-pointer"
            />
          </div>
        </div>

        {/* Dashboard contents */}
        <div className="w-full px-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
