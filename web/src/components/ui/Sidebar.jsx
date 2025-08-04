import React from "react";
import { MdOutlineLogout } from "react-icons/md";
import { FaDumbbell } from "react-icons/fa6";
import {
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarLeftExpand,
} from "react-icons/tb";

/**
 * Reusable Sidebar UI Component
 * Handles the presentation of the sidebar navigation
 */
const Sidebar = ({
  open,
  activeMenu,
  menus,
  onMenuClick,
  onToggleSidebar,
  onSignOut,
  getMenuIcon,
}) => {
  return (
    <div
      className={`${open ? "w-72 p-5" : "w-20 p-4"} bg-zinc shadow-lg h-screen pt-8 fixed top-0 left-0 z-30 duration-300 ease-in-out flex flex-col justify-between`}
    >
      <div>
        {/* Toggle button section */}
        <div
          className={`absolute cursor-pointer -right-4 top-9 w-8 h-8 p-0.5 bg-zinc-50 border-zinc-50 border-2 rounded-full text-xl flex items-center justify-center
            ${!open && "rotate-180"} transition-all ease-in-out duration-300`}
          onClick={onToggleSidebar}
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
          {menus.map((menu, index) => (
            <li
              key={index}
              className={`relative flex items-center h-14 rounded-xl cursor-pointer group
              transition-all ease-in-out duration-300
              ${menu.gap ? "mt-9" : "mt-2"}
              ${activeMenu === menu.key ? "bg-primary text-white" : "text-primary-50 hover:text-white hover:bg-primary"}`}
              onClick={() => onMenuClick(menu.key, menu.path)}
              style={{
                paddingLeft: open ? 16 : 0,
                paddingRight: open ? 16 : 0,
              }}
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-12 text-2xl">
                {getMenuIcon(menu.icon)}
              </div>

              <div
                className={`flex-1 transition-all duration-300 text-lg ${!open ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-2.5"}`}
                style={{ minWidth: 0 }}
              >
                {menu.title}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout button */}
      <div className="pb-1">
        <ul>
          <li
            className={`group relative flex items-center h-14 rounded-xl cursor-pointer transition-all ease-in-out duration-300 mt-2 hover:bg-danger`}
            onClick={onSignOut}
            style={{
              paddingLeft: open ? 16 : 0,
              paddingRight: open ? 16 : 0,
            }}
          >
            <div className="flex items-center justify-center w-12 text-2xl text-danger group-hover:text-white">
              <MdOutlineLogout />
            </div>
            <div
              className={`flex-1 transition-all duration-300 text-lg text-danger group-hover:text-white ${
                !open
                  ? "opacity-0 w-0 overflow-hidden"
                  : "opacity-100 w-auto ml-1.5"
              }`}
              style={{ minWidth: 0 }}
            >
              Logout
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
