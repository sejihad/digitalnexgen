import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { setUser } from "../redux/authSlice.js";

const Settings = () => {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);

  const [user, setUserState] = useState({
    username: authUser?.username || "",
    email: authUser?.email || "",
    country: authUser?.country || "",
    phone: authUser?.phone || "",
    isTwoFactorEnabled: authUser?.isTwoFactorEnabled || false,
  });

  const [newImage, setNewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const userId = authUser?._id || authUser?.id;
  const token = authUser?.accessToken || "";

  // LocalStorage থেকে directly user data নেওয়া
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};

    setUserState((prev) => ({
      ...prev,
      username: storedUser.username || prev.username,
      email: storedUser.email || prev.email,
      country: storedUser.country || prev.country,
      phone: storedUser.phone || prev.phone,
      isTwoFactorEnabled:
        storedUser.isTwoFactorEnabled || prev.isTwoFactorEnabled,
    }));
  }, []);

  // Toggle 2FA function - সরাসরি API call
  const handleToggleTwoFactor = async () => {
    if (twoFactorLoading || !userId) return;

    setTwoFactorLoading(true);
    try {
      const response = await axios.put(
        `${apiBaseUrl}/api/auth/twofactor/toggle`,
        {},
        {
          withCredentials: true,
        },
      );

      if (response.data.success) {
        // Update local state
        const updatedTwoFactorStatus = response.data.isTwoFactorEnabled;
        setUserState((prev) => ({
          ...prev,
          isTwoFactorEnabled: updatedTwoFactorStatus,
        }));

        // Update Redux state
        const updatedUser = {
          ...authUser,
          isTwoFactorEnabled: updatedTwoFactorStatus,
        };
        dispatch(setUser(updatedUser));

        // Update localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success(response.data.message || "2FA updated successfully");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update 2FA";
      toast.error(errorMessage);
      console.error("2FA toggle error:", error);
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      toast.error("User not found. Please login again.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();

      // Text fields
      formData.append("username", user.username);
      formData.append("email", user.email);
      formData.append("country", user.country);
      formData.append("phone", user.phone);

      // File field
      if (newImage) {
        formData.append("img", newImage);
      }

      // Axios request
      const response = await axios.put(
        `${apiBaseUrl}/api/users/${userId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      // Update local state with response data
      const updatedUser = {
        ...authUser,
        ...response.data,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      };

      dispatch(setUser(updatedUser));
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Profile updated successfully!");

      // Reset new image
      setNewImage(null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update profile";
      toast.error(errorMessage);
      console.error("Profile update error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-openSans flex justify-center items-center p-6 min-h-screen">
      <div className="max-w-2xl w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-lg shadow-lg p-8 border border-black/5 dark:border-white/10">
        <h1 className="text-3xl font-bold text-primaryRgb mb-6">Settings</h1>

        {/* Two Factor Authentication Section - Simplified */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Two Factor Authentication (2FA)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Add an extra layer of security to your account
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleTwoFactor}
              disabled={twoFactorLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(12,187,20)] ${
                user.isTwoFactorEnabled
                  ? "bg-[rgb(12,187,20)]"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span className="sr-only">
                {user.isTwoFactorEnabled ? "Disable" : "Enable"} 2FA
              </span>
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  user.isTwoFactorEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="mt-3 flex items-center">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                user.isTwoFactorEnabled
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
              }`}
            >
              {user.isTwoFactorEnabled ? "🛡️ Enabled" : "⚠️ Disabled"}
            </div>

            <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">
              {user.isTwoFactorEnabled
                ? "OTP will be required for each login"
                : "No OTP required for login"}
            </span>

            {twoFactorLoading && (
              <span className="ml-3 text-sm text-gray-500">
                <svg
                  className="animate-spin h-4 w-4 text-[rgb(12,187,20)] inline mr-1"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating...
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={user.username}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60 focus:border-transparent transition"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60 focus:border-transparent transition"
            />
          </div>

          {/* Country */}
          <div className="mb-4">
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={user.country}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60 focus:border-transparent transition"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60 focus:border-transparent transition"
            />
          </div>

          {/* Profile Image */}
          <div className="mb-6">
            <label
              htmlFor="img"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Profile Image
            </label>
            <input
              type="file"
              id="img"
              name="img"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60 focus:border-transparent transition file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[rgb(12,187,20)]/10 file:text-[rgb(12,187,20)] hover:file:bg-[rgb(12,187,20)]/20"
            />

            <div className="mt-4 flex items-center space-x-4">
              {authUser?.img && !newImage && (
                <div className="relative">
                  <img
                    src={authUser.img?.url || authUser.img}
                    alt="Current Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                  />
                  <span className="absolute -bottom-1 -right-1 text-xs bg-gray-800 text-white px-2 py-1 rounded-full">
                    Current
                  </span>
                </div>
              )}

              {newImage && (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(newImage)}
                    alt="New Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[rgb(12,187,20)]"
                  />
                  <span className="absolute -bottom-1 -right-1 text-xs bg-[rgb(12,187,20)] text-white px-2 py-1 rounded-full">
                    New
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-[rgb(12,187,20)] hover:bg-[rgb(10,167,18)] text-white py-3 px-4 rounded-md font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Updating Profile...
              </span>
            ) : (
              "Update Profile"
            )}
          </button>

          <div className="mt-6 space-y-3">
            <Link
              to="/update-password"
              className="block w-full text-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 rounded-md font-medium transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Change Password
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
