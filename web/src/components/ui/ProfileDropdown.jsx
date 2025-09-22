import { useNavigate } from "react-router-dom";

const ProfileDropdown = ({
  user,
  isAdmin,
  profileSrc,
  imageError,
  getInitials,
  getAvatarColor,
  onImageError,
}) => {
  const navigate = useNavigate();

  const handleImageError = () => {
    console.log("Profile image failed to load:", profileSrc);
    if (onImageError) {
      onImageError();
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <button onClick={handleProfileClick} className="focus:outline-none">
      {profileSrc && !imageError ? (
        <img
          src={profileSrc}
          alt="profile img"
          className={`w-11 h-11 rounded-full object-cover object-center cursor-pointer shadow-md transition-transform hover:scale-105 ${
            isAdmin ? "ring-2 ring-purple-500 ring-offset-2" : ""
          }`}
          onError={handleImageError}
        />
      ) : (
        <div
          className={`w-11 h-11 rounded-full ${getAvatarColor(user)} flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-105 ${
            isAdmin ? "ring-2 ring-purple-500 ring-offset-2" : ""
          }`}
        >
          <span className="text-white font-semibold text-lg">
            {getInitials(user)}
          </span>
        </div>
      )}
    </button>
  );
};

export default ProfileDropdown;
