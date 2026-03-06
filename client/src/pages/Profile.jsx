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
  }, [id, apiBaseUrl]);

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl border border-red-200/60 bg-white/70 p-6 text-center shadow-xl backdrop-blur-xl dark:border-red-500/20 dark:bg-white/5">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl border border-black/10 bg-white/70 p-6 text-center shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
          <p className="text-gray-700 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-black dark:text-gray-100 font-openSans py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white/70 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
          {/* Top Banner */}
          <div className="relative h-32 sm:h-40 bg-gradient-to-r from-cyan-500/90 via-sky-500/80 to-emerald-500/80 dark:from-cyan-500/30 dark:via-sky-500/20 dark:to-emerald-500/20">
            <div className="absolute inset-0 bg-white/10 dark:bg-black/10" />
          </div>

          {/* Main Content */}
          <div className="relative px-5 pb-6 pt-0 sm:px-8 sm:pb-8">
            {/* Profile header row */}
            <div className="-mt-14 sm:-mt-16 flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="mx-auto sm:mx-0">
                <div className="rounded-full border-4 border-white/80 bg-white/60 p-1 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-white/10">
                  <div className="h-28 w-28 overflow-hidden rounded-full sm:h-32 sm:w-32">
                    <img
                      src={user?.img?.url || "https://via.placeholder.com/150"}
                      alt={`${user.name || user.username}'s profile`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 text-center sm:pb-2 sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                  {user.name || user.username}
                </h1>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                  {user.country || "N/A"}
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
                  Joined On:{" "}
                  {user.createdAt
                    ? format(new Date(user.createdAt), "MMMM dd, yyyy")
                    : "N/A"}
                </p>
              </div>
            </div>

            {/* Info cards */}
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-black/10 bg-white/60 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <h2 className="mb-4 text-lg font-semibold text-cyan-600 dark:text-cyan-400">
                  Contact Information
                </h2>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      UserId
                    </p>
                    <p className="break-all text-sm font-medium text-gray-800 dark:text-gray-100">
                      {user.username}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Email
                    </p>
                    <p className="break-all text-sm font-medium text-gray-800 dark:text-gray-100">
                      {user.email}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Phone
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {user.phone || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-black/10 bg-white/60 p-5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
                <h2 className="mb-4 text-lg font-semibold text-cyan-600 dark:text-cyan-400">
                  Additional Details
                </h2>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-black/5 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Country
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {user.country ? user.country : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
