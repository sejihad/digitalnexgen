import axios from "axios";
import { format } from "date-fns";
import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
const Profile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  const [error, setError] = useState(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/api/users/${id}`, {
          withCredentials: true,
        });

        setUser(response.data);
      } catch (err) {
        setError("Failed to fetch user data.");
      }
    };

    if (id) {
      fetchUser();
    }
  }, [id]);

  if (error) return <p className="text-red-500">{error}</p>;

  if (!user) return <p className="text-gray-300">Loading...</p>;

  return (
    <div className="bg-slate-50 text-gray-900 dark:bg-[#1A1A2E] dark:text-gray-100 font-openSans flex justify-center items-center p-6 min-h-screen">
      <div className="max-w-2xl w-full bg-white dark:bg-[#1E293B] rounded-lg shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#00DCEE]">
            <img
              src={user?.img || "https://via.placeholder.com/150"}
              alt={`${user.name || user.username}'s profile`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-[#00DCEE]">
              {user.name || user.username}
            </h1>
            
            <p className="text-lg text-gray-600 dark:text-gray-300">{user.country}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Joined On:{" "}
              {user.createdAt
                ? format(new Date(user.createdAt), "MMMM dd, yyyy")
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold text-[#00DCEE] mb-2">
              Contact Information
            </h2>
            <p className="text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">UserId: </span>
              {user.username}
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Email: </span>
              {user.email}
            </p>
            <p className="text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Phone: </span>
              {user.phone || "N/A"}
            </p>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#00DCEE] mb-2">
              Additional Details
            </h2>
            <p className="text-sm">
              <span className="font-medium text-gray-700 dark:text-gray-300">Country: </span>
              {user.country ? user.country : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
