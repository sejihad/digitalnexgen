import axios from "axios";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const EditPromotionalOffer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [features, setFeatures] = useState([""]);
  const [servicesList, setServicesList] = useState([]);
  const [loadingOffer, setLoadingOffer] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      discount: "",
      originalPrice: "",
      offerPrice: "",
      offerPrices: { basic: "", standard: "", premium: "" },
      badge: "Special Offer",
      imageUrl: "",
      isActive: true,
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      category: "General",
      order: 0,
      serviceId: null,
    },
  });

  useEffect(() => {
    // load services
    let mounted = true;
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/services`)
      .then((res) => {
        if (mounted) setServicesList(res.data || []);
      })
      .catch((err) => console.error("Failed to load services for edit", err));

    return () => (mounted = false);
  }, []);

  useEffect(() => {
    // load offer
    const loadOffer = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/promotional-offers/${id}`,
        );
        const data = res.data;
        // populate form
        reset({
          title: data.title || "",
          description: data.description || "",
          discount: data.discount || "",
          originalPrice: data.originalPrice || "",
          offerPrice: data.offerPrice || "",
          offerPrices: {
            basic: data.offerPrices?.basic ?? "",
            standard: data.offerPrices?.standard ?? "",
            premium: data.offerPrices?.premium ?? "",
          },
          badge: data.badge || "Special Offer",
          imageUrl: data.imageUrl || "",
          isActive: data.isActive ?? true,
          startDate: data.startDate
            ? new Date(data.startDate).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          endDate: data.endDate
            ? new Date(data.endDate).toISOString().split("T")[0]
            : "",
          category: data.category || "General",
          order: data.order || 0,
          serviceId: data.serviceId?._id || data.serviceId || null,
        });
        setFeatures(
          data.features && data.features.length ? data.features : [""],
        );
      } catch (err) {
        console.error("Failed to load promotional offer:", err);
        toast.error("Failed to load offer");
      } finally {
        setLoadingOffer(false);
      }
    };

    loadOffer();
  }, [id, reset]);

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
  };

  const addFeature = () => setFeatures([...features, ""]);
  const removeFeature = (index) =>
    setFeatures(features.filter((_, i) => i !== index));

  const onSubmit = async (data) => {
    dispatch(showLoading());
    try {
      const cleanedFeatures = features.filter((f) => f.trim() !== "");
      if (cleanedFeatures.length === 0) {
        toast.error("Please add at least one feature");
        dispatch(hideLoading());
        return;
      }

      const offerData = {
        ...data,
        serviceId: data.serviceId || null,
        features: cleanedFeatures,
        originalPrice: Number(data.originalPrice),
        offerPrice: Number(data.offerPrice),
        offerPrices: {
          basic:
            data.offerPrices?.basic !== ""
              ? Number(data.offerPrices.basic)
              : undefined,
          standard:
            data.offerPrices?.standard !== ""
              ? Number(data.offerPrices.standard)
              : undefined,
          premium:
            data.offerPrices?.premium !== ""
              ? Number(data.offerPrices.premium)
              : undefined,
        },
        order: Number(data.order),
      };

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/promotional-offers/${id}`,
        offerData,
        { withCredentials: true },
      );

      toast.success("Promotional offer updated successfully");
      navigate("/admin/promotional-offers");
    } catch (error) {
      console.error("Error updating promotional offer:", error);
      toast.error(error.response?.data?.message || "Failed to update offer");
    } finally {
      dispatch(hideLoading());
    }
  };

  if (loadingOffer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/admin/promotional-offers")}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-pink-500 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Offers
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
            Edit Promotional Offer
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                {...register("title", { required: "Title is required" })}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., Premium Service Package"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                })}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                placeholder="Brief description of the offer"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Discount & Badge */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Discount Label *
                </label>
                <input
                  {...register("discount", {
                    required: "Discount is required",
                  })}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., 50% OFF"
                />
                {errors.discount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discount.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Badge
                </label>
                <input
                  {...register("badge")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Most Popular"
                />
              </div>
            </div>
            {/* Pricing */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Original Price *
                </label>
                <input
                  {...register("originalPrice", {
                    required: "Original price is required",
                  })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  placeholder="199"
                />
                {errors.originalPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.originalPrice.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Offer Price *
                </label>
                <input
                  {...register("offerPrice", {
                    required: "Offer price is required",
                  })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  placeholder="99"
                />
                {errors.offerPrice && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.offerPrice.message}
                  </p>
                )}
              </div>
            </div>
            {/* Per-package offer prices (optional) */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Per-package Offer Prices (optional)
              </h3>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Basic
                  </label>
                  <input
                    {...register("offerPrices.basic")}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    placeholder="49"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Standard
                  </label>
                  <input
                    {...register("offerPrices.standard")}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    placeholder="99"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Premium
                  </label>
                  <input
                    {...register("offerPrices.premium")}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    placeholder="149"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                If set, these override gig package prices when user comes from
                Offers.
              </p>
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Features *
              </label>

              {features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Feature ${index + 1}`}
                  />

                  {features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={addFeature}
                className="flex items-center gap-2 text-pink-500 hover:text-pink-600 mt-2"
              >
                <Plus className="w-5 h-5" />
                Add Feature
              </button>
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date *
                </label>
                <input
                  {...register("endDate", { required: "End date is required" })}
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Category & Order */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <input
                  {...register("category")}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  placeholder="General"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Linked Service (optional)
                </label>
                <select
                  {...register("serviceId")}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">-- None --</option>
                  {servicesList.map((svc) => (
                    <option key={svc._id} value={svc._id}>
                      {svc.title} ({svc.subCategory || svc.category})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Order
                </label>
                <input
                  {...register("order")}
                  type="number"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Image URL (Optional)
              </label>
              <input
                {...register("imageUrl")}
                type="url"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                {...register("isActive")}
                type="checkbox"
                className="w-5 h-5 text-pink-500 focus:ring-pink-500"
              />
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active (visible to users)
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-primaryRgb text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
              >
                Update Offer
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/promotional-offers")}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPromotionalOffer;
