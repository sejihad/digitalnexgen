import axios from "axios";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Earth,
  Edit2,
  Menu,
  RefreshCw,
  Save,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const AdminStatistics = () => {
  const [statistic, setStatistic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedStats, setEditedStats] = useState({
    clientsServed: "",
    projectsCompleted: "",
    ongoingProjects: "",
    countriesReached: "",
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/statistic`,
        { withCredentials: true },
      );
      setStatistic(res.data.statistic);
      setEditedStats(res.data.statistic);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      setEditedStats(statistic);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    // allow only numbers
    if (!/^\d*$/.test(value)) return;

    setEditedStats((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    const payload = {
      clientsServed: Number(editedStats.clientsServed || 0),
      projectsCompleted: Number(editedStats.projectsCompleted || 0),
      ongoingProjects: Number(editedStats.ongoingProjects || 0),
      countriesReached: Number(editedStats.countriesReached || 0),
    };

    await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/api/statistic`,
      payload,
      { withCredentials: true },
    );

    setStatistic(payload);
    setIsEditing(false);
  };

  const incrementValue = (field) => {
    setEditedStats((prev) => ({
      ...prev,
      [field]: prev[field] + 1,
    }));
  };

  const decrementValue = (field) => {
    if (editedStats[field] > 0) {
      setEditedStats((prev) => ({
        ...prev,
        [field]: Math.max(0, prev[field] - 1),
      }));
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, field }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg ${color} bg-opacity-10`}>
          <Icon
            className={`w-5 h-5 sm:w-6 sm:h-6 ${color.replace("text-", "")}`}
          />
        </div>
        {isEditing && (
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => decrementValue(field)}
              className="p-1 sm:p-1.5 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={`Decrease ${title}`}
            >
              <span className="text-sm sm:text-lg font-bold">-</span>
            </button>
            <button
              onClick={() => incrementValue(field)}
              className="p-1 sm:p-1.5 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label={`Increase ${title}`}
            >
              <span className="text-sm sm:text-lg font-bold">+</span>
            </button>
          </div>
        )}
      </div>
      <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
        {title}
      </h3>
      {isEditing ? (
        <input
          type="text"
          value={editedStats[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-xl sm:text-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          min="0"
          aria-label={`Edit ${title}`}
        />
      ) : (
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {statistic ? statistic[field].toLocaleString() : "0"}
          <span className="text-sm sm:text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
            +
          </span>
        </p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="w-full sm:w-auto">
              <div className="flex items-center justify-between sm:block">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                  Statistics
                </h1>
                <button
                  onClick={fetchStatistics}
                  className="sm:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  aria-label="Refresh statistics"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                Manage your company statistics
              </p>
            </div>

            {/* Action Buttons - Desktop */}
            <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
              <button
                onClick={fetchStatistics}
                className="inline-flex items-center px-3 py-2 lg:px-4 lg:py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm lg:text-base"
              >
                <RefreshCw className="w-4 h-4 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                <span className="hidden lg:inline">Refresh</span>
              </button>
              <button
                onClick={handleEditToggle}
                className={`inline-flex items-center px-3 py-2 lg:px-4 lg:py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                  isEditing
                    ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                    : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                }`}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    <span className="hidden sm:inline">Cancel</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    <span>Edit</span>
                  </>
                )}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={updating}
                  className={`inline-flex items-center px-3 py-2 lg:px-4 lg:py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-sm lg:text-base ${
                    updating ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
                  {updating ? (
                    <RefreshCw className="w-4 h-4 lg:w-4 lg:h-4 mr-1 lg:mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {updating ? "Saving..." : "Save"}
                  </span>
                </button>
              )}
            </div>

            {/* Action Buttons - Mobile (in menu) */}
            {isMobileMenuOpen && (
              <div className="sm:hidden fixed top-16 right-4 z-40 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-64 animate-fadeIn">
                <div className="space-y-3">
                  <button
                    onClick={fetchStatistics}
                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      isEditing
                        ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                        : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancel Edit
                      </>
                    ) : (
                      <>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Statistics
                      </>
                    )}
                  </button>
                  {isEditing && (
                    <button
                      onClick={handleSave}
                      disabled={updating}
                      className={`w-full flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors ${
                        updating ? "opacity-75 cursor-not-allowed" : ""
                      }`}
                    >
                      {updating ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      {updating ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Clients Served"
            value={statistic?.clientsServed}
            icon={Users}
            color="text-blue-500"
            field="clientsServed"
          />
          <StatCard
            title="Projects Completed"
            value={statistic?.projectsCompleted}
            icon={CheckCircle}
            color="text-green-500"
            field="projectsCompleted"
          />
          <StatCard
            title="Ongoing Projects"
            value={statistic?.ongoingProjects}
            icon={TrendingUp}
            color="text-yellow-500"
            field="ongoingProjects"
          />
          <StatCard
            title="Countries Reached"
            value={statistic?.countriesReached}
            icon={Earth}
            color="text-purple-500"
            field="countriesReached"
          />
        </div>

        {/* Last Updated & Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {statistic && (
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Last updated:{" "}
                {new Date(statistic.updatedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center space-x-2">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <ChevronRight className="w-4 h-4 mr-1" />
              Reload Page
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        /* Extra small breakpoint */
        @media (min-width: 475px) {
          .xs\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default AdminStatistics;
