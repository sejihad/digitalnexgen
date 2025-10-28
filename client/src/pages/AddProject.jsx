
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import axios from "axios";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../redux/loadingSlice";
import uploadImage from "../utils/uploadImage";

const AddProject = () => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState("");

  // Category → Subcategory mapping (all lowercase, dash-separated)
  const subCategoryOptions = {
  "programming-tech": ["website-development", "mobile-apps", "website-platform", "support-security"],
  "graphics-design": ["logo-brand-identity", "web-app-design", "art-illustration", "visual-design", "cover-package-design", "marketing-design", "fashion-merchandise", "3d-design"],
  "digital-marketing": ["search", "social", "methods-technique", "analytics-strategy"],
  "video-animation": ["editing-post-production", "animation", "motion-graphics", "video-editing", "social-marketing-videos"],
  "business": ["business-formation-growth", "general-administrative", "sales-customer-supports"],
  "writing-translation": ["content-writing", "book-ebook-publishing", "translation-transcription"]
}

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
      category: "",
      subCategory: "",
      client: "",
      tags: "",
      technologies: "",
    },
  });

  const onSubmit = async (data) => {
    dispatch(showLoading());
    try {
      // Upload images
      const imageUrls = await Promise.all(Array.from(data.images).map(uploadImage));

      const projectData = {
        ...data,
        images: imageUrls.filter(Boolean),
      };

      // Normalize comma-separated inputs into arrays for tags & technologies
      if (typeof data.tags === "string") {
        projectData.tags = data.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (typeof data.technologies === "string") {
        projectData.technologies = data.technologies
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }

      // client may be optional string
      if (data.client) projectData.client = data.client;

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/projects`,
        projectData,
        { withCredentials: true }
      );

      toast.success("Project created successfully!");
      reset();
      setSelectedCategory(""); // reset category
    } catch (error) {
      toast.error("Failed to create project. Please try again.");
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="p-6 text-white bg-[#333333] max-w-[800px] mx-auto rounded-md mt-4">
      <h1 className="text-center text-3xl font-bold mb-4 font-roboto">Add New Project</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <input
          {...register("title", { required: "Project Title is required" })}
          placeholder="Project Title"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}

        {/* Description */}
        <textarea
          {...register("description", { required: "Description is required" })}
          placeholder="Project Description"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.description && <p className="text-red-500">{errors.description.message}</p>}

        {/* Category */}
        <select
          {...register("category", { required: "Category is required" })}
          className="w-full p-2 rounded bg-gray-700"
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          {Object.keys(subCategoryOptions).map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace("-", " ")}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-red-500">{errors.category.message}</p>}

        {/* SubCategory */}
        <select
          {...register("subCategory", { required: "Subcategory is required" })}
          className="w-full p-2 rounded bg-gray-700"
          disabled={!selectedCategory}
        >
          <option value="">Select Subcategory</option>
          {selectedCategory &&
            subCategoryOptions[selectedCategory].map((sub) => (
              <option key={sub} value={sub}>
                {sub.replace("-", " ")}
              </option>
            ))}
        </select>
        {errors.subCategory && <p className="text-red-500">{errors.subCategory.message}</p>}
        {/* Client */}
        <input
          {...register("client")}
          placeholder="Client (optional)"
          className="w-full p-2 rounded bg-gray-700"
        />

        {/* Tags (comma separated) */}
        <input
          {...register("tags")}
          placeholder="Tags (comma separated, optional)"
          className="w-full p-2 rounded bg-gray-700"
        />

        {/* Technologies (comma separated) */}
        <input
          {...register("technologies")}
          placeholder="Technologies (comma separated, optional)"
          className="w-full p-2 rounded bg-gray-700"
        />
{/* URL */}
<input
  {...register("url")}
  placeholder="Project Website URL (optional)"
  className="w-full p-2 rounded bg-gray-700"
/>

{/* Video URL */}
<input
  {...register("videoUrl")}
  placeholder="YouTube Video URL (optional)"
  className="w-full p-2 rounded bg-gray-700"
/>
        {/* Images */}
        <input
          {...register("images", { required: "At least one image is required" })}
          type="file"
          multiple
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.images && <p className="text-red-500">{errors.images.message}</p>}

        <button type="submit" className="w-full p-2 bg-primaryRgb rounded text-white">
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddProject;
