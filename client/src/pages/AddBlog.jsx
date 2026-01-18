import axios from "axios";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { hideLoading, showLoading } from "../redux/loadingSlice";

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
      const formData = new FormData();

      // text fields
      formData.append("title", data.title);
      formData.append("description", data.description);

      // images (multiple files)
      if (data.images && data.images.length > 0) {
        for (let i = 0; i < data.images.length; i++) {
          formData.append("images", data.images[i]); // 👈 file
        }
      }

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/blogs`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
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
      <h1 className="text-center text-3xl font-bold mb-4 font-roboto">
        Add New Blog
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
          {...register("images", {
            required: "At least one image is required",
          })}
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
