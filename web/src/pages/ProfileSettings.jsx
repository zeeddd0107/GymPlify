import { useState, useEffect } from "react";
import { useAuth } from "@/context";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCamera,
  FaSave,
  FaEdit,
  FaTimes,
  FaKey,
  FaBell,
  FaFileContract,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaExclamationTriangle,
  FaSignOutAlt,
} from "react-icons/fa";

const ProfileSettings = () => {
  const { user, updateProfile, updatePassword, isAdmin, signOut, getUserData } =
    useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(true);

  // Profile data states
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phone: "",
    username: "",
    role: "",
    memberSince: "",
    lastLogin: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification settings states
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    securityAlerts: true,
  });

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          setUserDataLoading(true);
          const firestoreUserData = await getUserData(user.uid);
          setUserData(firestoreUserData);

          // Format dates
          const formatDate = (timestamp) => {
            if (!timestamp) return "Not available";
            const date = timestamp.toDate
              ? timestamp.toDate()
              : new Date(timestamp);
            return date.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            });
          };

          const formatDateTime = (timestamp) => {
            if (!timestamp) return "Not available";
            const date = timestamp.toDate
              ? timestamp.toDate()
              : new Date(timestamp);
            return date.toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            });
          };

          setProfileData({
            displayName:
              firestoreUserData.displayName || user.displayName || "",
            email: firestoreUserData.email || user.email || "",
            phone: firestoreUserData.phoneNumber || user.phoneNumber || "",
            username:
              firestoreUserData.displayName
                ?.toLowerCase()
                .replace(/\s+/g, "") ||
              user.displayName?.toLowerCase().replace(/\s+/g, "") ||
              "",
            role:
              firestoreUserData.role === "admin"
                ? "Administrator"
                : firestoreUserData.role === "staff"
                  ? "Staff"
                  : "User",
            memberSince: formatDate(firestoreUserData.createdAt),
            lastLogin: formatDateTime(firestoreUserData.lastLogin),
          });
          setImagePreview(firestoreUserData.photoURL || user.photoURL || null);
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Fallback to Firebase Auth data if Firestore fails
          setProfileData({
            displayName: user.displayName || "",
            email: user.email || "",
            phone: user.phoneNumber || "",
            username: user.displayName?.toLowerCase().replace(/\s+/g, "") || "",
            role: isAdmin ? "Administrator" : "User",
            memberSince: "Not available",
            lastLogin: "Not available",
          });
          setImagePreview(user.photoURL || null);
        } finally {
          setUserDataLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user, isAdmin, getUserData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Update profile information
      await updateProfile({
        displayName: profileData.displayName,
        phoneNumber: profileData.phone,
      });

      // TODO: Handle profile image upload to Firebase Storage
      if (profileImage) {
        // Upload image logic would go here
        console.log("Profile image upload:", profileImage);
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (userData) {
      setProfileData({
        displayName: userData.displayName || user?.displayName || "",
        email: userData.email || user?.email || "",
        phone: userData.phoneNumber || user?.phoneNumber || "",
        username:
          userData.displayName?.toLowerCase().replace(/\s+/g, "") ||
          user?.displayName?.toLowerCase().replace(/\s+/g, "") ||
          "",
        role:
          userData.role === "admin"
            ? "Administrator"
            : userData.role === "staff"
              ? "Staff"
              : "User",
        memberSince: userData.createdAt
          ? new Date(
              userData.createdAt.toDate
                ? userData.createdAt.toDate()
                : userData.createdAt,
            ).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "Not available",
        lastLogin: userData.lastLogin
          ? new Date(
              userData.lastLogin.toDate
                ? userData.lastLogin.toDate()
                : userData.lastLogin,
            ).toLocaleString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          : "Not available",
      });
    }
    setImagePreview(userData?.photoURL || user?.photoURL || null);
    setProfileImage(null);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      setSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (section) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Simulate API call for saving settings
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(`${section} settings saved successfully!`);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      setError(error.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const tabs = [
    { id: "profile", title: "Profile Information", icon: FaUser },
    { id: "password", title: "Security", icon: FaKey },
    { id: "notifications", title: "Notifications", icon: FaBell },
    { id: "terms", title: "Terms & Conditions", icon: FaFileContract },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl px-0">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Profile & Settings
          </h1>
          <p className="text-gray-600">
            Manage your profile information and account settings
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
            <FaCheck className="mr-2" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tab Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 group ${
                        activeTab === tab.id
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-primary hover:text-white hover:rounded-lg"
                      }`}
                    >
                      <IconComponent className="mr-3" />
                      {tab.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md px-8 py-6">
              {/* Profile Information Tab */}
              {activeTab === "profile" && (
                <div>
                  {userDataLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-3 text-gray-600">
                        Loading profile data...
                      </span>
                    </div>
                  )}
                  {!userDataLoading && (
                    <>
                      {/* User Header Section */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            {/* Profile Avatar */}
                            <div className="relative">
                              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                {imagePreview ? (
                                  <img
                                    src={imagePreview}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <FaUser className="text-3xl text-gray-400" />
                                )}
                              </div>
                              <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md">
                                <FaCamera className="text-sm" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {/* User Info */}
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                {profileData.displayName}
                              </h2>
                              <p className="text-gray-600 text-sm">
                                {profileData.email}
                              </p>
                            </div>
                          </div>

                          {/* Edit Button */}
                          <button
                            onClick={() => setIsEditing(true)}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
                          >
                            Edit Profile
                          </button>
                        </div>
                      </div>

                      {/* Profile Information Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                name="displayName"
                                value={profileData.displayName}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                                placeholder="Your Full Name"
                              />
                            ) : (
                              <p className="text-gray-600">
                                {profileData.displayName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Username
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                name="username"
                                value={profileData.username}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                                placeholder="Your Username"
                              />
                            ) : (
                              <p className="text-gray-600">
                                {profileData.username}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Role
                            </label>
                            <p className="text-gray-600">{profileData.role}</p>
                          </div>

                          <div>
                            <button
                              onClick={handleSignOut}
                              className="px-6 py-2 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors font-semibold"
                            >
                              <FaSignOutAlt className="inline mr-2" />
                              Logout
                            </button>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <p className="text-gray-600">{profileData.email}</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Member Since
                            </label>
                            <p className="text-gray-600">
                              {profileData.memberSince}
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Login
                            </label>
                            <p className="text-gray-600">
                              {profileData.lastLogin}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons for Editing */}
                      {isEditing && (
                        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray/50">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaTimes className="inline mr-2" />
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-xl text-white bg-primary hover:bg-secondary text-sm disabled:opacity-50"
                          >
                            <FaSave className="inline mr-2" />
                            {loading ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Change Password Tab */}
              {activeTab === "password" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Change Password
                    </h2>
                  </div>

                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent text-gray-900 pr-10"
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("current")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent text-gray-900 pr-10"
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("new")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-transparent text-gray-900 pr-10"
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("confirm")}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray/50">
                      <button
                        type="button"
                        onClick={() =>
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          })
                        }
                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-indigo-600 bg-white hover:bg-slate-50 hover:border-primary text-sm"
                      >
                        <FaTimes className="inline mr-2" />
                        Clear
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-5 py-2.5 rounded-xl text-white bg-primary hover:bg-secondary text-sm disabled:opacity-50"
                      >
                        <FaSave className="inline mr-2" />
                        {loading ? "Changing..." : "Change Password"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === "notifications" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Notification Settings
                    </h2>
                    <button
                      onClick={() => handleSaveSettings("Notification")}
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl text-white bg-primary hover:bg-secondary text-sm disabled:opacity-50"
                    >
                      <FaSave className="inline mr-2" />
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border border-gray/30 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Email Notifications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive notifications via email
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="emailNotifications"
                          checked={notificationSettings.emailNotifications}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray/30 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Push Notifications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive push notifications on your device
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="pushNotifications"
                          checked={notificationSettings.pushNotifications}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray/30 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Marketing Emails
                        </h3>
                        <p className="text-sm text-gray-600">
                          Receive promotional emails and updates
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="marketingEmails"
                          checked={notificationSettings.marketingEmails}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-gray/30 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          Security Alerts
                        </h3>
                        <p className="text-sm text-gray-600">
                          Get notified about security-related activities
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="securityAlerts"
                          checked={notificationSettings.securityAlerts}
                          onChange={handleNotificationChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms & Conditions Tab */}
              {activeTab === "terms" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Terms & Conditions
                    </h2>
                  </div>

                  <div className="prose max-w-none">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">
                        GymPlify Terms of Service
                      </h3>

                      <div className="space-y-4 text-sm text-gray-700">
                        <div>
                          <h4 className="font-medium mb-2">
                            1. Acceptance of Terms
                          </h4>
                          <p>
                            By accessing and using GymPlify, you accept and
                            agree to be bound by the terms and provision of this
                            agreement.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">2. Use License</h4>
                          <p>
                            Permission is granted to temporarily download one
                            copy of GymPlify per device for personal,
                            non-commercial transitory viewing only.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">3. Disclaimer</h4>
                          <p>
                            The materials on GymPlify are provided on an 'as is'
                            basis. GymPlify makes no warranties, expressed or
                            implied, and hereby disclaims and negates all other
                            warranties.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">4. Limitations</h4>
                          <p>
                            In no event shall GymPlify or its suppliers be
                            liable for any damages (including, without
                            limitation, damages for loss of data or profit, or
                            due to business interruption) arising out of the use
                            or inability to use GymPlify.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">
                            5. Privacy Policy
                          </h4>
                          <p>
                            Your privacy is important to us. Please review our
                            Privacy Policy, which also governs your use of the
                            service.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">
                            6. Contact Information
                          </h4>
                          <p>
                            If you have any questions about these Terms &
                            Conditions, please contact us at
                            support@gymplify.com
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Last Updated:</strong> December 15, 2023
                      </p>
                      <p className="text-sm text-blue-800 mt-1">
                        By using GymPlify, you acknowledge that you have read
                        and understood these terms.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
