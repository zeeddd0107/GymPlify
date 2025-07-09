import { useState } from "react";
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

  const Menus = [
    { title: "Dashboard", icon: <MdSpaceDashboard />, key: "dashboard" },
    {
      title: "Subscriptions",
      icon: <MdOutlineSubscriptions />,
      gap: true,
      key: "subscriptions",
    },
    { title: "Sessions", icon: <GiWeightLiftingUp />, key: "sessions" },
    { title: "Inventory", icon: <MdOutlineInventory />, key: "inventory" },
    {
      title: "Subscription Requests",
      icon: <MdOutlinePendingActions />,
      key: "requests",
    },
    { title: "Equipment Guide", icon: <MdOutlinePlayCircle />, key: "guide" },
    { title: "Staff", icon: <FaUsers />, key: "staff" },
  ];

  const [activeMenu, setActiveMenu] = useState("dashboard");

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
          <ul className="pt-5 space-y-0.5">
            {Menus.map((Menu, index) => (
              <li
                key={index}
                className={`flex flex-col rounded-md py-3 px-4 cursor-pointer transition-all ease-in-out duration-300
                          ${Menu.gap ? "mt-9" : "mt-2"}
                          ${activeMenu === Menu.key ? "bg-primary text-white" : "text-primary-50 hover:text-white hover:bg-primary"}
                `}
                onClick={() => setActiveMenu(Menu.key)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{Menu.icon}</span>
                  <span
                    className={`${!open && "hidden"} origin-left ease-in-out duration-300`}
                  >
                    {Menu.title}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        {/* Logout button always at the bottom */}
        <div className="">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 py-3 px-4 rounded-md font-semibold bg-zinc-50 text-red-600 hover:bg-red-700 hover:text-white transition-all duration-300 justify-start"
          >
            <span className="text-2xl font-bold">
              <MdOutlineLogout />
            </span>
            <span
              className={`${!open && "hidden"} origin-left ease-in-out duration-300`}
            >
              Logout
            </span>
          </button>
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
          <h1 className="text-xl text-zinc-800 font-medium">
            This is the Dashboard page.
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
