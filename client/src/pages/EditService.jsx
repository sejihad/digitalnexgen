import axios from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { hideLoading, showLoading } from "../redux/loadingSlice";
import uploadImage from "../utils/uploadImage";

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
      "godaddy",
      "squarespace",
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

  // Fetch existing data
  useEffect(() => {
    const fetchServiceDetails = async () => {
      dispatch(showLoading());
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/services/single-service/${id}`,
          { withCredentials: true }
        );
        const service = response.data;

        Object.entries(service).forEach(([key, value]) => {
          setValue(key, value);
        });
      } catch (error) {
        console.error("Error loading service:", error);
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
      let coverImageUrl = data.coverImage;
      if (data.coverImage instanceof FileList && data.coverImage.length > 0) {
        coverImageUrl = await uploadImage(data.coverImage[0]);
      }

      let otherImageUrls = data.otherImages;
      if (data.otherImages instanceof FileList && data.otherImages.length > 0) {
        otherImageUrls = await Promise.all(
          Array.from(data.otherImages).map((file) => uploadImage(file))
        );
      }

      const updatedData = {
        ...data,
        coverImage: coverImageUrl,
        otherImages: otherImageUrls,
      };

      await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/services/${id}`,
        updatedData,
        { withCredentials: true }
      );

      toast.success("Service updated successfully!");
      navigate("/admin/services");
    } catch (error) {
      console.error("Update failed:", error);
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

        <textarea
          {...register("desc")}
          placeholder="Description"
          className="w-full p-2 rounded bg-gray-700"
        />
        <input
          {...register("shortTitle")}
          placeholder="Short Title"
          className="w-full p-2 rounded bg-gray-700"
        />
        <textarea
          {...register("shortDesc")}
          placeholder="Short Description"
          className="w-full p-2 rounded bg-gray-700"
        />

        <div>
          <label className="block font-bold mb-2">Features</label>
          {watch("features")?.map((feature, index) => (
            <input
              key={index}
              {...register(`features.${index}`)}
              placeholder={`Feature ${index + 1}`}
              className="w-full p-2 mb-2 rounded bg-gray-700"
            />
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
              <textarea
                {...register(`packages.${index}.desc`)}
                placeholder="Description"
                className="w-full p-2 rounded bg-gray-700"
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
