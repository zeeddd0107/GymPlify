import { FaSearch, FaUsers } from "react-icons/fa";
import {
  MdSpaceDashboard,
  MdOutlineSubscriptions,
  MdOutlineInventory,
  MdOutlinePendingActions,
  MdOutlinePlayCircle,
} from "react-icons/md";
import { GiWeightLiftingUp } from "react-icons/gi";

const BottomNavigation = ({ activeMenu, menus, onMenuClick, getMenuIcon }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden">
      <div className="flex justify-around items-center py-2 px-4">
        {menus.map((menu) => {
          const isActive = activeMenu === menu.key;

          return (
            <button
              key={menu.key}
              onClick={() => onMenuClick(menu.key, menu.path)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
            >
              <div className="text-xl mb-1">{getMenuIcon(menu.icon)}</div>
              <span
                className={`text-xs font-medium truncate max-w-full ${
                  isActive ? "text-primary" : "text-gray-600"
                }`}
              >
                {menu.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
