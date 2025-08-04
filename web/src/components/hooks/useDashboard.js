import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context";

/**
 * Custom hook for Dashboard component logic
 * Handles sidebar state, menu navigation, and authentication
 */
export const useDashboard = () => {
  const { isAdmin, signOut } = useAuth();
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Menu configuration with navigation items
  const Menus = useMemo(
    () => [
      {
        title: "Dashboard",
        icon: "MdSpaceDashboard",
        key: "dashboard",
        path: "/",
      },
      {
        title: "Subscriptions",
        icon: "MdOutlineSubscriptions",
        gap: true,
        key: "subscriptions",
        path: "/subscriptions",
      },
      {
        title: "Sessions",
        icon: "GiWeightLiftingUp",
        key: "sessions",
        path: "/sessions",
      },
      {
        title: "Inventory",
        icon: "MdOutlineInventory",
        key: "inventory",
        path: "/inventory",
      },
      {
        title: "Requests",
        icon: "MdOutlinePendingActions",
        key: "requests",
        path: "/requests",
      },
      {
        title: "Guide",
        icon: "MdOutlinePlayCircle",
        key: "guide",
        path: "/guide",
      },
      {
        title: "QR",
        icon: "FaSearch",
        key: "qr",
        path: "/qr",
      },
      {
        title: "Staff",
        icon: "FaUsers",
        key: "staff",
        path: "/staff",
      },
    ],
    [],
  );

  // Get the current active menu based on the current path
  const getCurrentActiveMenu = useCallback(() => {
    const currentPath = location.pathname;
    const menu = Menus.find((m) => m.path === currentPath);
    return menu ? menu.key : "dashboard";
  }, [location.pathname, Menus]);

  const [activeMenu, setActiveMenu] = useState(getCurrentActiveMenu());

  // Update active menu when location changes
  useEffect(() => {
    setActiveMenu(getCurrentActiveMenu());
  }, [location.pathname, getCurrentActiveMenu]);

  // Handle menu item click
  const handleMenuClick = (menuKey, menuPath) => {
    setActiveMenu(menuKey);
    navigate(menuPath);
  };

  // Handle sidebar toggle
  const toggleSidebar = () => {
    setOpen(!open);
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return {
    // State
    open,
    activeMenu,
    isAdmin,

    // Data
    Menus,

    // Actions
    handleMenuClick,
    toggleSidebar,
    handleSignOut,
  };
};
