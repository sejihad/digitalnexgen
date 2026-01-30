import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { hideLoading, showLoading } from "../redux/loadingSlice";

const subCategoryOptions = {
  "programming-tech": [
    "website-development",
    "mobile-apps",
    "website-platform",
    "support-security",
  ],
  "graphics-design": [
    "logo-brand-identity",
    "web-app-design",
    "art-illustration",
    "visual-design",
    "cover-package-design",
    "marketing-design",
    "fashion-merchandise",
    "3d-design",
  ],
  "digital-marketing": [
    "search",
    "social",
    "methods-technique",
    "analytics-strategy",
  ],
  "video-animation": [
    "editing-post-production",
    "animation",
    "motion-graphics",
    "video-editing",
    "social-marketing-videos",
  ],
  business: [
    "business-formation-growth",
    "general-administrative",
    "sales-customer-supports",
  ],
  "writing-translation": [
    "content-writing",
    "book-ebook-publishing",
    "translation-transcription",
  ],
};

const humanize = (str = "") =>
  str
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

export default function EditProject() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [existingImages, setExistingImages] = useState([]); // URLs from DB
  const [newFiles, setNewFiles] = useState([]); // File objects
  const [newPreviews, setNewPreviews] = useState([]); // preview URLs

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "",
      subCategory: "",
      url: "",
      videoUrl: "",
      client: "",
      tags: "",
      technologies: "",
    },
  });

  const watchedCategory = watch("category");

  // fetch project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      dispatch(showLoading());
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/projects/${id}`,
          { withCredentials: true },
        );
        const project = res.data || {};

        reset({
          title: project.title ?? "",
          description: project.description ?? "",
          category: project.category ?? "",
          subCategory: project.subCategory ?? "",
          url: project.url ?? "",
          videoUrl: project.videoUrl ?? "",
          client: project.client ?? "",
          tags: Array.isArray(project.tags)
            ? project.tags.join(", ")
            : (project.tags ?? ""),
          technologies: Array.isArray(project.technologies)
            ? project.technologies.join(", ")
            : (project.technologies ?? ""),
        });

        setExistingImages(Array.isArray(project.images) ? project.images : []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch project details.");
      } finally {
        dispatch(hideLoading());
      }
    };

    fetchProjectDetails();
  }, [id, dispatch, reset]);

  // cleanup object URLs
  useEffect(() => {
    return () => {
      newPreviews.forEach((p) => URL.revokeObjectURL(p));
    };
  }, [newPreviews]);

  // when user selects new files
  const handleNewFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((f) => URL.createObjectURL(f));

    setNewFiles((prev) => [...prev, ...files]);
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const removeExistingImage = (idx) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewFile = (idx) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data) => {
    dispatch(showLoading());
    try {
      const formData = new FormData();

      // text fields
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("subCategory", data.subCategory);
      if (data.url) formData.append("url", data.url);
      if (data.videoUrl) formData.append("videoUrl", data.videoUrl);
      if (data.client) formData.append("client", data.client);
      if (data.tags) formData.append("tags", data.tags);
      if (data.technologies) formData.append("technologies", data.technologies);

      // 🧠 existing images (JSON হিসেবে)
      formData.append("existingImages", JSON.stringify(existingImages));

      // 🔥 new image files
      newFiles.forEach((file) => {
        formData.append("images", file);
      });

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/projects/${id}`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      toast.success("Project updated successfully!");
      navigate("/admin/projects");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update project.");
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="p-6 text-white bg-[#333333] max-w-[900px] mx-auto rounded-md mt-4">
      <h1 className="text-center text-3xl font-bold mb-4">Edit Project</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <input
          {...register("title", { required: true })}
          placeholder="Title"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.title && <p className="text-red-500">Title is required</p>}

        {/* Description */}
        <textarea
          {...register("description", { required: true })}
          placeholder="Description"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.description && (
          <p className="text-red-500">Description is required</p>
        )}

        {/* Category */}
        <select
          {...register("category", { required: true })}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="">Select Category</option>
          {Object.keys(subCategoryOptions).map((cat) => (
            <option key={cat} value={cat}>
              {humanize(cat)}
            </option>
          ))}
        </select>

        {/* SubCategory */}
        <select
          {...register("subCategory", { required: true })}
          className="w-full p-2 rounded bg-gray-700"
          disabled={!watchedCategory}
        >
          <option value="">Select Subcategory</option>
          {watchedCategory &&
            subCategoryOptions[watchedCategory]?.map((sub) => (
              <option key={sub} value={sub}>
                {humanize(sub)}
              </option>
            ))}
        </select>

        {/* URLs */}
        <input
          {...register("url")}
          placeholder="Project URL"
          className="w-full p-2 rounded bg-gray-700"
        />
        <input
          {...register("videoUrl")}
          placeholder="YouTube URL"
          className="w-full p-2 rounded bg-gray-700"
        />

        {/* Client */}
        <input
          {...register("client")}
          placeholder="Client (optional)"
          className="w-full p-2 rounded bg-gray-700"
        />

        {/* Tags & Technologies (comma-separated) */}
        <input
          {...register("tags")}
          placeholder="Tags (comma-separated)"
          className="w-full p-2 rounded bg-gray-700"
        />
        <small className="text-xs text-gray-400">
          Enter tags separated by commas (e.g. portfolio, react, tailwind)
        </small>

        <input
          {...register("technologies")}
          placeholder="Technologies (comma-separated)"
          className="w-full p-2 rounded bg-gray-700"
        />
        <small className="text-xs text-gray-400 mb-2 block">
          Enter technologies separated by commas (e.g. React, Node.js)
        </small>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <p className="mb-2">Existing Images:</p>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((url, i) => (
                <div key={i} className="relative">
                  <img
                    src={url.url}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Images */}
        <div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleNewFilesChange}
            className="w-full p-2 rounded bg-gray-700"
          />
          {newPreviews.length > 0 && (
            <div className="mt-2 flex gap-3 flex-wrap">
              {newPreviews.map((url, i) => (
                <div key={i} className="relative w-24 h-24">
                  <img
                    src={url}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewFile(i)}
                    className="absolute -top-2 -right-2 bg-red-600 rounded-full w-6 h-6 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" className="w-full p-2 bg-primaryRgb rounded">
          Update
        </button>
      </form>
    </div>
  );
}
