import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import placeholderImg from "../assets/user.png";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const AdminUpdateReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [serviceInfo, setServiceInfo] = useState(null);
  const [review, setReview] = useState(null);
  const [reviewDate, setReviewDate] = useState("");
  const [country, setCountry] = useState("");
  const [name, setName] = useState("");
  const [star, setStar] = useState(5);
  const [desc, setDesc] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  const isUserReview = useMemo(() => Boolean(review?.userId), [review?.userId]);

  useEffect(() => {
    const fetchReviewDetails = async () => {
      dispatch(showLoading());
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/reviews/single/${id}`,
          { withCredentials: true },
        );

        const fetchedReview = res.data?.review || null;
        const fetchedService = res.data?.service || null;

        setReview(fetchedReview);
        setServiceInfo(fetchedService);

        setName(fetchedReview?.name || "");
        setStar(Number(fetchedReview?.star) || 5);
        setDesc(fetchedReview?.desc || "");
        setReviewDate(
          fetchedReview?.reviewDate
            ? new Date(fetchedReview.reviewDate).toISOString().split("T")[0]
            : "",
        );

        setCountry(fetchedReview?.country || "");
        setIsVisible(Boolean(fetchedReview?.isVisible));
        setImagePreview(fetchedReview?.userImage?.url || "");
        setImageFile(null);
        setError("");
      } catch (error) {
        setError(
          error?.response?.data?.message || "Failed to fetch review details.",
        );
      } finally {
        dispatch(hideLoading());
      }
    };

    if (id) {
      fetchReviewDetails();
    }
  }, [id, dispatch]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
    if (isUserReview) return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!desc.trim()) {
      alert("Comment is required.");
      return;
    }

    if (Number.isNaN(Number(star)) || Number(star) < 1 || Number(star) > 5) {
      alert("Star must be between 1 and 5.");
      return;
    }

    const formData = new FormData();

    formData.append("star", String(star));
    formData.append("desc", desc.trim());
    formData.append("reviewDate", reviewDate);
    formData.append("country", country);
    formData.append("isVisible", String(isVisible));

    // only manual/admin reviews can update name and image
    if (!isUserReview) {
      formData.append("name", name.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      }
    }

    dispatch(showLoading());
    try {
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews/${id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      navigate(-1);
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to update the review.");
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 text-gray-900 dark:bg-[#0f0f0f] dark:text-white md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Update Review
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Edit review content and visibility
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#1a1a1a]"
        >
          Back
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {serviceInfo && (
        <div className="mb-5 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-[#151515]">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {serviceInfo.title}
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Category: {serviceInfo.category || "N/A"}
          </p>
        </div>
      )}

      {review && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#111111] md:p-6"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isUserReview}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-700 dark:bg-[#181818] dark:text-white dark:disabled:bg-[#222222] dark:disabled:text-gray-400"
                />
                {isUserReview && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    User review name is locked and cannot be changed.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                  Rating
                </label>
                <select
                  value={star}
                  onChange={(e) => setStar(Number(e.target.value))}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-[#181818] dark:text-white"
                >
                  <option value={5}>5 Star</option>
                  <option value={4}>4 Star</option>
                  <option value={3}>3 Star</option>
                  <option value={2}>2 Star</option>
                  <option value={1}>1 Star</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                  Visibility
                </label>
                <select
                  value={String(isVisible)}
                  onChange={(e) => setIsVisible(e.target.value === "true")}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-[#181818] dark:text-white"
                >
                  <option value="true">Visible</option>
                  <option value="false">Hidden</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                  Replace Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isUserReview}
                  className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 dark:border-gray-700 dark:bg-[#181818] dark:text-white dark:disabled:bg-[#222222] dark:disabled:text-gray-400"
                />
                {isUserReview && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    User review image is locked and cannot be changed.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                Comment
              </label>
              <textarea
                rows="10"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-[#181818] dark:text-white"
              />
            </div>
            <div>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 
  dark:border-gray-700 dark:bg-[#181818] dark:text-white"
              />
            </div>
            <div>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Enter country"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 
  dark:border-gray-700 dark:bg-[#181818] dark:text-white"
              />
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Current / New Image Preview
            </label>

            <img
              src={imagePreview || placeholderImg}
              alt="Review Preview"
              className="h-24 w-24 rounded-xl border border-gray-300 object-cover dark:border-gray-700"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Save Changes
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-[#1a1a1a]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminUpdateReview;
