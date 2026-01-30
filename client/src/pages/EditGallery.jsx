import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const EditGallery = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [servicesList, setServicesList] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      imageTitle: "",
      category: "",
      gitUrl: "",
      serviceId: "",
      image: null,
    },
  });

  // Fetch services list
  useEffect(() => {
    let mounted = true;
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/services`)
      .then((res) => {
        if (mounted) setServicesList(res.data || []);
      })
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  // Fetch gallery details
  useEffect(() => {
    dispatch(showLoading());
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/galleries/${id}`, {
        withCredentials: true,
      })
      .then((res) => {
        const gallery = res.data;
        setValue("imageTitle", gallery.imageTitle);
        setValue("category", gallery.category);
        setValue("gitUrl", gallery.gitUrl || "");
        setValue("serviceId", gallery.serviceId || "");
        setImagePreview(gallery.image?.url || null);
      })
      .catch(() => toast.error("Failed to fetch gallery details"))
      .finally(() => dispatch(hideLoading()));
  }, [id, setValue, dispatch]);

  const handleImagePreview = (e) => {
    const file = e.target.files[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    dispatch(showLoading());
    try {
      const formData = new FormData();
      formData.append("imageTitle", data.imageTitle);
      formData.append("category", data.category);
      if (data.gitUrl) formData.append("gitUrl", data.gitUrl);
      if (data.serviceId) formData.append("serviceId", data.serviceId);

      // append file if new image selected
      if (data.image && data.image[0]) {
        formData.append("image", data.image[0]);
      }

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/galleries/${id}`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("Gallery item updated successfully!");
      navigate("/admin/galleries");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update gallery item. Please try again.",
      );
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="p-6 text-white bg-[#333333] max-w-[800px] mx-auto rounded-md mt-4">
      <h1 className="text-center text-3xl font-bold mb-4 font-roboto">
        Edit Gallery Item
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Image Title */}
        <input
          {...register("imageTitle", { required: "Image title is required" })}
          placeholder="Image Title"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.imageTitle && (
          <p className="text-red-500">{errors.imageTitle.message}</p>
        )}

        {/* Category */}
        <select
          {...register("category", { required: "Category is required" })}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="">Select Category</option>
          <option value="programming-tech">Programming & Tech</option>
          <option value="graphics-design">Graphics & Design</option>
          <option value="digital-marketing">Digital Marketing</option>
          <option value="video-animation">Video & Animation</option>
          <option value="business">Business</option>
          <option value="writing-translation">Writing & Translation</option>
        </select>
        {errors.category && (
          <p className="text-red-500">{errors.category.message}</p>
        )}

        {/* GitHub URL */}
        <input
          {...register("gitUrl")}
          placeholder="GitHub URL (optional)"
          className="w-full p-2 rounded bg-gray-700"
        />

        {/* Linked Service */}
        <select
          {...register("serviceId")}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="">-- Linked Service (optional) --</option>
          {servicesList.map((svc) => (
            <option key={svc._id} value={svc._id}>
              {svc.title} ({svc.subCategory || svc.category})
            </option>
          ))}
        </select>

        {/* Image Upload */}
        <input
          {...register("image")}
          type="file"
          accept="image/*"
          onChange={handleImagePreview}
          className="w-full p-2 rounded bg-gray-700"
        />

        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-2 flex justify-center">
            <img
              src={imagePreview}
              alt="Gallery Preview"
              className="w-32 h-32 object-contain rounded-md border border-gray-600"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-full p-2 bg-primaryRgb rounded text-white"
        >
          Update Gallery
        </button>
      </form>
    </div>
  );
};

export default EditGallery;
