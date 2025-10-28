
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/loadingSlice";
import uploadImage from "../utils/uploadImage";

const AddGallery = () => {
  const dispatch = useDispatch();
  const [servicesList, setServicesList] = useState([]);

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

  // Fetch services for Linked Service selector (component-level)
  useEffect(() => {
    let mounted = true;
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/services`)
      .then((res) => {
        if (mounted) setServicesList(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch services for gallery selector", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmit = async (data) => {
    dispatch(showLoading());
    try {
      const imageUrl = await uploadImage(data.image[0]);

      if (!imageUrl) {
        throw new Error("Image upload failed");
      }

      const galleryData = {
        imageTitle: data.imageTitle,
        category: data.category,
        imageUrl,
        gitUrl: data.gitUrl || undefined,
        serviceId: data.serviceId ? data.serviceId : undefined,
      };

  // Fetch services for Linked Service selector
  useEffect(() => {
    let mounted = true;
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/services`)
      .then((res) => {
        if (mounted) setServicesList(res.data || []);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch services for gallery selector", err);
      });
    return () => {
      mounted = false;
    };
  }, []);

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/galleries`,
        galleryData,
        { withCredentials: true }
      );

      toast.success("Gallery item created successfully!");
      reset();
    } catch (error) {
      toast.error(error?.message || "Failed to create gallery item. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

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

        <input
          {...register("gitUrl")}
          placeholder="GitHub URL (optional)"
          className="w-full p-2 rounded bg-gray-700"
        />

        {/* Linked Service (optional) */}
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
