import axios from "axios";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import uploadImage from "../utils/uploadImage";

const AdminSettings = () => {
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
  const adminId = useSelector(
    (state) => state.auth.user._id || state.auth.user.id
  );
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/users/${adminId}`, {
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

      await axios.put(`${apiBaseUrl}/api/users/${adminId}`, updatedData, {
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
    <div className="bg-[#1A1A2E] text-gray-100 font-openSans flex justify-center items-center p-6 min-h-screen">
      <div className="max-w-2xl w-full bg-[#1E293B] rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-[#00DCEE] mb-6">Settings</h1>

        {error && <p className="text-red-500">{error}</p>}
        {successMessage && <p className="text-green-500">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm text-gray-400">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={user.username}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-[#333333] text-gray-300 focus:outline-none focus:bg-[#444444]"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm text-gray-400">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-[#333333] text-gray-300 focus:outline-none focus:bg-[#444444]"
            />
          </div>

          {/* Country */}
          <div className="mb-4">
            <label htmlFor="country" className="block text-sm text-gray-400">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={user.country}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-[#333333] text-gray-300 focus:outline-none focus:bg-[#444444]"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm text-gray-400">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-[#333333] text-gray-300 focus:outline-none focus:bg-[#444444]"
            />
          </div>

          {/* Profile Image */}
          <div className="mb-4">
            <label htmlFor="img" className="block text-sm text-gray-400">
              Profile Image
            </label>
            <input
              type="file"
              id="img"
              name="img"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full px-4 py-2 rounded-md bg-[#333333] text-gray-300 focus:outline-none"
            />
            {isUploading && (
              <p className="text-gray-400 text-sm">Uploading...</p>
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
                <p className="text-gray-400 text-sm">New image selected!</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-[#00DCEE] text-gray-900 py-2 px-4 rounded-md hover:bg-[#00B8C1] transition-colors duration-300"
          >
            Update Profile
          </button>

          <div className="mt-6">
            <Link
              to="/update-password"
              className="block text-center w-full bg-[#334155] text-white py-2 px-4 rounded-md hover:bg-[#475569] transition-colors duration-300"
            >
              Change Password
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
