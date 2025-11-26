import { useAuth } from "@/context";
import { useState, useEffect } from "react";
import ProfileDropdown from "./ProfileDropdown";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "../hooks";

const Navbar = ({ title = "" }) => {
  const { user } = useAuth();
  const [profileSrc, setProfileSrc] = useState(null);
  const [imageError, setImageError] = useState(false);
  const { notifications, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();

  // Enhanced profile picture detection for all users
  const getProfilePicture = (user) => {
    if (!user) return null;

    // Check multiple possible photo URL properties that Firebase might provide
    const photoURL =
      user.photoURL || user.photoUrl || user.picture || user.avatar;

    // Validate that we have a proper URL (http/https or Firebase Storage URL)
    if (
      photoURL &&
      (photoURL.startsWith("http") || photoURL.startsWith("gs://"))
    ) {
      console.log("Profile picture detected:", photoURL);
      return photoURL;
    }

    console.log("No valid profile picture found in user object");
    return null;
  };

  // Update profile source when user changes
  useEffect(() => {
    console.log("User object updated in Navbar:", user);
    const photoURL = getProfilePicture(user);

    // Add cache-busting parameter to force browser to reload the image
    if (photoURL) {
      const cacheBustedURL = `${photoURL}${photoURL.includes("?") ? "&" : "?"}t=${Date.now()}`;
      setProfileSrc(cacheBustedURL);
    } else {
      setProfileSrc(null);
    }

    setImageError(false);
  }, [user]);

  // Generate initials from email or display name
  const getInitials = (user) => {
    if (user?.displayName) {
      return user.displayName
        .split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  // Get background color based on user data
  const getAvatarColor = (user) => {
    if (!user) return "bg-gray-500";

    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-yellow-500",
      "bg-red-500",
      "bg-teal-500",
    ];

    // Use email hash to consistently assign colors
    const hash = user.email
      ? user.email.split("").reduce((a, b) => {
          a = (a << 5) - a + b.charCodeAt(0);
          return a & a;
        }, 0)
      : 0;

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="w-full h-[8ch] px-8 bg-zinc-50 shadow-md flex items-center justify-between sticky top-0 z-20">
      <h1 className="font-bold text-2xl text-[#4361EE]">
        {title || "Dashboard"}
      </h1>

      <div className="flex items-center gap-x-8">
        {/* Notification Dropdown */}
        <NotificationDropdown
          notifications={notifications}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDelete={deleteNotification}
        />

        {/* Profile Section */}
        <ProfileDropdown
          user={user}
          profileSrc={profileSrc}
          imageError={imageError}
          getInitials={getInitials}
          getAvatarColor={getAvatarColor}
          onImageError={() => setImageError(true)}
        />
      </div>
    </div>
  );
};

export default Navbar;
