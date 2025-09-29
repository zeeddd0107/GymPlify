import { FaDumbbell } from "react-icons/fa6";

const Sidebar = ({
  open,
  activeMenu,
  menus,
  onMenuClick,
  onToggleSidebar,
  getMenuIcon,
}) => {
  return (
    <div
      className={`${
        open ? "w-64 sm:w-72 p-3 sm:p-5" : "w-16 sm:w-20 p-2 sm:p-4"
      } shadow-lg h-screen pt-6 sm:pt-8 fixed top-0 left-0 z-30 duration-300 ease-in-out flex flex-col justify-between hidden lg:flex`}
      style={{ backgroundColor: "#fbfbf9" }}
    >
      <div>
        {/* Logo and title section (click to toggle sidebar) */}
        <div
          className="flex justify-center items-center cursor-pointer"
          onClick={onToggleSidebar}
        >
          <span className="text-3xl sm:text-4xl font-bold text-primary">
            <FaDumbbell />
          </span>
          {open && (
            <h1 className="ml-2 sm:ml-3 origin-left font-bold text-xl sm:text-2xl duration-200 ease-in-out">
              GymPlify
            </h1>
          )}
        </div>

        {/* Sidebar Navbar Items section */}
        <ul className="pt-5 space-y-0">
          {menus.map((menu, index) => (
            <li
              key={index}
              className={`relative flex items-center h-12 sm:h-14 rounded-xl cursor-pointer group
              transition-all ease-in-out duration-300
              ${menu.gap ? "mt-6 sm:mt-9" : "mt-1 sm:mt-2"}
              ${activeMenu === menu.key ? "bg-primary text-white" : "text-primary-50 hover:text-white hover:bg-primary"}`}
              onClick={() => onMenuClick(menu.key, menu.path)}
              style={{
                paddingLeft: open ? (window.innerWidth < 640 ? 12 : 16) : 0,
                paddingRight: open ? (window.innerWidth < 640 ? 12 : 16) : 0,
              }}
            >
              {/* Tooltip for collapsed sidebar */}
              {!open && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {menu.title}
                </div>
              )}
              {/* Icon */}
              <div className="flex items-center justify-center w-10 sm:w-12 text-xl sm:text-2xl">
                {getMenuIcon(menu.icon)}
              </div>

              <div
                className={`flex-1 transition-all duration-300 text-base sm:text-lg ${!open ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto ml-2 sm:ml-2.5"}`}
                style={{ minWidth: 0 }}
              >
                {menu.title}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
