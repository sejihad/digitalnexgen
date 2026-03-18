import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [categories] = useState([
    "programming-tech",
    "graphics-design",
    "digital-marketing",
    "video-animation",
    "business",
    "writing-translation",
  ]);
  const [filter, setFilter] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      dispatch(showLoading());
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/services`,
          {
            params: {
              category: filter,
            },
          },
        );

        setServices(response.data || []);
        setError("");
      } catch (error) {
        setError("Failed to fetch services. Please try again later.");
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchServices();
  }, [filter, dispatch]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
    setIsMobileMenuOpen(false);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this service?",
    );
    if (!confirmDelete) return;

    dispatch(showLoading());
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/services/${id}`,
        {
          withCredentials: true,
        },
      );

      setServices((prev) => prev.filter((service) => service._id !== id));
      alert("Service deleted successfully.");
    } catch (error) {
      alert("Failed to delete the service. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleUpdate = (id) => {
    navigate(`/admin/services/edit/${id}`);
  };

  const handleReviewsPage = (service) => {
    navigate(`/admin/services/${service._id}/reviews`);
  };
  const filteredServices = services.filter((service) =>
    service.title?.toLowerCase().includes(search.toLowerCase()),
  );
  // Mobile card view for each service
  const MobileServiceCard = ({ service, index }) => (
    <div className="border border-gray-200 rounded-xl p-4 mb-3 bg-white dark:bg-[#111111] dark:border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          #{index + 1}
        </span>
        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-300">
          {service.category || "N/A"}
        </span>
      </div>

      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
        {service.title || "Untitled Service"}
      </h3>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-600 dark:text-gray-400">
          Reviews:
        </span>
        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-white/5 dark:text-gray-300">
          {service.starNumber || 0}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleUpdate(service._id)}
          className="flex-1 min-w-[80px] rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700"
        >
          Update
        </button>
        <button
          onClick={() => handleReviewsPage(service)}
          className="flex-1 min-w-[80px] rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-indigo-700"
        >
          Reviews
        </button>
        <button
          onClick={() => handleDelete(service._id)}
          className="flex-1 min-w-[80px] rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-white text-gray-900 dark:bg-[#0f0f0f] dark:text-white min-h-screen">
      {/* Header Section */}
      <div className="mb-4 sm:mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Admin Services
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Manage services and access service reviews
          </p>
        </div>

        {/* Filter Section - Mobile Dropdown */}
        <div className="w-full sm:w-72">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sm:hidden w-full flex items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-[#181818] dark:text-white"
          >
            <span>
              {filter
                ? filter.replace(/-/g, " ").toUpperCase()
                : "All Categories"}
            </span>
            <svg
              className={`w-4 h-4 transition-transform ${isMobileMenuOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Mobile Filter Options */}
          {isMobileMenuOpen && (
            <div className="sm:hidden absolute z-10 mt-1 w-full rounded-xl border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-[#181818]">
              <button
                onClick={() => {
                  setFilter("");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-[#222222] ${
                  filter === "" ? "bg-gray-100 dark:bg-[#222222]" : ""
                }`}
              >
                All Categories
              </button>
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setFilter(category);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-[#222222] ${
                    filter === category ? "bg-gray-100 dark:bg-[#222222]" : ""
                  }`}
                >
                  {category.replace(/-/g, " ").toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Desktop Filter */}
          <select
            id="categoryFilter"
            value={filter}
            onChange={handleFilterChange}
            className="hidden sm:block w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-[#181818] dark:text-white dark:focus:border-gray-500"
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category.replace(/-/g, " ").toUpperCase()}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mt-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-[#181818] dark:text-white"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {/* No Services Message */}
      {!services.length && !error && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs sm:text-sm text-gray-500 dark:border-gray-800 dark:bg-[#161616] dark:text-gray-400">
          No services available.
        </div>
      )}

      {/* Services Display */}
      {services.length > 0 && (
        <>
          {/* Mobile View - Cards */}
          <div className="block sm:hidden">
            {filteredServices.map((service, index) => (
              <MobileServiceCard
                key={service._id}
                service={service}
                index={index}
              />
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden sm:block overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-[#111111]">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-100 text-xs uppercase tracking-wide text-gray-600 dark:bg-[#1a1a1a] dark:text-gray-400">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Reviews</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredServices.map((service, index) => (
                    <tr
                      key={service._id}
                      className="border-t border-gray-200 bg-white transition hover:bg-gray-50 dark:border-gray-800 dark:bg-[#111111] dark:hover:bg-[#181818]"
                    >
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <p className="max-w-[200px] lg:max-w-[280px] truncate font-medium text-gray-900 dark:text-white">
                          {service.title || "Untitled Service"}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-300">
                          {service.category || "N/A"}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-white/5 dark:text-gray-300">
                          {service.starNumber || 0}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleUpdate(service._id)}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 whitespace-nowrap"
                          >
                            Update
                          </button>

                          <button
                            onClick={() => handleReviewsPage(service)}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-700 whitespace-nowrap"
                          >
                            Reviews
                          </button>

                          <button
                            onClick={() => handleDelete(service._id)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 whitespace-nowrap"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminServices;
