import axios from "axios";
import "easymde/dist/easymde.min.css";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import SimpleMDE from "react-simplemde-editor";
import { toast } from "sonner";
import { hideLoading, showLoading } from "../redux/loadingSlice";
const EditService = () => {
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

  const subCategoryOptions = {
    "programming-tech": [
      "website-development",
      "website-maintenance",
      "wordpress",
      "shopify",
      "custom-websites",
      "mobile-app-development",
      "cross-platform-apps",
      "android-app-development",
      "ios-app-development",
      "mobile-app-maintenance",
      "wix",
      "webflow",
      "ai-development",
      "ai-chatbot",
      "woocommerce",
      "support-it",
      "cloud-computing",
      "cyber-security",
      "convert-files",
    ],
    "graphics-design": [
      "logo-design",
      "brand-style-guides",
      "business-cards-stationary",
      "fonts-typography",
      "web-design",
      "app-design",
      "ux-design",
      "landing-page-design",
      "icon-design",
      "illustration",
      "children-book-illustration",
      "pattern-design",
      "cartoon-comics",
      "image-editing",
      "presentation-design",
      "infographic-design",
      "resume-design",
      "packaging-label-design",
      "book-design",
      "book-covers",
      "album-cover-design",
      "social-media-design",
      "thumbnail-design",
      "email-design",
      "web-banners",
      "t-shirt-marchandise",
      "fashion-design",
      "jewelry-design",
      "3d-architecture",
      "3d-industrial-design",
      "3d-fashion-garment",
      "3d-landscape-design",
      "3d-jewelry-design",
    ],
    "digital-marketing": [
      "search-engine-optimization",
      "search-engine-marketing",
      "local-seo",
      "ecommerce-seo",
      "video-seo",
      "social-media-marketing",
      "paid-social-media",
      "social-commerce",
      "influencer-marketing",
      "community-management",
      "video-marketing",
      "ecommerce-marketing",
      "affiliate-marketing",
      "display-advertising",
      "marketing-strategy",
      "marketing-advice",
      "web-analytics",
    ],
    "video-animation": [
      "video-editing",
      "visual-effect",
      "intro-outro-videos",
      "video-templates-editing",
      "subtitle-captions",
      "2d-animation",
      "3d-animation",
      "character-animation",
      "whiteboard-animation",
      "explainer-videos",
      "animated-logos",
      "lottie-web-animation",
      "text-animation",
      "motion-tracking",
      "transition-effects",
      "video-commercials",
      "social-media-videos",
      "slideshow-videos",
      "explainer-video-production",
    ],
    business: [
      "market-research",
      "business-plan",
      "business-consulting",
      "software-management",
      "virtual-assistant",
      "ecommerce-management",
      "project-management",
      "sales",
      "lead-generation",
      "call-center-calling",
      "customer-care",
    ],
    "writing-translation": [
      "blog-writing",
      "copywriting",
      "website-content",
      "creative-writing",
      "speech-writing",
      "book-formatting",
      "book-ebook-writing",
      "beta-reading",
      "proofreading-editing",
      "translation",
      "transcription",
      "localization",
    ],
  };

  const simpleMdeOptions = useMemo(
    () => ({
      placeholder: "Write your description in Markdown...",
      spellChecker: false,
      status: false,
      autosave: {
        enabled: true,
        uniqueId: "service-desc",
        delay: 1000,
      },
      toolbar: [
        "bold",
        "italic",
        "heading",
        "|",
        "quote",
        "unordered-list",
        "ordered-list",
        "|",
        "link",
        "image",
        "|",
        "preview",
        "guide",
      ],
      minHeight: "200px",
      // ✅ Auto focus ঠিক রাখার জন্য
      autofocus: false,
    }),
    [],
  );
  // Fetch existing data
  useEffect(() => {
    const fetchServiceDetails = async () => {
      dispatch(showLoading());
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/services/single-service/${id}`,
          { withCredentials: true },
        );
        const service = response.data;

        Object.entries(service).forEach(([key, value]) => {
          setValue(key, value);
        });
      } catch (error) {
        toast.error("Failed to load service");
      } finally {
        dispatch(hideLoading());
      }
    };
    fetchServiceDetails();
  }, [id, dispatch, setValue]);

  // Submit edited data
  const onSubmit = async (data) => {
    dispatch(showLoading());
    try {
      const formData = new FormData();

      // 1️⃣ Text fields
      [
        "title",
        "category",
        "subCategory",
        "desc",
        "shortTitle",
        "shortDesc",
        "videoUrl",
      ].forEach((key) => formData.append(key, data[key] || ""));

      // 2️⃣ Cover image: append only if user selected a new file
      if (data.coverImage && data.coverImage.length > 0) {
        formData.append("coverImage", data.coverImage[0]); // File object
      }

      // 3️⃣ Other images: append only if user selected new files
      if (data.otherImages && data.otherImages.length > 0) {
        for (let i = 0; i < data.otherImages.length; i++) {
          formData.append("otherImages", data.otherImages[i]);
        }
      }

      // 4️⃣ Arrays
      formData.append("features", JSON.stringify(data.features || []));
      formData.append("packages", JSON.stringify(data.packages || []));

      // 5️⃣ Send request
      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/services/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      toast.success("Service updated successfully!");
      navigate("/admin/services");
    } catch (error) {
      toast.error("Failed to update service");
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="p-6 text-white bg-[#333333] max-w-[800px] mx-auto rounded-md mt-4">
      <h1 className="text-center text-3xl font-bold mb-4">Edit Service</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("title")}
          placeholder="Title"
          className="w-full p-2 rounded bg-gray-700"
        />
        <input
          {...register("videoUrl")}
          placeholder="Video URL (optional)"
          className="w-full p-2 rounded bg-gray-700"
        />
        <select
          {...register("category")}
          onChange={(e) => setValue("subCategory", "")}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="">Select Category</option>
          {Object.keys(subCategoryOptions).map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace("-", " ")}
            </option>
          ))}
        </select>
        <select
          {...register("subCategory")}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="">Select Subcategory</option>
          {watch("category") &&
            subCategoryOptions[watch("category")]?.map((sub) => (
              <option key={sub} value={sub}>
                {sub.replace("-", " ")}
              </option>
            ))}
        </select>

        <input
          {...register("coverImage")}
          type="file"
          className="w-full p-2 rounded bg-gray-700"
        />
        <input
          {...register("otherImages")}
          type="file"
          multiple
          className="w-full p-2 rounded bg-gray-700"
        />

        <input
          {...register("shortTitle")}
          placeholder="Short Title"
          className="w-full p-2 rounded bg-gray-700"
        />
        {["desc", "shortDesc"].map((field) => (
          <div key={field} className="mb-4">
            <label className="block font-bold mb-2">
              {field === "desc" ? "Service Description" : "Short Description"}{" "}
              (Markdown)
            </label>
            <SimpleMDE
              value={watch(field) || ""}
              onChange={(value) => setValue(field, value)}
              options={simpleMdeOptions}
            />
            {errors[field] && (
              <p className="text-red-500">{errors[field].message}</p>
            )}
          </div>
        ))}

        <div>
          <label className="block font-bold mb-2">Features</label>
          {watch("features")?.map((feature, index) => (
            <div key={index} className="mb-4">
              <label className="block mb-1">Feature {index + 1}</label>
              <SimpleMDE
                value={watch(`features.${index}`) || ""}
                onChange={(value) => setValue(`features.${index}`, value)}
                options={simpleMdeOptions}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block font-bold text-xl">Packages</label>
          {watch("packages")?.map((pkg, index) => (
            <div
              key={index}
              className="space-y-2 border p-4 rounded bg-gray-800 mb-4"
            >
              <h3 className="text-lg font-semibold">{pkg.name}</h3>

              {/* Package description Markdown */}
              <SimpleMDE
                value={watch(`packages.${index}.desc`) || ""}
                onChange={(value) => setValue(`packages.${index}.desc`, value)}
                options={simpleMdeOptions}
              />

              <input
                {...register(`packages.${index}.deliveryTime`)}
                type="number"
                placeholder="Delivery Time"
                className="w-full p-2 rounded bg-gray-700"
              />
              <input
                {...register(`packages.${index}.revisionNumber`)}
                type="number"
                placeholder="Revisions"
                className="w-full p-2 rounded bg-gray-700"
              />
              <input
                {...register(`packages.${index}.regularPrice`)}
                type="number"
                placeholder="Regular Price"
                className="w-full p-2 rounded bg-gray-700"
              />
              <input
                {...register(`packages.${index}.salePrice`)}
                type="number"
                placeholder="Sale Price"
                className="w-full p-2 rounded bg-gray-700"
              />
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-green-600 px-6 py-2 rounded hover:bg-green-700 transition"
        >
          Update Service
        </button>
      </form>
    </div>
  );
};

export default EditService;
