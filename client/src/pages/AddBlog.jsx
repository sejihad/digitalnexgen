import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/loadingSlice";
import uploadImage from "../utils/uploadImage";

const AddBlog = () => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      images: [],
    },
  });

  const onSubmit = async (data) => {
    dispatch(showLoading());
    try {
      // Upload images
      const imageUrls = await Promise.all(
        Array.from(data.images).map(uploadImage)
      );

      const blogData = {
        ...data,
        images: imageUrls.filter(Boolean),
      };

      // Send blog data to the server
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/blogs`,
        blogData,
        { withCredentials: true }
      );

      toast.success("Blog created successfully!");
      reset();
    } catch (error) {
      toast.error("Failed to create blog. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="p-6 text-white bg-[#333333] max-w-[800px] mx-auto rounded-md mt-4">
      <h1 className="text-center text-3xl font-bold mb-4 font-roboto">Add New Blog</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <input
          {...register("title", { required: "Blog Title is required" })}
          placeholder="Blog Title"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}

        {/* Description */}
        <textarea
          {...register("description", {
            required: "Description is required",
          })}
          placeholder="Blog Description"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.description && (
          <p className="text-red-500">{errors.description.message}</p>
        )}

        {/* Images */}
        <input
          {...register("images", { required: "At least one image is required" })}
          type="file"
          multiple
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.images && (
          <p className="text-red-500">{errors.images.message}</p>
        )}

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

export default AddBlog;
