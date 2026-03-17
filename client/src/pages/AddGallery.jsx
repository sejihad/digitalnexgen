import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const AddGallery = () => {
  const dispatch = useDispatch();
  const [servicesList, setServicesList] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // 🔹 search state

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      imageTitle: "",
      category: "",
      image: null,
      gitUrl: "",
      serviceId: "",
    },
  });

  useEffect(() => {
    let mounted = true;
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/services`)
      .then((res) => {
        if (mounted) setServicesList(res.data || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (data) => {
    dispatch(showLoading());
    try {
      const formData = new FormData();
      formData.append("imageTitle", data.imageTitle);
      formData.append("category", data.category);
      if (data.gitUrl) formData.append("gitUrl", data.gitUrl);
      if (data.serviceId) formData.append("serviceId", data.serviceId);
      if (data.image && data.image[0]) formData.append("image", data.image[0]);

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/galleries`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      toast.success("Gallery item created successfully!");
      reset();
      setSearchTerm(""); // 🔹 reset search
    } catch (error) {
      toast.error(
        error?.message || "Failed to create gallery item. Please try again.",
      );
    } finally {
      dispatch(hideLoading());
    }
  };

  // 🔹 Filtered services based on searchTerm
  const filteredServices = servicesList.filter(
    (svc) =>
      svc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (svc.category || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (svc.subCategory || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 text-white bg-[#333333] max-w-[800px] mx-auto rounded-md mt-4">
      <h1 className="text-center text-3xl font-bold mb-4 font-roboto">
        Add New Gallery Item
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

        {/* 🔹 Searchable Linked Service */}
        <input
          type="text"
          placeholder="Search linked service..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 rounded bg-gray-600 mb-2"
        />

        <select
          {...register("serviceId")}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="">-- Linked Service (optional) --</option>
          {filteredServices.map((svc) => (
            <option key={svc._id} value={svc._id}>
              {svc.title} ({svc.subCategory || svc.category})
            </option>
          ))}
        </select>

        {/* Image */}
        <input
          {...register("image", { required: "Image is required" })}
          type="file"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.image && <p className="text-red-500">{errors.image.message}</p>}

        <button
          type="submit"
          className="w-full p-2 bg-primaryRgb rounded text-white"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddGallery;
