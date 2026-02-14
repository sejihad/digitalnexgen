import { useState } from "react";
import "./ServiceListSidebar.css";
const ServiceListSidebar = ({
  setSelectedCategory,
  selectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  isOpen,
}) => {
  const [openCategory, setOpenCategory] = useState(null);

  const categories = [
    {
      name: "Programming & Tech",
      value: "programming-tech",
      subcategories: [
        { name: "Website Development", value: "website-development" },
        { name: "Website Maintenance", value: "website-maintenance" },
        { name: "WordPress", value: "wordpress" },
        { name: "Shopify", value: "shopify" },
        { name: "Custom Websites", value: "custom-websites" },
        { name: "Mobile App Development", value: "mobile-app-development" },
        { name: "Cross Platform Apps", value: "cross-platform-apps" },
        { name: "Android App Development", value: "android-app-development" },
        { name: "iOS App Development", value: "ios-app-development" },
        { name: "Mobile App Maintenance", value: "mobile-app-maintenance" },
        { name: "Wix", value: "wix" },
        { name: "Webflow", value: "webflow" },
        { name: "GoDaddy", value: "godaddy" },
        { name: "Squarespace", value: "squarespace" },
        { name: "WooCommerce", value: "woocommerce" },
        { name: "Support & IT", value: "support-it" },
        { name: "Cloud Computing", value: "cloud-computing" },
        { name: "Cyber Security", value: "cyber-security" },
        { name: "Convert Files", value: "convert-files" },
      ],
    },
    {
      name: "Graphics & Design",
      value: "graphics-design",
      subcategories: [
        { name: "Logo Design", value: "logo-design" },
        { name: "Brand Style Guides", value: "brand-style-guides" },
        {
          name: "Business Cards & Stationary",
          value: "business-cards-stationary",
        },
        { name: "Fonts & Typography", value: "fonts-typography" },
        { name: "Web Design", value: "web-design" },
        { name: "App Design", value: "app-design" },
        { name: "UX Design", value: "ux-design" },
        { name: "Landing Page Design", value: "landing-page-design" },
        { name: "Icon Design", value: "icon-design" },
        { name: "Illustration", value: "illustration" },
        {
          name: "Children Book Illustration",
          value: "children-book-illustration",
        },
        { name: "Pattern Design", value: "pattern-design" },
        { name: "Cartoon & Comics", value: "cartoon-comics" },
        { name: "Image Editing", value: "image-editing" },
        { name: "Presentation Design", value: "presentation-design" },
        { name: "Infographic Design", value: "infographic-design" },
        { name: "Resume Design", value: "resume-design" },
        { name: "Packaging & Label Design", value: "packaging-label-design" },
        { name: "Book Design", value: "book-design" },
        { name: "Book Covers", value: "book-covers" },
        { name: "Album Cover Design", value: "album-cover-design" },
        { name: "Social Media Design", value: "social-media-design" },
        { name: "Thumbnail Design", value: "thumbnail-design" },
        { name: "Email Design", value: "email-design" },
        { name: "Web Banners", value: "web-banners" },
        { name: "T-Shirt & Marchandise", value: "t-shirt-marchandise" },
        { name: "Fashion Design", value: "fashion-design" },
        { name: "Jewelry Design", value: "jewelry-design" },
        { name: "3D Architecture", value: "3d-architecture" },
        { name: "3D Industrial Design", value: "3d-industrial-design" },
        { name: "3D Fashion & Garment", value: "3d-fashion-garment" },
        { name: "3D Landscape Design", value: "3d-landscape-design" },
        { name: "3D Jewelry Design", value: "3d-jewelry-design" },
      ],
    },
    {
      name: "Digital Marketing",
      value: "digital-marketing",
      subcategories: [
        {
          name: "Search Engine Optimization",
          value: "search-engine-optimization",
        },
        { name: "Search Engine Marketing", value: "search-engine-marketing" },
        { name: "Local SEO", value: "local-seo" },
        { name: "Ecommerce SEO", value: "ecommerce-seo" },
        { name: "Video SEO", value: "video-seo" },
        { name: "Social Media Marketing", value: "social-media-marketing" },
        { name: "Paid Social Media", value: "paid-social-media" },
        { name: "Social Commerce", value: "social-commerce" },
        { name: "Influencer Marketing", value: "influencer-marketing" },
        { name: "Community Management", value: "community-management" },
        { name: "Video Marketing", value: "video-marketing" },
        { name: "Ecommerce Marketing", value: "ecommerce-marketing" },
        { name: "Affiliate Marketing", value: "affiliate-marketing" },
        { name: "Display Advertising", value: "display-advertising" },
        { name: "Marketing Strategy", value: "marketing-strategy" },
        { name: "Marketing Advice", value: "marketing-advice" },
        { name: "Web Analytics", value: "web-analytics" },
      ],
    },
    {
      name: "Video & Animation",
      value: "video-animation",
      subcategories: [
        { name: "Video Editing", value: "video-editing" },
        { name: "Visual Effect", value: "visual-effect" },
        { name: "Intro & Outro Videos", value: "intro-outro-videos" },
        { name: "Video Templates Editing", value: "video-templates-editing" },
        { name: "Subtitles & Captions", value: "subtitle-captions" },
        { name: "2D Animation", value: "2d-animation" },
        { name: "3D Animation", value: "3d-animation" },
        { name: "Character Animation", value: "character-animation" },
        { name: "Whiteboard Animation", value: "whiteboard-animation" },
        { name: "Explainer Videos", value: "explainer-videos" },
        { name: "Animated Logos", value: "animated-logos" },
        { name: "Lottie Web Animation", value: "lottie-web-animation" },
        { name: "Text Animation", value: "text-animation" },
        { name: "Motion Tracking", value: "motion-tracking" },
        { name: "Transition Effects", value: "transition-effects" },
        { name: "Video Commercials", value: "video-commercials" },
        { name: "Social Media Videos", value: "social-media-videos" },
        { name: "Slideshow Videos", value: "slideshow-videos" },
        {
          name: "Explainer Video Production",
          value: "explainer-video-production",
        },
      ],
    },
    {
      name: "Business",
      value: "business",
      subcategories: [
        { name: "Market Research", value: "market-research" },
        { name: "Business Plan", value: "business-plan" },
        { name: "Business Consulting", value: "business-consulting" },
        { name: "Software Management", value: "software-management" },
        { name: "Virtual Assistant", value: "virtual-assistant" },
        { name: "Ecommerce Management", value: "ecommerce-management" },
        { name: "Project Management", value: "project-management" },
        { name: "Sales", value: "sales" },
        { name: "Lead Generation", value: "lead-generation" },
        { name: "Call Center & Calling", value: "call-center-calling" },
        { name: "Customer Care", value: "customer-care" },
      ],
    },
    {
      name: "Writing & Translation",
      value: "writing-translation",
      subcategories: [
        { name: "Blog Writing", value: "blog-writing" },
        { name: "Copywriting", value: "copywriting" },
        { name: "Website Content", value: "website-content" },
        { name: "Creative Writing", value: "creative-writing" },
        { name: "Speech Writing", value: "speech-writing" },
        { name: "Book Formatting", value: "book-formatting" },
        { name: "Book & Ebook Writing", value: "book-ebook-writing" },
        { name: "Beta Reading", value: "beta-reading" },
        { name: "Proofreading & Editing", value: "proofreading-editing" },
        { name: "Translation", value: "translation" },
        { name: "Transcription", value: "transcription" },
        { name: "Localization", value: "localization" },
      ],
    },
  ];

  const handleCategoryToggle = (categoryValue) => {
    setOpenCategory(openCategory === categoryValue ? null : categoryValue);
    setSelectedCategory(categoryValue);
    setSelectedSubCategory(null); // category change হলে sub reset
  };

  const handleSubSelect = (subcategoryValue) => {
    setSelectedSubCategory(subcategoryValue);
    // setOpenCategory(null); // চাইলে close করবেন, না চাইলে comment রাখুন
  };

  return (
    <aside
      className={`fixed z-40 md:static ${
        isOpen ? "translate-x-0" : "-translate-x-[150%]"
      } top-24 left-0 md:top-auto md:left-auto h-[max-content] mt-8 ml-8 w-64 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0 `}
    >
      <h3 className="text-primaryText dark:text-white text-lg font-bold mb-4 font-roboto">
        Categories
      </h3>

      <ul className="space-y-4 max-h-screen overflow-y-scroll premium-scrollbar">
        {categories.map((category) => (
          <li key={category.value} className="dark:text-[#ededed]">
            <div
              onClick={() => handleCategoryToggle(category.value)}
              className={`cursor-pointer text-sm lg:text-base p-2 rounded-lg font-openSans flex justify-between items-center transition-all duration-300 ${
                selectedCategory === category.value
                  ? "dark:bg-white/30 bg-white border font-semibold"
                  : "bg-transparent hover:bg-white/30"
              }`}
            >
              <span>{category.name}</span>
              <span className="text-xs opacity-70">
                {openCategory === category.value ? "▲" : "▼"}
              </span>
            </div>

            {openCategory === category.value && category.subcategories && (
              <ul className="ml-4 mt-2 space-y-2">
                {category.subcategories.map((sub) => (
                  <li
                    key={sub.value}
                    onClick={() => handleSubSelect(sub.value)}
                    className={`cursor-pointer text-sm p-2 rounded-md font-openSans transition-all duration-300 ${
                      selectedSubCategory === sub.value
                        ? "bg-pink-500/40"
                        : "hover:bg-white/30"
                    }`}
                  >
                    {sub.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default ServiceListSidebar;
