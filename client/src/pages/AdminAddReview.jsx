import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import placeholderImg from "../assets/user.png";
import countryCodes from "../data/countryCodes.json";
import { hideLoading, showLoading } from "../redux/loadingSlice";
const AdminAddReview = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState("");
  const [star, setStar] = useState(5);
  const [desc, setDesc] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [reviewDate, setReviewDate] = useState("");
  const [country, setCountry] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState("");

  const countryList = Object.keys(countryCodes);

  const filteredCountries = countryList.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase()),
  );
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setReviewDate(today);
  }, []);
  useEffect(() => {
    const fetchServices = async () => {
      dispatch(showLoading());
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/services`,
        );
        setServices(res.data || []);
        setError("");
      } catch (error) {
        setError("Failed to fetch services.");
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchServices();
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (e) => {
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

    if (!serviceId) {
      alert("Please select a service.");
      return;
    }

    if (!name.trim()) {
      alert("Reviewer name is required.");
      return;
    }

    if (!desc.trim()) {
      alert("Review comment is required.");
      return;
    }

    if (Number.isNaN(Number(star)) || Number(star) < 1 || Number(star) > 5) {
      alert("Star must be between 1 and 5.");
      return;
    }

    const formData = new FormData();
    formData.append("serviceId", serviceId);
    formData.append("name", name.trim());
    formData.append("star", String(star));
    formData.append("desc", desc.trim());
    if (reviewDate) {
      formData.append("reviewDate", reviewDate);
    }
    formData.append("country", country);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    dispatch(showLoading());
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews/admin`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      alert("Review created successfully ✅");
    } catch (error) {
      alert(error?.response?.data?.message || "Failed to create admin review.");
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="min-h-screen bg-white p-4 text-gray-900 dark:bg-[#0f0f0f] dark:text-white md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Add Review
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Create a manual review for a specific service
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

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-[#111111] md:p-6"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                Select Service
              </label>
              {/* 🔹 Search Services */}
              <input
                type="text"
                placeholder="Search service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none mb-2 dark:bg-[#1a1a1a] dark:text-white"
              />

              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-[#181818] dark:text-white"
              >
                <option value="">Choose a service</option>
                {services
                  .filter((service) =>
                    service.title
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()),
                  )
                  .map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
                Reviewer Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter reviewer name"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-[#181818] dark:text-white"
              />
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
                Upload Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none dark:border-gray-700 dark:bg-[#181818] dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-800 dark:text-gray-200">
              Review Comment
            </label>
            <textarea
              rows="10"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Write review comment..."
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-[#181818] dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              Review Date
            </label>
            <input
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 
  dark:border-gray-700 dark:bg-[#181818] dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Country</label>
            <div className="relative">
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => {
                  setCountrySearch(e.target.value);
                  setShowCountryDropdown(true);
                }}
                onFocus={() => setShowCountryDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowCountryDropdown(false), 150);
                }}
                placeholder="Search country..."
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-[#181818] dark:text-white"
              />

              {showCountryDropdown && (
                <div className="absolute z-[9999] mt-1 max-h-48 w-full overflow-y-auto rounded-xl border bg-white shadow-lg dark:bg-[#181818]">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((c) => (
                      <div
                        key={c}
                        onClick={() => {
                          setCountry(c);
                          setCountrySearch(c);
                          setShowCountryDropdown(false);
                        }}
                        className="cursor-pointer px-3 py-2 hover:bg-gray-100 dark:hover:bg-white/10"
                      >
                        {c}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500">
                      No country found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-sm font-medium text-gray-800 dark:text-gray-200">
            Image Preview
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
            Create Review
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
    </div>
  );
};

export default AdminAddReview;
