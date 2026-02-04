import axios from "axios";
import "easymde/dist/easymde.min.css";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import SimpleMDE from "react-simplemde-editor";
import { toast } from "sonner";
import { hideLoading, showLoading } from "../redux/loadingSlice";
const AddService = () => {
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      category: "",
      subCategory: "",
      videoUrl: "",
      coverImage: null,
      otherImages: [],
      desc: "",
      shortTitle: "",
      shortDesc: "",
      features: ["", "", "", ""],
      packages: [
        {
          name: "Basic",
          desc: "",
          deliveryTime: 1,
          revisionNumber: 1,
          regularPrice: 0,
          salePrice: 0,
        },
        {
          name: "Standard",
          desc: "",
          deliveryTime: 1,
          revisionNumber: 1,
          regularPrice: 0,
          salePrice: 0,
        },
        {
          name: "Premium",
          desc: "",
          deliveryTime: 1,
          revisionNumber: 1,
          regularPrice: 0,
          salePrice: 0,
        },
      ],
    },
  });
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

  const onSubmit = async (data) => {
    dispatch(showLoading());
    try {
      const formData = new FormData();

      // text fields
      [
        "title",
        "category",
        "subCategory",
        "desc",
        "shortTitle",
        "shortDesc",
        "videoUrl",
      ].forEach((key) => formData.append(key, data[key] || ""));

      // cover image
      if (!data.coverImage || data.coverImage.length === 0) {
        toast.error("Cover image is required");
        dispatch(hideLoading());
        return;
      }

      formData.append("coverImage", data.coverImage[0]);

      // unlimited images
      if (data.otherImages && data.otherImages.length > 0) {
        for (let i = 0; i < data.otherImages.length; i++) {
          formData.append("otherImages", data.otherImages[i]);
        }
      }

      // arrays
      formData.append("features", JSON.stringify(data.features));
      formData.append("packages", JSON.stringify(data.packages));

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/services`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      toast.success("Service created successfully!");
      reset();
    } catch (err) {
      toast.error("Failed to create service");
    } finally {
      dispatch(hideLoading());
    }
  };

  return (
    <div className="p-6 text-white bg-[#333333] max-w-[800px] mx-auto rounded-md mt-4">
      <h1 className="text-center text-3xl font-bold mb-4 font-roboto">
        Add New Service
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          {...register("title", { required: "Service Title is required" })}
          placeholder="Service Title"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.title && <p className="text-red-500">{errors.title.message}</p>}
        <input
          {...register("videoUrl")}
          placeholder="Video URL (optional)"
          className="w-full p-2 rounded bg-gray-700"
        />
        <select
          {...register("category", { required: "Category is required" })}
          onChange={(e) => {
            setValue("category", e.target.value);
            setValue("subCategory", "");
          }}
          className="w-full p-2 rounded bg-gray-700"
        >
          <option value="">Select Category</option>
          {Object.keys(subCategoryOptions).map((category) => (
            <option key={category} value={category}>
              {category.replace("-", " ")}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500">{errors.category.message}</p>
        )}

        <select
          {...register("subCategory", { required: "Subcategory is required" })}
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
        {errors.subCategory && (
          <p className="text-red-500">{errors.subCategory.message}</p>
        )}

        <input
          {...register("coverImage", {
            validate: (files) =>
              (files && files.length > 0) || "Cover image is required",
          })}
          type="file"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.coverImage && (
          <p className="text-red-500">{errors.coverImage.message}</p>
        )}

        <input
          {...register("otherImages")}
          type="file"
          multiple
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
        <input
          {...register("shortTitle", { required: "Short Title is required" })}
          placeholder="Short Title"
          className="w-full p-2 rounded bg-gray-700"
        />
        {errors.shortTitle && (
          <p className="text-red-500">{errors.shortTitle.message}</p>
        )}

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
          <label className="block font-bold mb-2 text-2xl">Packages</label>
          {watch("packages")?.map((pkg, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-xl font-semibold mb-2">{pkg.name}</h3>

              {/* Package description Markdown */}
              <SimpleMDE
                value={watch(`packages.${index}.desc`) || ""}
                onChange={(value) => setValue(`packages.${index}.desc`, value)}
                options={simpleMdeOptions}
              />

              <div>
                <label className="block font-medium text-sm">
                  Delivery Time (days)
                </label>
                <input
                  {...register(`packages.${index}.deliveryTime`, {
                    required: "Delivery Time is required",
                  })}
                  type="number"
                  placeholder={`${pkg.name} Delivery Time`}
                  className="w-full p-2 rounded bg-gray-700"
                />
              </div>

              <div>
                <label className="block font-medium text-sm">Revisions</label>
                <input
                  {...register(`packages.${index}.revisionNumber`, {
                    required: "Revision Number is required",
                  })}
                  type="number"
                  placeholder={`${pkg.name} Revisions`}
                  className="w-full p-2 rounded bg-gray-700"
                />
              </div>

              <div>
                <label className="block font-medium text-sm">
                  Regular Price
                </label>
                <input
                  {...register(`packages.${index}.regularPrice`, {
                    required: "Regular Price is required",
                    min: { value: 1, message: "Price must be greater than 0" },
                  })}
                  type="number"
                  placeholder={`${pkg.name} Regular Price`}
                  className="w-full p-2 rounded bg-gray-700"
                />
                {errors.packages?.[index]?.regularPrice && (
                  <p className="text-red-500">
                    {errors.packages[index].regularPrice.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-medium text-sm">Sale Price</label>
                <input
                  {...register(`packages.${index}.salePrice`, {
                    min: {
                      value: 0,
                      message: "Sale Price must not be negative",
                    },
                    validate: (value) =>
                      value <= watch(`packages.${index}.regularPrice`) ||
                      "Sale Price cannot be greater than Regular Price",
                  })}
                  type="number"
                  placeholder={`${pkg.name} Sale Price`}
                  className="w-full p-2 rounded bg-gray-700"
                />
                {errors.packages?.[index]?.salePrice && (
                  <p className="text-red-500">
                    {errors.packages[index].salePrice.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

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

export default AddService;
