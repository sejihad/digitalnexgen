import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import placeholderImg from "../assets/user.png";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const AdminServiceReviews = () => {
  const { serviceId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [serviceInfo, setServiceInfo] = useState(null);
  const [counts, setCounts] = useState({
    total: 0,
    visible: 0,
    hidden: 0,
  });
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [expandedReviews, setExpandedReviews] = useState({});

  useEffect(() => {
    const fetchServiceReviews = async () => {
      dispatch(showLoading());
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/reviews/admin/service/${serviceId}`,
          { withCredentials: true },
        );

        setServiceInfo(res.data?.service || null);
        setCounts(
          res.data?.counts || {
            total: 0,
            visible: 0,
            hidden: 0,
          },
        );
        setReviews(res.data?.reviews || []);
        setError("");
      } catch (error) {
        setError(
          error?.response?.data?.message || "Failed to fetch service reviews.",
        );
      } finally {
        dispatch(hideLoading());
      }
    };

    if (serviceId) {
      fetchServiceReviews();
    }
  }, [serviceId, dispatch]);

  const handleDelete = async (reviewId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this review?",
    );
    if (!confirmDelete) return;

    dispatch(showLoading());
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews/${reviewId}`,
        { withCredentials: true },
      );

      const updatedReviews = reviews.filter(
        (review) => review._id !== reviewId,
      );
      setReviews(updatedReviews);

      const visibleCount = updatedReviews.filter((r) => r.isVisible).length;
      const hiddenCount = updatedReviews.filter((r) => !r.isVisible).length;

      setCounts({
        total: updatedReviews.length,
        visible: visibleCount,
        hidden: hiddenCount,
      });
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to delete the review.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const handleUpdate = (reviewId) => {
    navigate(`/admin/reviews/edit/${reviewId}`);
  };

  const toggleReviewExpand = (reviewId) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  // Mobile card view for each review
  const MobileReviewCard = ({ review, index }) => {
    const isExpanded = expandedReviews[review._id];
    const commentText = review.desc || "No comment provided";
    const shouldTruncate = commentText.length > 100 && !isExpanded;

    return (
      <div className="border border-gray-200 rounded-xl p-4 mb-3 bg-white dark:bg-[#111111] dark:border-gray-800">
        {/* Header with index and status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            #{index + 1}
          </span>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              review.isVisible
                ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                : "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300"
            }`}
          >
            {review.isVisible ? "Visible" : "Hidden"}
          </span>
        </div>

        {/* Reviewer Info */}
        <div className="flex items-center gap-3 mb-3">
          <img
            src={review.userImage?.url || placeholderImg}
            alt={review.name}
            className="h-12 w-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
          />
          <div className="flex-1">
            <p className="font-medium text-gray-900 dark:text-white">
              {review.name || "Anonymous"}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex rounded-full bg-yellow-50 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300">
                {review.star}/5
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(
                  review.reviewDate || review.createdAt,
                ).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Comment:
          </p>
          <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg">
            {shouldTruncate ? (
              <>
                {commentText.substring(0, 100)}...
                <button
                  onClick={() => toggleReviewExpand(review._id)}
                  className="text-blue-600 dark:text-blue-400 ml-1 text-xs font-medium"
                >
                  Read More
                </button>
              </>
            ) : (
              <>
                {commentText}
                {commentText.length > 100 && (
                  <button
                    onClick={() => toggleReviewExpand(review._id)}
                    className="text-blue-600 dark:text-blue-400 ml-1 text-xs font-medium"
                  >
                    Show Less
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleUpdate(review._id)}
            className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-blue-700"
          >
            Update
          </button>
          <button
            onClick={() => handleDelete(review._id)}
            className="flex-1 rounded-lg bg-red-600 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-3 sm:p-4 md:p-6 text-gray-900 dark:bg-[#0f0f0f] dark:text-white">
      {/* Header Section */}
      <div className="mb-4 sm:mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Service Reviews
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            Manage reviews for this service
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/services")}
          className="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-2.5 sm:py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#1a1a1a]"
        >
          ← Back to Services
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs sm:text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Service Info Card */}
      {serviceInfo && (
        <div className="mb-4 sm:mb-5 rounded-2xl border border-gray-200 bg-gray-50 p-3 sm:p-4 dark:border-gray-800 dark:bg-[#151515]">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {serviceInfo.title}
          </h2>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-500/10 dark:text-red-300">
              {serviceInfo.category || "N/A"}
            </span>

            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-white/5 dark:text-gray-300">
              Total: {counts.total}
            </span>

            <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-300">
              Visible: {counts.visible}
            </span>

            <span className="inline-flex rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300">
              Hidden: {counts.hidden}
            </span>

            <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              Rating: {Math.round((serviceInfo.averageStars || 0) * 10) / 10}
            </span>
          </div>
        </div>
      )}

      {/* No Reviews Message */}
      {!reviews.length && !error && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center text-xs sm:text-sm text-gray-500 dark:border-gray-800 dark:bg-[#161616] dark:text-gray-400">
          No reviews found for this service.
        </div>
      )}

      {/* Reviews Display */}
      {reviews.length > 0 && (
        <>
          {/* Mobile View - Cards */}
          <div className="block sm:hidden">
            {reviews.map((review, index) => (
              <MobileReviewCard
                key={review._id}
                review={review}
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
                    <th className="px-4 py-3">Reviewer</th>
                    <th className="px-4 py-3">Rating</th>
                    <th className="px-4 py-3">Comment</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {reviews.map((review, index) => (
                    <tr
                      key={review._id}
                      className="border-t border-gray-200 bg-white transition hover:bg-gray-50 dark:border-gray-800 dark:bg-[#111111] dark:hover:bg-[#181818]"
                    >
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={review.userImage?.url || placeholderImg}
                            alt={review.name}
                            className="h-8 w-8 lg:h-10 lg:w-10 rounded-full object-cover"
                          />
                          <p className="max-w-[120px] lg:max-w-[180px]  font-medium text-gray-900 dark:text-white">
                            {review.name || "Anonymous"}
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300">
                          {review.star}/5
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <p className="max-w-[200px] lg:max-w-[260px] truncate text-gray-700 dark:text-gray-300">
                          {review.desc || "No comment"}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            review.isVisible
                              ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300"
                              : "bg-yellow-50 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300"
                          }`}
                        >
                          {review.isVisible ? "Visible" : "Hidden"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                        {new Date(
                          review.reviewDate || review.createdAt,
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-col lg:flex-row gap-2">
                          <button
                            onClick={() => handleUpdate(review._id)}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 whitespace-nowrap"
                          >
                            Update
                          </button>

                          <button
                            onClick={() => handleDelete(review._id)}
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

export default AdminServiceReviews;
