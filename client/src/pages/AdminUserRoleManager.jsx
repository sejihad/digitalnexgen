import axios from "axios";
import {
  Copy,
  Edit,
  Globe,
  Home,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Shield,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});

  useEffect(() => {
    if (id) {
      fetchUserDetails();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/${id}`,
        { withCredentials: true },
      );

      setUser(res.data);
      setEditedUser(res.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load user details",
      );
      navigate("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (
      !window.confirm(
        `Are you sure you want to change this user's role to ${!user.isAdmin ? "Admin" : "User"}?`,
      )
    ) {
      return;
    }

    setUpdating(true);
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/${id}/role`,
        { isAdmin: !user.isAdmin },
        { withCredentials: true },
      );

      toast.success(res.data.message);
      setUser((prev) => ({ ...prev, isAdmin: !prev.isAdmin }));
      setEditedUser((prev) => ({ ...prev, isAdmin: !prev.isAdmin }));
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update user role",
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone.",
      )
    )
      return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/${id}`,
        { withCredentials: true },
      );
      toast.success("User deleted successfully");
      navigate("/admin/users");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setEditedUser(user);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/users/${id}`,
        editedUser,
        { withCredentials: true },
      );

      toast.success("User updated successfully");
      setUser(res.data);
      setEditedUser(res.data);
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleInputChange = (field, value) => {
    setEditedUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user you're looking for doesn't exist.
          </p>
          <Link
            to="/admin/users"
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Users
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                to="/admin/users"
                className="inline-flex items-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-4"
              >
                <X className="w-4 h-4 mr-1 rotate-180" />
                Back to Users
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                User Details
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Manage user information and permissions
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEditToggle}
                className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel Edit
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit User
                  </>
                )}
              </button>
              <span
                className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                  user.isAdmin
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                    : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                }`}
              >
                <Shield className="w-4 h-4 mr-2" />
                {user.isAdmin ? "Administrator" : "Regular User"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 sticky top-6">
              {/* Profile Picture */}
              <div className="flex justify-center mb-6">
                {user.img?.url ? (
                  <img
                    src={user.img.url}
                    alt={user.name}
                    className="h-48 w-48 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-xl"
                  />
                ) : (
                  <div className="h-48 w-48 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-xl">
                    <span className="text-white text-5xl font-bold">
                      {user.name?.charAt(0).toUpperCase() ||
                        user.username?.charAt(0).toUpperCase() ||
                        "U"}
                    </span>
                  </div>
                )}
              </div>

              {/* User ID */}
              <div className="mb-6">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                  User ID
                </label>
                <div className="flex items-center">
                  <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded text-sm font-mono text-gray-800 dark:text-gray-200 truncate">
                    {user._id}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user._id);
                      toast.success("User ID copied to clipboard");
                    }}
                    className="ml-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleRoleUpdate}
                  disabled={updating}
                  className={`w-full inline-flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                    user.isAdmin
                      ? "bg-yellow-500 text-white hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700"
                      : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                  } ${updating ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  {updating ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  {updating
                    ? "Updating..."
                    : user.isAdmin
                      ? "Change to Regular User"
                      : "Make Administrator"}
                </button>

                <button
                  onClick={handleDelete}
                  className="w-full inline-flex items-center justify-center px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-800"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </button>

                {isEditing && (
                  <button
                    onClick={handleSaveChanges}
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                )}
              </div>

              {/* Timestamps */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                  Account Timestamps
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Last Updated
                    </p>
                    <p className="text-sm text-gray-800 dark:text-gray-200">
                      {formatDate(user.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {/* Basic Information */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.name || ""}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter full name"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200">
                        {user.name || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Username
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedUser.username || ""}
                        onChange={(e) =>
                          handleInputChange("username", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter username"
                      />
                    ) : (
                      <p className="text-gray-800 dark:text-gray-200 font-mono">
                        {user.username}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      {isEditing ? (
                        <input
                          type="email"
                          value={editedUser.email || ""}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter email"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-gray-200">
                          {user.email || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Account Type
                    </label>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          user.isAdmin
                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        }`}
                      >
                        {user.provider === "google"
                          ? "Google Account"
                          : user.provider === "facebook"
                            ? "Facebook Account"
                            : "Local Account"}{" "}
                        • {user.isAdmin ? "Admin" : "User"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedUser.phone || ""}
                          onChange={(e) =>
                            handleInputChange("phone", e.target.value)
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-gray-200">
                          {user.phone || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Country
                    </label>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedUser.country || ""}
                          onChange={(e) =>
                            handleInputChange("country", e.target.value)
                          }
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter country"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-gray-200">
                          {user.country || "Not provided"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                  Description
                </h2>
                {isEditing ? (
                  <textarea
                    value={editedUser.desc || ""}
                    onChange={(e) => handleInputChange("desc", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter user description"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {user.desc || "No description provided."}
                  </p>
                )}
              </div>

              {/* Security Information */}
              <div className="p-6 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Security Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.isTwoFactorEnabled ? "Enabled" : "Disabled"}
                      </p>
                    </div>
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

export default AdminUserDetailPage;
