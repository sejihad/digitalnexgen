import axios from "axios";
import { Calendar, Edit, Eye, EyeOff, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AdminPromotionalOffers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/promotional-offers?admin=true`,
        { withCredentials: true }
      );

      setOffers(response.data);
    } catch (error) {
      console.error("Error fetching offers:", error);
      console.error("Error details:", error.response?.data);
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.patch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/promotional-offers/${id}/toggle`,
        {},
        { withCredentials: true }
      );
      toast.success("Offer status updated");
      fetchOffers();
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/promotional-offers/${id}`,
        { withCredentials: true }
      );
      toast.success("Offer deleted successfully");
      fetchOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("Failed to delete offer");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Promotional Offers
          </h1>
          <button
            onClick={() => navigate("/admin/add-promotional-offer")}
            className="flex items-center gap-2  px-6 py-3 rounded-lg font-semibold bg-white transition-all duration-300"
          >
            <Plus className="w-5 h-5" />
            Add New Offer
          </button>
        </div>

        {offers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              No promotional offers yet
            </p>
            <button
              onClick={() => navigate("/admin/add-promotional-offer")}
              className=" text-black px-6 py-3 rounded-lg font-semibold bg-white"
            >
              Create First Offer
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {offers.map((offer) => {
              const isExpired = new Date(offer.endDate) < new Date();
              const isUpcoming = new Date(offer.startDate) > new Date();

              return (
                <div
                  key={offer._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                          {offer.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            offer.isActive && !isExpired && !isUpcoming
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                              : isExpired
                              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              : isUpcoming
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {isExpired
                            ? "Expired"
                            : isUpcoming
                            ? "Upcoming"
                            : offer.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                        <span className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full text-xs font-semibold">
                          {offer.discount}
                        </span>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-3">
                        {offer.description}
                      </p>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">Price:</span>
                          <span className="line-through">
                            ${offer.originalPrice}
                          </span>
                          <span className="text-pink-500 font-bold">
                            ${offer.offerPrice}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {formatDate(offer.startDate)} -{" "}
                            {formatDate(offer.endDate)}
                          </span>
                        </div>
                        <div>
                          <span className="font-semibold">Badge:</span>{" "}
                          {offer.badge}
                        </div>
                        <div>
                          <span className="font-semibold">Category:</span>{" "}
                          {offer.category}
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                          Features:
                        </span>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {offer.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                          {offer.features.length > 3 && (
                            <li>+{offer.features.length - 3} more...</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="flex md:flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Ask for confirmation before deactivating an active offer
                          if (offer.isActive) {
                            if (
                              !window.confirm(
                                "Are you sure you want to deactivate this offer?"
                              )
                            )
                              return;
                          }
                          handleToggleStatus(offer._id);
                        }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                          offer.isActive
                            ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                            : "bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                        title={offer.isActive ? "Deactivate" : "Activate"}
                      >
                        {offer.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            <span className="hidden md:inline">Deactivate</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            <span className="hidden md:inline">Activate</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() =>
                          navigate(
                            `/admin/promotional-offers/edit/${offer._id}`
                          )
                        }
                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-semibold hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden md:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => handleDelete(offer._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden md:inline">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPromotionalOffers;
