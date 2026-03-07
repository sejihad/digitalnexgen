import axios from "axios";
import { MessageCircle, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState("");

  const navigate = useNavigate();
  const apiBase = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${apiBase}/api/users`, {
        withCredentials: true,
      });
      setUsers(Array.isArray(res.data?.users) ? res.data.users : []);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this user?");
    if (!ok) return;

    try {
      setActionLoading(`delete-${id}`);
      await axios.delete(`${apiBase}/api/users/${id}`, {
        withCredentials: true,
      });
      toast.success("User deleted successfully");
      setUsers((prev) => prev.filter((user) => user._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    } finally {
      setActionLoading("");
    }
  };

  const handleOpenMessage = async (userId) => {
    try {
      setActionLoading(`message-${userId}`);

      const res = await axios.post(
        `${apiBase}/api/conversations`,
        { customerId: userId },
        { withCredentials: true },
      );

      const conversationId = res.data?._id;

      if (!conversationId) {
        toast.error("Conversation open failed");
        return;
      }

      navigate(`/admin/messages/${conversationId}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to open conversation",
      );
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-pink-500 dark:border-pink-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            Users Management
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage users and open direct conversations
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {users.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
                No users found
              </p>
            </div>
          ) : (
            <>
              {/* Desktop / tablet header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 lg:px-6 py-3 bg-gray-50 dark:bg-gray-700/40 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                <div className="col-span-3">Name</div>
                <div className="col-span-4">Email</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-3 text-right">Actions</div>
              </div>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => {
                  const isMsgLoading = actionLoading === `message-${user._id}`;
                  const isDeleteLoading =
                    actionLoading === `delete-${user._id}`;

                  return (
                    <div
                      key={user._id}
                      className="px-3 sm:px-4 lg:px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
                    >
                      {/* Mobile layout */}
                      <div className="md:hidden space-y-3">
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {user.name || "Unnamed User"}
                            </h2>

                            {user.isAdmin ? (
                              <span className="shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                Admin
                              </span>
                            ) : (
                              <span className="shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                User
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 break-all">
                            {user.email || "—"}
                          </p>

                          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 break-all">
                            {user._id}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleOpenMessage(user._id)}
                            disabled={!!actionLoading}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 disabled:opacity-60"
                          >
                            <MessageCircle className="w-4 h-4" />
                            {isMsgLoading ? "..." : "Message"}
                          </button>

                          <button
                            onClick={() =>
                              navigate(`/admin/users/edit/${user._id}`)
                            }
                            disabled={!!actionLoading}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 disabled:opacity-60"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={!!actionLoading}
                            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 disabled:opacity-60"
                          >
                            <Trash2 className="w-4 h-4" />
                            {isDeleteLoading ? "..." : "Delete"}
                          </button>
                        </div>
                      </div>

                      {/* Desktop / tablet row */}
                      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-3 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {user.name || "Unnamed User"}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {user._id}
                          </p>
                        </div>

                        <div className="col-span-4 min-w-0">
                          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {user.email || "—"}
                          </p>
                        </div>

                        <div className="col-span-2">
                          {user.isAdmin ? (
                            <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              User
                            </span>
                          )}
                        </div>

                        <div className="col-span-3 flex items-center justify-end gap-2 flex-wrap">
                          <button
                            onClick={() => handleOpenMessage(user._id)}
                            disabled={!!actionLoading}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 disabled:opacity-60"
                          >
                            <MessageCircle className="w-4 h-4" />
                            {isMsgLoading ? "Opening..." : "Message"}
                          </button>

                          <button
                            onClick={() =>
                              navigate(`/admin/users/edit/${user._id}`)
                            }
                            disabled={!!actionLoading}
                            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 disabled:opacity-60"
                          >
                            <Pencil className="w-4 h-4" />
                            Edit
                          </button>

                          <button
                            onClick={() => handleDelete(user._id)}
                            disabled={!!actionLoading}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 disabled:opacity-60"
                          >
                            <Trash2 className="w-4 h-4" />
                            {isDeleteLoading ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 lg:px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/20">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total users:{" "}
                  <span className="font-semibold">{users.length}</span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
