import React from "react";
import { FaBell } from "react-icons/fa";

/**
 * Reusable Navbar UI Component
 * Handles the presentation of the top navigation bar
 */
const Navbar = ({ open, title = "Dashboard" }) => {
  return (
    <div className="w-full h-[8ch] px-12 bg-zinc-50 shadow-md flex items-center justify-between">
      <h1
        className={`origin-left font-bold text-2xl duration-200 ease-in-out ${!open && "scale-0"}`}
      >
        {title}
      </h1>

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
  );
};

export default Navbar;
