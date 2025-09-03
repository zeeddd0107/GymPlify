import { useAuth } from "@/context";
import { FaBell, FaUser, FaCrown } from "react-icons/fa";
import { useState, useEffect } from "react";

const Navbar = ({ title = "" }) => {
  const { user, isAdmin } = useAuth();
  const [profileSrc, setProfileSrc] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Enhanced profile picture detection for Google users
  const getProfilePicture = (user) => {
    if (!user) return null;

    // Check multiple possible photo URL properties that Firebase might provide
    const photoURL =
      user.photoURL || user.photoUrl || user.picture || user.avatar;

    // For Google users, ensure we have a valid photo URL
    if (photoURL && photoURL.startsWith("http")) {
      return photoURL;
    }

    return null;
  };

  // Update profile source when user changes
  useEffect(() => {
    const photoURL = getProfilePicture(user);
    setProfileSrc(photoURL);
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

  // Debug logging (remove in production)
  console.log("Navbar user data:", {
    uid: user?.uid,
    email: user?.email,
    displayName: user?.displayName,
    photoURL: user?.photoURL,
    photoUrl: user?.photoUrl,
    provider: user?.provider,
    profileSrc,
    imageError,
    isAdmin,
  });

  return (
    <div className="w-full h-[8ch] px-12 bg-zinc-50 shadow-md flex items-center justify-between">
      <h1 className="font-bold text-2xl text-[#4361EE]">
        {title || "Dashboard"}
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

        {/* Profile Section */}
        {profileSrc && !imageError ? (
          <img
            src={profileSrc}
            alt="profile img"
            className={`w-11 h-11 rounded-full object-cover object-center cursor-pointer shadow-md ${
              isAdmin ? "ring-2 ring-purple-500 ring-offset-2" : ""
            }`}
            onError={() => {
              console.log("Profile image failed to load:", profileSrc);
              setImageError(true);
            }}
          />
        ) : (
          <div
            className={`w-11 h-11 rounded-full ${getAvatarColor(user)} flex items-center justify-center cursor-pointer shadow-md ${
              isAdmin ? "ring-2 ring-purple-500 ring-offset-2" : ""
            }`}
          >
            <span className="text-white font-semibold text-lg">
              {getInitials(user)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
