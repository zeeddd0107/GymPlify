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
  FaFileContract,
  FaCheck,
  FaExclamationTriangle,
  FaSignOutAlt,
} from "react-icons/fa";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import MarkdownRenderer from "../components/ui/MarkdownRenderer";

const ProfileSettings = () => {
  const { user, updateProfile, updatePassword, isAdmin, signOut, getUserData } =
    useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(true);

  // Profile data states
  const [profileData, setProfileData] = useState({
    displayName: "",
    email: "",
    phone: "",
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
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecialChar: false,
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
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Show save button when image is changed
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let photoURL = imagePreview;

      // Upload profile image to Firebase Storage if a new image was selected
      if (profileImage) {
        const { ref, uploadBytes, getDownloadURL, deleteObject, listAll } = await import("firebase/storage");
        const { storage } = await import("@/config/firebase");
        
        // Create user-specific folder path
        const userFolder = `profile-pictures/${user.uid}`;
        
        // Delete all old profile pictures in the user's folder
        try {
          const folderRef = ref(storage, userFolder);
          const filesList = await listAll(folderRef);
          
          // Delete all existing files in the user's folder
          const deletePromises = filesList.items.map((item) => deleteObject(item));
          await Promise.all(deletePromises);
          
          if (filesList.items.length > 0) {
            console.log(`Deleted ${filesList.items.length} old profile picture(s)`);
          }
        } catch (deleteError) {
          console.warn("Could not delete old profile pictures:", deleteError);
          // Continue even if delete fails
        }
        
        // Create a reference to the new file location in user's folder
        const fileExtension = profileImage.name.split('.').pop();
        const fileName = `profile_${Date.now()}.${fileExtension}`;
        const storageRef = ref(storage, `${userFolder}/${fileName}`);
        
        // Upload the file
        await uploadBytes(storageRef, profileImage);
        
        // Get the download URL
        photoURL = await getDownloadURL(storageRef);
        console.log("New profile picture uploaded to user folder:", photoURL);
      }

      // Update Firebase Auth profile (this also updates Firestore)
      await updateProfile({
        displayName: profileData.displayName,
        phoneNumber: profileData.phone,
        photoURL: photoURL,
      });

      // Refetch user data to ensure we have the latest information
      const updatedUserData = await getUserData(user.uid);
      setUserData(updatedUserData);
      
      // Force image refresh by adding cache-busting timestamp
      const cacheBustedURL = updatedUserData.photoURL 
        ? `${updatedUserData.photoURL}${updatedUserData.photoURL.includes('?') ? '&' : '?'}t=${Date.now()}`
        : user.photoURL || null;
      setImagePreview(cacheBustedURL);

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setProfileImage(null); // Clear the selected image

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError(""); // Clear any errors
    if (userData) {
      setProfileData({
        displayName: userData.displayName || user?.displayName || "",
        email: userData.email || user?.email || "",
        phone: userData.phoneNumber || user?.phoneNumber || "",
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
    // Reset image to original
    setImagePreview(userData?.photoURL || user?.photoURL || null);
    setProfileImage(null);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update validation when typing new password
    if (name === 'newPassword') {
      const validation = validatePassword(value, profileData.displayName);
      setPasswordValidation({
        minLength: validation.minLength,
        hasUppercase: validation.hasUppercase,
        hasNumber: validation.hasNumber,
        hasSpecialChar: validation.hasSpecialChar,
      });
    }
  };


  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Password validation function
  const validatePassword = (password, fullName = "") => {
    const validation = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      noPersonalData: true,
      notWeakPassword: true,
    };

    // Check for personal data (name)
    if (fullName && password.toLowerCase().includes(fullName.toLowerCase())) {
      validation.noPersonalData = false;
    }

    // Check for weak passwords
    const weakPasswords = [
      'password', 'password123', '12345678', 'qwerty', 'abc123',
      'letmein', 'welcome', 'monkey', '1234567890', 'password1'
    ];
    if (weakPasswords.includes(password.toLowerCase())) {
      validation.notWeakPassword = false;
    }

    return validation;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Step 1: Validate all fields are filled
    if (!passwordData.currentPassword) {
      setError("Please enter your current password");
      setLoading(false);
      return;
    }

    if (!passwordData.newPassword) {
      setError("Please enter a new password");
      setLoading(false);
      return;
    }

    if (!passwordData.confirmPassword) {
      setError("Please confirm your new password");
      setLoading(false);
      return;
    }

    // Step 2: FIRST verify the current password is correct
    try {
      const { EmailAuthProvider, reauthenticateWithCredential } = await import("firebase/auth");
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Current password is correct, continue with validation
    } catch (error) {
      console.error("Current password verification error:", error);
      
      // Handle authentication errors
      let errorMessage = "The current password you entered is incorrect. Please check and try again.";
      
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials') {
        errorMessage = "The current password you entered doesn't match our records. Please try again.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many failed attempts. Please wait a few minutes and try again.";
      }
      
      setError(errorMessage);
      setLoading(false);
      return;
    }

    // Step 3: Check if new password and confirm password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match. Please make sure they are the same.");
      setLoading(false);
      return;
    }

    // Step 4: Validate new password requirements
    const validation = validatePassword(passwordData.newPassword, profileData.displayName);
    const requiredChecks = [
      validation.minLength,
      validation.hasUppercase,
      validation.hasNumber,
      validation.hasSpecialChar,
    ];
    const allRequirementsMet = requiredChecks.every(Boolean);

    if (!allRequirementsMet) {
      setError("Your new password doesn't meet all the requirements. Please check the password requirements below.");
      setLoading(false);
      return;
    }

    if (!validation.noPersonalData) {
      setError("Your password should not contain your personal information. Please choose a different password.");
      setLoading(false);
      return;
    }

    if (!validation.notWeakPassword) {
      setError("This password is too common and easy to guess. Please choose a stronger password.");
      setLoading(false);
      return;
    }

    // Step 5: All validations passed, now change the password
    try {
      await updatePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      
      // Success!
      setSuccess("Great! Your password has been changed successfully. Please use your new password when logging in next time.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordValidation({
        minLength: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccess("");
      }, 5000);
    } catch (error) {
      console.error("Password change error:", error);
      
      // Handle any remaining errors
      let errorMessage = "We couldn't change your password. Please try again.";
      
      if (error.code === 'auth/weak-password') {
        errorMessage = "The new password is too weak. Please choose a stronger password.";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "For security reasons, please log out and log in again before changing your password.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
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
    setLogoutLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      setError("Failed to logout. Please try again.");
    } finally {
      setLogoutLoading(false);
    }
  };

  const tabs = [
    { id: "profile", title: "Profile Information", icon: FaUser },
    { id: "password", title: "Security", icon: FaKey },
    { id: "terms", title: "Terms & Conditions", icon: FaFileContract },
    { id: "logout", title: "Logout", icon: FaSignOutAlt },
  ];

  return (
    <div className="min-h-screen py-8">
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
            {activeTab !== "logout" && (
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
                                    key={imagePreview}
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
                              <p className="text-gray-600 py-2">
                                {profileData.displayName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Role
                            </label>
                            <p className="text-gray-600 py-2">{profileData.role}</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Last Login
                            </label>
                            <p className="text-gray-600 py-2">
                              {profileData.lastLogin}
                            </p>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <p className="text-gray-600 py-2">{profileData.email}</p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Member Since
                            </label>
                            <p className="text-gray-600 py-2">
                              {profileData.memberSince}
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
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon
                          icon={faLock}
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                          type={showPasswords.current ? "text" : "password"}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full py-3 pl-12 pr-12 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 focus:border-primary placeholder:font-normal placeholder:text-gray-500 bg-white autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_white]"
                          placeholder="Enter current password"
                          required
                        />
                        {passwordData.currentPassword && passwordData.currentPassword.length > 0 && (
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("current")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            <FontAwesomeIcon
                              icon={showPasswords.current ? faEyeSlash : faEye}
                              className="text-sm"
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon
                          icon={faLock}
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                          type={showPasswords.new ? "text" : "password"}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full py-3 pl-12 pr-12 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 focus:border-primary placeholder:font-normal placeholder:text-gray-500 bg-white autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_white]"
                          placeholder="Enter new password"
                          required
                        />
                        {passwordData.newPassword && passwordData.newPassword.length > 0 && (
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("new")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            <FontAwesomeIcon
                              icon={showPasswords.new ? faEyeSlash : faEye}
                              className="text-sm"
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <FontAwesomeIcon
                          icon={faLock}
                          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                          type={showPasswords.confirm ? "text" : "password"}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full py-3 pl-12 pr-12 border border-gray-300 rounded-2xl text-base transition-colors focus:outline-blue-500 focus:border-primary placeholder:font-normal placeholder:text-gray-500 bg-white autofill:bg-white autofill:shadow-[inset_0_0_0px_1000px_white]"
                          placeholder="Confirm new password"
                          required
                        />
                        {passwordData.confirmPassword && passwordData.confirmPassword.length > 0 && (
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("confirm")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                          >
                            <FontAwesomeIcon
                              icon={showPasswords.confirm ? faEyeSlash : faEye}
                              className="text-sm"
                            />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Password Requirements - Only show when typing new password */}
                    {passwordData.newPassword.length > 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</h4>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                          <div className="flex items-center gap-2">
                            <span className={passwordValidation.minLength ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                              {passwordValidation.minLength ? '✓' : '✗'}
                            </span>
                            <span className={passwordValidation.minLength ? 'text-green-600 text-sm' : 'text-gray-600 text-sm'}>
                              At least 8 characters
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={passwordValidation.hasUppercase ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                              {passwordValidation.hasUppercase ? '✓' : '✗'}
                            </span>
                            <span className={passwordValidation.hasUppercase ? 'text-green-600 text-sm' : 'text-gray-600 text-sm'}>
                              One uppercase letter
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={passwordValidation.hasNumber ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                              {passwordValidation.hasNumber ? '✓' : '✗'}
                            </span>
                            <span className={passwordValidation.hasNumber ? 'text-green-600 text-sm' : 'text-gray-600 text-sm'}>
                              One number
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={passwordValidation.hasSpecialChar ? 'text-green-600 text-sm' : 'text-red-600 text-sm'}>
                              {passwordValidation.hasSpecialChar ? '✓' : '✗'}
                            </span>
                            <span className={passwordValidation.hasSpecialChar ? 'text-green-600 text-sm' : 'text-gray-600 text-sm'}>
                              One special character
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {(passwordData.currentPassword.length > 0 || 
                      passwordData.newPassword.length > 0 || 
                      passwordData.confirmPassword.length > 0) && (
                      <div className="flex justify-end space-x-4 pt-6 border-t border-gray/50">
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordData({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            });
                            setPasswordValidation({
                              minLength: false,
                              hasUppercase: false,
                              hasNumber: false,
                              hasSpecialChar: false,
                            });
                            setError("");
                          }}
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
                    )}
                  </form>
                </div>
              )}

              {/* Terms & Conditions Tab */}
              {activeTab === "terms" && (
                <div>
                  <div className="bg-white rounded-lg max-h-[calc(100vh-200px)] overflow-y-auto p-6">
                    <MarkdownRenderer filePath="/terms-and-conditions.md" />
                  </div>
                </div>
              )}
              </div>
            )}

            {/* Logout Tab */}
            {activeTab === "logout" && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ marginLeft: '0', marginTop: '0' }}>
                <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 text-center animate-fadeIn">
                  <div className="mb-6">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaSignOutAlt className="text-4xl text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Logout
                    </h2>
                    <p className="text-gray-600">
                      Are you sure you want to logout from your account?
                    </p>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setActiveTab("profile")}
                      disabled={logoutLoading}
                      className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSignOut}
                      disabled={logoutLoading}
                      className="w-[120px] py-2.5 bg-danger text-white rounded-lg hover:bg-danger/90 transition-colors font-semibold disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {logoutLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          <FaSignOutAlt className="mr-2" />
                          Logout
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
