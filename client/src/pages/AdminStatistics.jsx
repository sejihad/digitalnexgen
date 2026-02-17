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
import { useEffect, useRef, useState } from "react"; // useRef import করুন
import { toast } from "sonner";

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
  const [focusedField, setFocusedField] = useState(null); // Track which field is focused

  // Refs for each input field
  const inputRefs = {
    clientsServed: useRef(null),
    projectsCompleted: useRef(null),
    ongoingProjects: useRef(null),
    countriesReached: useRef(null),
  };

  // Fetch statistics from API
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
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedStats(statistic); // cancel editing
      setFocusedField(null); // Reset focus
    } else {
      setIsEditing(!isEditing);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field, value) => {
    if (!/^\d*$/.test(value)) return;
    setEditedStats((prev) => ({ ...prev, [field]: value }));

    // Keep focus on the current input
    if (inputRefs[field].current) {
      setTimeout(() => {
        inputRefs[field].current?.focus();
      }, 0);
    }
  };

  const handleSave = async () => {
    setUpdating(true);
    const payload = {
      clientsServed: Number(editedStats.clientsServed || 0),
      projectsCompleted: Number(editedStats.projectsCompleted || 0),
      ongoingProjects: Number(editedStats.ongoingProjects || 0),
      countriesReached: Number(editedStats.countriesReached || 0),
    };
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/statistic`,
        payload,
        { withCredentials: true },
      );
      setStatistic(payload);
      setIsEditing(false);
      setFocusedField(null); // Reset focus after saving
      toast.success("Statistics saved!");
    } catch {
      toast.error("Failed to save statistics");
    } finally {
      setUpdating(false);
    }
  };

  const incrementValue = (field) => {
    setEditedStats((prev) => ({
      ...prev,
      [field]: (parseInt(prev[field] || "0") + 1).toString(),
    }));
    setFocusedField(field);
  };

  const decrementValue = (field) => {
    setEditedStats((prev) => {
      const value = Math.max(0, parseInt(prev[field] || "0") - 1);
      return { ...prev, [field]: value.toString() };
    });
    setFocusedField(field);
  };

  // Handle input focus
  const handleInputFocus = (field) => {
    setFocusedField(field);
  };

  // Handle input blur
  const handleInputBlur = (field) => {
    // Don't immediately blur, wait a bit to prevent accidental blur
    setTimeout(() => {
      if (focusedField === field) {
        setFocusedField(null);
      }
    }, 100);
  };

  // Statistic card component - Updated with proper input handling
  const StatCard = ({ title, icon: Icon, color, field }) => {
    const handleKeyDown = (e) => {
      // Allow only numbers and navigation keys
      if (
        !/[0-9]/.test(e.key) &&
        ![
          "Backspace",
          "Delete",
          "Tab",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
        ].includes(e.key)
      ) {
        e.preventDefault();
      }
    };

    const handleSelectAll = (e) => {
      e.target.select();
    };

    return (
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
            ref={inputRefs[field]}
            type="text"
            value={editedStats[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            onFocus={() => handleInputFocus(field)}
            onBlur={() => handleInputBlur(field)}
            onKeyDown={handleKeyDown}
            onClick={handleSelectAll}
            className="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-xl sm:text-2xl font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            autoComplete="off"
            inputMode="numeric"
          />
        ) : (
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {statistic ? Number(statistic[field] || 0).toLocaleString() : "0"}
            <span className="text-sm sm:text-base font-normal text-gray-500 dark:text-gray-400 ml-1">
              +
            </span>
          </p>
        )}
      </div>
    );
  };

  // Focus on the first field when entering edit mode
  useEffect(() => {
    if (isEditing && !focusedField) {
      // Set focus to first input field when entering edit mode
      setTimeout(() => {
        inputRefs.clientsServed.current?.focus();
        inputRefs.clientsServed.current?.select();
      }, 50);
    }
  }, [isEditing]);

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      // If click is outside any input field and we're editing, don't blur
      if (isEditing) {
        const isInputClick = Object.values(inputRefs).some(
          (ref) => ref.current && ref.current.contains(event.target),
        );
        const isButtonClick = event.target.closest("button");

        if (!isInputClick && !isButtonClick) {
          // Keep focus on the currently focused field
          if (focusedField && inputRefs[focusedField].current) {
            inputRefs[focusedField].current?.focus();
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, focusedField]);

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
        {/* Header + Mobile Menu Button */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <div className="flex items-center justify-between sm:block">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                Statistics
              </h1>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="sm:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                aria-label="Toggle menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              Manage your company statistics
            </p>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
            <button
              onClick={fetchStatistics}
              className="inline-flex items-center px-3 py-2 lg:px-4 lg:py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm lg:text-base"
              aria-label="Refresh statistics"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              <span className="hidden lg:inline">Refresh</span>
            </button>

            <button
              onClick={handleEditToggle}
              className={`inline-flex items-center px-3 py-2 lg:px-4 lg:py-2 rounded-lg font-medium transition-colors text-sm lg:text-base ${
                isEditing
                  ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                  : "bg-blue-500 text-white hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              }`}
              aria-label={isEditing ? "Cancel edit" : "Edit statistics"}
            >
              {isEditing ? (
                <X className="w-4 h-4 mr-1" />
              ) : (
                <Edit2 className="w-4 h-4 mr-1" />
              )}
              <span className="hidden sm:inline">
                {isEditing ? "Cancel" : "Edit"}
              </span>
            </button>

            {isEditing && (
              <button
                onClick={handleSave}
                disabled={updating}
                className={`inline-flex items-center px-3 py-2 lg:px-4 lg:py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors text-sm lg:text-base ${
                  updating ? "opacity-75 cursor-not-allowed" : ""
                }`}
                aria-label="Save statistics"
              >
                {updating ? (
                  <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-1" />
                )}
                <span className="hidden sm:inline">
                  {updating ? "Saving..." : "Save"}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="sm:hidden fixed inset-0 z-40 flex items-start justify-end">
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-64 m-4 space-y-3 animate-fadeIn">
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
                  <X className="w-4 h-4 mr-2" />
                ) : (
                  <Edit2 className="w-4 h-4 mr-2" />
                )}
                {isEditing ? "Cancel Edit" : "Edit Statistics"}
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
                  {updating ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <StatCard
            title="Clients Served"
            icon={Users}
            color="text-blue-500"
            field="clientsServed"
          />
          <StatCard
            title="Projects Completed"
            icon={CheckCircle}
            color="text-green-500"
            field="projectsCompleted"
          />
          <StatCard
            title="Ongoing Projects"
            icon={TrendingUp}
            color="text-yellow-500"
            field="ongoingProjects"
          />
          <StatCard
            title="Countries Reached"
            icon={Earth}
            color="text-purple-500"
            field="countriesReached"
          />
        </div>

        {/* Last Updated & Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {statistic && (
            <div className="text-center sm:text-left text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Last updated:{" "}
              {statistic.updatedAt
                ? new Date(statistic.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "-"}
            </div>
          )}

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

      {/* Custom animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        @media (min-width: 475px) { .xs\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        
        /* Prevent auto-zoom on mobile iOS */
        input[type="text"] {
          font-size: 16px !important;
        }
      `}</style>
    </div>
  );
};

export default AdminStatistics;
