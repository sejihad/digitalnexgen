import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import uploadImage from "../utils/uploadImage";

const Settings = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    country: "",
    phone: "",
  });
  const [newImage, setNewImage] = useState(null); // To track the new uploaded image
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const userId = useSelector(
    (state) => state.auth.user._id || state.auth.user.id
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/users/${userId}`, {
          withCredentials: true,
        });
        setUser(response.data);
      } catch {
        setError("Failed to fetch user data.");
      }
    };

    fetchUser();
  }, [apiBaseUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewImage(file); // Store the new image file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = null;
      if (newImage) {
        setIsUploading(true);
        try {
          imageUrl = await uploadImage(newImage);
          setIsUploading(false);
        } catch (uploadError) {
          setError("Failed to upload the new image.");
          setIsUploading(false);
          return;
        }
      }

      // Prepare the update payload
      const updatedData = {
        ...user,
        ...(imageUrl && { img: imageUrl }), // Only include img if a new image URL exists
      };

      await axios.put(`${apiBaseUrl}/api/users/${userId}`, updatedData, {
        withCredentials: true,
      });
      setSuccessMessage("Profile updated successfully!");
      setError(null);
    } catch {
      setError("Failed to update profile.");
      setSuccessMessage(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-openSans flex justify-center items-center p-6 min-h-screen">
      <div className="max-w-2xl w-full bg-white/70 dark:bg-gray-800/70 backdrop-blur rounded-lg shadow-lg p-8 border border-black/5 dark:border-white/10">
        <h1 className="text-3xl font-bold text-primaryRgb mb-6">Settings</h1>

        {error && <p className="text-red-500">{error}</p>}
        {successMessage && <p className="text-green-500">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm text-gray-600 dark:text-gray-300">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={user.username}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm text-gray-600 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60"
            />
          </div>

          {/* Country */}
          <div className="mb-4">
            <label htmlFor="country" className="block text-sm text-gray-600 dark:text-gray-300">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={user.country}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm text-gray-600 dark:text-gray-300">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-black/10 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60"
            />
          </div>

          {/* Profile Image */}
          <div className="mb-4">
            <label htmlFor="img" className="block text-sm text-gray-600 dark:text-gray-300">
              Profile Image
            </label>
            <input
              type="file"
              id="img"
              name="img"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border border-black/10 dark:border-white/10 focus:outline-none"
            />
            {isUploading && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Uploading...</p>
            )}
            {user.img && !newImage && (
              <div className="mt-4">
                <img
                  src={user.img}
                  alt="Current Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
            )}
            {newImage && (
              <div className="mt-4">
                <p className="text-gray-500 dark:text-gray-400 text-sm">New image selected!</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[rgb(12,187,20)] text-white py-2 px-4 rounded-md hover:brightness-95 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60"
          >
            Update Profile
          </button>

          <div className="mt-6">
            <Link
              to="/update-password"
              className="block text-center w-full bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[rgb(12,187,20)]/60"
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
