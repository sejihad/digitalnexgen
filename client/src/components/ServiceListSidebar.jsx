import { useState } from "react";
import "./ServiceListSidebar.css";

const ServiceListSidebar = ({
  setSelectedCategory,
  selectedCategory,
  selectedGroup,
  setSelectedGroup,
  setSelectedSubCategories,
  isOpen, // এটি মোবাইলের জন্য মেইন কন্ট্রোল
}) => {
  const [openCategory, setOpenCategory] = useState(selectedCategory);

  const categories = [
    {
      name: "Programming & Tech",
      value: "programming-tech",
      subcategories: [
        {
          name: "Website Development",
          value: "grp-website-development",
          children: [
            "website-development",
            "website-maintenance",
            "custom-websites",
            "ai-chatbot",
            "ai-development",
          ],
        },
        {
          name: "Mobile Apps",
          value: "grp-mobile-apps",
          children: [
            "mobile-app-development",
            "cross-platform-apps",
            "android-app-development",
            "ios-app-development",
            "mobile-app-maintenance",
          ],
        },
        {
          name: "Website Platform",
          value: "grp-website-platform",
          children: ["wix", "webflow", "wordpress", "shopify", "woocommerce"],
        },
        {
          name: "Support & Security",
          value: "grp-support-security",
          children: [
            "support-it",
            "cloud-computing",
            "cyber-security",
            "convert-files",
          ],
        },
      ],
    },
    {
      name: "Graphics  Design",
      value: "graphics-design",
      subcategories: [
        {
          name: "Logo & Brand Identity",
          value: "grp-logo-brand-identity",
          children: [
            "logo-design",
            "brand-style-guides",
            "business-cards-stationary",
            "fonts-typography",
          ],
        },
        {
          name: "Web & App Design",
          value: "grp-web-app-design",
          children: [
            "web-design",
            "app-design",
            "ux-design",
            "landing-page-design",
            "icon-design",
          ],
        },
        {
          name: "Art & Illustration",
          value: "grp-art-illustration",
          children: [
            "illustration",
            "children-book-illustration",
            "pattern-design",
            "cartoon-comics",
          ],
        },
        {
          name: "Visual Design",
          value: "grp-visual-design",
          children: [
            "image-editing",
            "presentation-design",
            "infographic-design",
            "resume-design",
          ],
        },
        {
          name: "Cover & Package Design",
          value: "grp-cover-package-design",
          children: [
            "packaging-label-design",
            "book-design",
            "book-covers",
            "album-cover-design",
          ],
        },
        {
          name: "Marketing Design",
          value: "grp-marketing-design",
          children: [
            "social-media-design",
            "thumbnail-design",
            "email-design",
            "web-banners",
          ],
        },
        {
          name: "Fashion & Marchandise",
          value: "grp-fashion-marchandise",
          children: ["t-shirt-marchandise", "fashion-design", "jewelry-design"],
        },
        {
          name: "3D Design",
          value: "grp-3d-design",
          children: [
            "3d-architecture",
            "3d-industrial-design",
            "3d-fashion-garment",
            "3d-landscape-design",
            "3d-jewelry-design",
          ],
        },
      ],
    },
    {
      name: "Digital Marketing",
      value: "digital-marketing",
      subcategories: [
        {
          name: "Search",
          value: "grp-search",
          children: [
            "search-engine-optimization",
            "search-engine-marketing",
            "local-seo",
            "ecommerce-seo",
            "video-seo",
          ],
        },
        {
          name: "Social",
          value: "grp-social",
          children: [
            "social-media-marketing",
            "paid-social-media",
            "social-commerce",
            "influencer-marketing",
            "community-management",
          ],
        },
        {
          name: "Methods & Technique",
          value: "grp-methods-technique",
          children: [
            "video-marketing",
            "ecommerce-marketing",
            "affiliate-marketing",
            "display-advertising",
          ],
        },
        {
          name: "Analytics & Strategy",
          value: "grp-analytics-strategy",
          children: ["marketing-strategy", "marketing-advice", "web-analytics"],
        },
      ],
    },
    {
      name: "Video & Animation",
      value: "video-animation",
      subcategories: [
        {
          name: "Editing & Post Production",
          value: "grp-editing-post-production",
          children: [
            "video-editing",
            "visual-effect",
            "intro-outro-videos",
            "video-templates-editing",
            "subtitle-captions",
          ],
        },
        {
          name: "Animation",
          value: "grp-animation",
          children: [
            "2d-animation",
            "3d-animation",
            "character-animation",
            "whiteboard-animation",
            "explainer-videos",
          ],
        },
        {
          name: "Motion Graphics",
          value: "grp-motion-graphics",
          children: [
            "animated-logos",
            "lottie-web-animation",
            "text-animation",
            "motion-tracking",
            "transition-effects",
          ],
        },
        {
          name: "Social & Marketing Videos",
          value: "grp-social-marketing-videos",
          children: [
            "video-commercials",
            "social-media-videos",
            "slideshow-videos",
            "explainer-video-production",
          ],
        },
      ],
    },
    {
      name: "Business",
      value: "business",
      subcategories: [
        {
          name: "Business Formation & Growth",
          value: "grp-business-formation-growth",
          children: [
            "market-research",
            "business-plan",
            "business-consulting",
            "software-management",
          ],
        },
        {
          name: "General Administrative",
          value: "grp-general-administrative",
          children: [
            "virtual-assistant",
            "ecommerce-management",
            "project-management",
          ],
        },
        {
          name: "Sales & Customer Support",
          value: "grp-sales-customer-support",
          children: [
            "sales",
            "lead-generation",
            "call-center-calling",
            "customer-care",
          ],
        },
      ],
    },
    {
      name: "Writing & Translation",
      value: "writing-translation",
      subcategories: [
        {
          name: "Content Writing",
          value: "grp-content-writing",
          children: [
            "blog-writing",
            "copywriting",
            "website-content",
            "creative-writing",
            "speech-writing",
          ],
        },
        {
          name: "Book & Ebook Publishing",
          value: "grp-book-ebook-publishing",
          children: [
            "book-formatting",
            "book-ebook-writing",
            "beta-reading",
            "proofreading-editing",
          ],
        },
        {
          name: "Translation & Transcription",
          value: "grp-translation-transcription",
          children: ["translation", "transcription", "localization"],
        },
      ],
    },
  ];

  const handleCategoryToggle = (categoryValue) => {
    // যদি একই ক্যাটাগরিতে ক্লিক হয় তবে বন্ধ হবে, নয়তো নতুনটা খুলবে
    setOpenCategory(openCategory === categoryValue ? null : categoryValue);
    setSelectedCategory(categoryValue);

    // ক্যাটাগরি চেঞ্জ হলে গ্রুপ এবং সাব-ক্যাটাগরি রিসেট
    setSelectedGroup(null);
    setSelectedSubCategories([]);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group.name);
    setSelectedSubCategories(group.children);
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-primaryText dark:text-white text-lg font-bold mb-4 font-roboto px-2">
        Categories
      </h3>

      <ul className="space-y-2 overflow-y-auto premium-scrollbar flex-1 pr-2">
        {categories.map((category) => (
          <li key={category.value} className="dark:text-[#ededed]">
            <div
              onClick={() => handleCategoryToggle(category.value)}
              className={`cursor-pointer text-sm p-3 rounded-lg font-openSans flex justify-between items-center transition-all duration-300 ${
                selectedCategory === category.value
                  ? "dark:bg-white/20 bg-gray-100 border-l-4 border-pink-500 font-semibold"
                  : "bg-transparent hover:bg-white/10"
              }`}
            >
              <span>{category.name}</span>
              <span className="text-[10px] opacity-70">
                {openCategory === category.value ? "▲" : "▼"}
              </span>
            </div>

            {/* Sub-categories (Groups) */}
            {openCategory === category.value && category.subcategories && (
              <ul className="ml-4 mt-1 border-l border-white/10 space-y-1">
                {category.subcategories.map((group) => (
                  <li
                    key={group.value}
                    onClick={() => handleGroupSelect(group)}
                    className={`cursor-pointer text-xs p-2.5 ml-2 rounded-md transition-all ${
                      selectedGroup === group.name
                        ? "text-pink-500 font-bold bg-pink-500/10"
                        : "hover:text-green-400"
                    }`}
                  >
                    • {group.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceListSidebar;
