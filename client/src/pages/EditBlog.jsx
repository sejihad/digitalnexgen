import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { showLoading, hideLoading } from "../redux/loadingSlice";
import { useDispatch } from "react-redux";
import uploadImage from "../utils/uploadImage";

const EditBlog = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchBlogDetails = async () => {
      dispatch(showLoading());
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/blogs/${id}`,
          { withCredentials: true }
        );
        const blog = response.data;

        Object.keys(blog).forEach((key) => {
          setValue(key, blog[key]);
        });
      } catch (error) {
        toast.error("Failed to fetch blog details.");
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchBlogDetails();
  }, [id, dispatch, setValue]);

  const onSubmit = async (data) => {
    dispatch(showLoading());
    try {
      const imageUrls = data.images
        ? await Promise.all(Array.from(data.images).map(uploadImage))
        : [];

      const updatedData = {
        ...data,
        images: imageUrls.length ? imageUrls : data.images,
      };

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/blogs/${id}`,
        updatedData,
        { withCredentials: true }
      );

      toast.success("Blog updated successfully!");
      navigate("/admin/blogs");
    } catch (error) {
      toast.error("Failed to update blog. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="p-6 text-white bg-[#333333] max-w-[800px] mx-auto rounded-md mt-4">
      <h1 className="text-center text-3xl font-bold mb-4 font-roboto">
        Edit Blog
      </h1>
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
          {...register("images")}
          type="file"
          multiple
          className="w-full p-2 rounded bg-gray-700"
        />

        <button
          type="submit"
          className="w-full p-2 bg-primaryRgb rounded text-white"
        >
          Update
        </button>
      </form>
    </div>
  );
};

export default EditBlog;
