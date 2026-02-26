import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

import BusinessFormation from "../assets/Business/BusinessFormation.jpg";
import GeneralAdminstrative from "../assets/Business/GeneralAdminstrative.jpg";
import SalesCustomerCare from "../assets/Business/SalesCustomerCare.jpg";
import MethodTechnique from "../assets/DigitalMarketing/MethodTechnique.jpg";
import Search from "../assets/DigitalMarketing/Search.jpg";
import Social from "../assets/DigitalMarketing/Social.jpg";
import Strategy from "../assets/DigitalMarketing/Strategy.jpg";
import ArtIllustration from "../assets/GraphicsDesign/ArtIllustration.jpg";
import CoverPackageDesign from "../assets/GraphicsDesign/CoverPackageDesign.jpg";
import Design3d from "../assets/GraphicsDesign/Design3d.jpg";
import FashionDesign from "../assets/GraphicsDesign/FashionDesign.jpg";
import LogoBrand from "../assets/GraphicsDesign/LogoBrand.jpg";
import MarketingDesign from "../assets/GraphicsDesign/MarketingDesign.jpg";
import VisualDesign from "../assets/GraphicsDesign/VisualDesign.jpg";
import WebAppDesign from "../assets/GraphicsDesign/WebAppDesign.jpg";
import ApplicationDev from "../assets/ProgrammingTech/ApplicationDev.jpg";
import SupportSecurity from "../assets/ProgrammingTech/SupportSecurity.jpg";
import WebsiteDev from "../assets/ProgrammingTech/WebSiteDev.jpg";
import WebsitePlatform from "../assets/ProgrammingTech/WebsitePlatform.jpg";
import Animation from "../assets/VideoAnimation/Animation.jpg";
import EditingPostProduction from "../assets/VideoAnimation/EditingPostProduction.jpg";
import MotionGraphics from "../assets/VideoAnimation/MotionGraphics.jpg";
import SocialMarketingVideo from "../assets/VideoAnimation/SocialMarketingVideo.jpg";
import BookPublishing from "../assets/WritingTranslation/BookPublishing.jpg";
import ContentWriting from "../assets/WritingTranslation/ContentWriting.jpg";
import Translation from "../assets/WritingTranslation/Translation.jpg";

import CategoryCard from "../components/CategoryCard";
import Sidebar from "../components/Sidebar";

const categoriesData = {
  "programming-tech": [
    {
      image: WebsiteDev,
      title: "Website Development",
      links: [
        {
          label: "Website Development",
          url: "/programming-tech/website-development",
        },
        {
          label: "Website Maintenance",
          url: "/programming-tech/website-maintenance",
        },
        { label: "Custom Websites", url: "/programming-tech/custom-websites" },
        { label: "AI ChatBot", url: "/programming-tech/ai-chatbot" },
        { label: "AI Development", url: "/programming-tech/ai-development" },
      ],
    },
    {
      image: ApplicationDev,
      title: "Mobile Apps",
      links: [
        {
          label: "Mobile App Development",
          url: "/programming-tech/mobile-app-development",
        },
        {
          label: "Cross-platform Apps",
          url: "/programming-tech/cross-platform-apps",
        },
        {
          label: "Android App Development",
          url: "/programming-tech/android-app-development",
        },
        {
          label: "iOS App Development",
          url: "/programming-tech/ios-app-development",
        },
        {
          label: "Mobile App Maintenance",
          url: "/programming-tech/mobile-app-maintenance",
        },
      ],
    },
    {
      image: WebsitePlatform,
      title: "Website Platform",
      links: [
        { label: "Wix", url: "/programming-tech/wix" },
        { label: "Webflow", url: "/programming-tech/webflow" },
        { label: "Wordpress", url: "/programming-tech/wordpress" },
        { label: "Shopify", url: "/programming-tech/shopify" },
        { label: "WooCommerce", url: "/programming-tech/woocommerce" },
      ],
    },
    {
      image: SupportSecurity,
      title: "Support & Security",
      links: [
        { label: "Support & IT", url: "/programming-tech/support-it" },
        { label: "Cloud Computing", url: "/programming-tech/cloud-computing" },
        { label: "Cyber Security", url: "/programming-tech/cyber-security" },
        { label: "Convert Files", url: "/programming-tech/convert-files" },
      ],
    },
  ],
  "graphics-design": [
    {
      image: LogoBrand,
      title: "Logo & Brand Identity",
      links: [
        { label: "Logo Design", url: "/graphics-design/logo-design" },
        {
          label: "Brand Style Guides",
          url: "/graphics-design/brand-style-guides",
        },
        {
          label: "Business Cards Stationary",
          url: "/graphics-design/business-cards-stationary",
        },
        {
          label: "Fonts & Typography",
          url: "/graphics-design/fonts-typography",
        },
      ],
    },
    {
      image: WebAppDesign,
      title: "Web & App Design",
      links: [
        { label: "Web Design", url: "/graphics-design/web-design" },
        { label: "App Design", url: "/graphics-design/app-design" },
        { label: "UX Design", url: "/graphics-design/ux-design" },
        {
          label: "Landing Page Design",
          url: "/graphics-design/landing-page-design",
        },
        { label: "Icon Design", url: "/graphics-design/icon-design" },
      ],
    },
    {
      image: ArtIllustration,
      title: "Art & Illustration",
      links: [
        { label: "Illustration", url: "/graphics-design/illustration" },
        {
          label: "Children's Book Illustration",
          url: "/graphics-design/children-book-illustration",
        },
        { label: "Pattern Design", url: "/graphics-design/pattern-design" },
        { label: "Cartoon & Comics", url: "/graphics-design/cartoon-comics" },
      ],
    },
    {
      image: VisualDesign,
      title: "Visual Design",
      links: [
        { label: "Image Editing", url: "/graphics-design/image-editing" },
        {
          label: "Presentation Design",
          url: "/graphics-design/presentation-design",
        },
        {
          label: "Infographic Design",
          url: "/graphics-design/infographic-design",
        },
        { label: "Resume Design", url: "/graphics-design/resume-design" },
      ],
    },
    {
      image: CoverPackageDesign,
      title: "Cover & Package Design",
      links: [
        {
          label: "Packaging & Label Design",
          url: "/graphics-design/packaging-label-design",
        },
        { label: "Book Design", url: "/graphics-design/book-design" },
        { label: "Book Covers", url: "/graphics-design/book-covers" },
        {
          label: "Album Cover Design",
          url: "/graphics-design/album-cover-design",
        },
      ],
    },
    {
      image: MarketingDesign,
      title: "Marketing Design",
      links: [
        {
          label: "Social Media Design",
          url: "/graphics-design/social-media-design",
        },
        { label: "Thumbnail Design", url: "/graphics-design/thumbnail-design" },
        { label: "Email Design", url: "/graphics-design/email-design" },
        { label: "Web Banners", url: "/graphics-design/web-banners" },
      ],
    },
    {
      image: FashionDesign,
      title: "Fashion & Marchandise",
      links: [
        {
          label: "T-Shirt & Marchandise",
          url: "/graphics-design/t-shirt-marchandise",
        },
        { label: "Fashion Design", url: "/graphics-design/fashion-design" },
        { label: "Jewelry Design", url: "/graphics-design/jewelry-design" },
      ],
    },
    {
      image: Design3d,
      title: "3D Design",
      links: [
        { label: "3D Architecture", url: "/graphics-design/3d-architecture" },
        {
          label: "3D Industrial Design",
          url: "/graphics-design/3d-industrial-design",
        },
        {
          label: "3D Fashion & Garment",
          url: "/graphics-design/3d-fashion-garment",
        },
        {
          label: "3D Landscape Design",
          url: "/graphics-design/3d-landscape-design",
        },
        {
          label: "3D Jewelry Design",
          url: "/graphics-design/3d-jewelry-design",
        },
      ],
    },
  ],
  "digital-marketing": [
    {
      image: Search,
      title: "Search",
      links: [
        {
          label: "Search Engine Optimization (SEO)",
          url: "/digital-marketing/search-engine-optimization",
        },
        {
          label: "Search Engine Marketing (SEM)",
          url: "/digital-marketing/search-engine-marketing",
        },
        { label: "Local SEO", url: "/digital-marketing/local-seo" },
        { label: "Ecommerce SEO", url: "/digital-marketing/ecommerce-seo" },
        { label: "Video SEO", url: "/digital-marketing/video-seo" },
      ],
    },
    {
      image: Social,
      title: "Social",
      links: [
        {
          label: "Social Media Marketing",
          url: "/digital-marketing/social-media-marketing",
        },
        {
          label: "Paid Social Media)",
          url: "/digital-marketing/paid-social-media",
        },
        { label: "Social Commerce", url: "/digital-marketing/social-commerce" },
        {
          label: "Influencer Marketing",
          url: "/digital-marketing/influencer-marketing",
        },
        {
          label: "Community Management",
          url: "/digital-marketing/community-management",
        },
      ],
    },
    {
      image: MethodTechnique,
      title: "Methods & Technique",
      links: [
        { label: "Video Marketing", url: "/digital-marketing/video-marketing" },
        {
          label: "Ecommerce Marketing",
          url: "/digital-marketing/ecommerce-marketing",
        },
        {
          label: "Affiliate Marketing",
          url: "/digital-marketing/affiliate-marketing",
        },
        {
          label: "Display Advertising",
          url: "/digital-marketing/display-advertising",
        },
      ],
    },
    {
      image: Strategy,
      title: "Analytics Strategy",
      links: [
        {
          label: "Marketing Strategy",
          url: "/digital-marketing/marketing-strategy",
        },
        {
          label: "Marketing Advice",
          url: "/digital-marketing/marketing-advice",
        },
        { label: "Web Analytics", url: "/digital-marketing/web-analytics" },
      ],
    },
  ],
  "video-animation": [
    {
      image: EditingPostProduction,
      title: "Editing & Post Production",
      links: [
        { label: "Video Editing", url: "/video-animation/video-editing" },
        { label: "Visual Effect", url: "/video-animation/visual-effect" },
        {
          label: "Intro & Outro Videos",
          url: "/video-animation/intro-outro-videos",
        },
        {
          label: "Video Templates Editing",
          url: "/video-animation/video-templates-editing",
        },
        {
          label: "Subtitle & Captions",
          url: "/video-animation/subtitle-captions",
        },
      ],
    },
    {
      image: Animation,
      title: "Animation",
      links: [
        { label: "2D Animation", url: "/video-animation/2d-animation" },
        { label: "3D Animation", url: "/video-animation/3d-animation" },
        {
          label: "Character Animation",
          url: "/video-animation/character-animation",
        },
        {
          label: "Whiteboard Animation",
          url: "/video-animation/whiteboard-animation",
        },
        {
          label: "Explainer Videos",
          url: "/digital-marketing/explainer-videos",
        },
      ],
    },
    {
      image: MotionGraphics,
      title: "Motion Graphics",
      links: [
        { label: "Animated Logos", url: "/video-animation/animated-logos" },
        {
          label: "Lottie & Web Animation",
          url: "/video-animation/lottie-web-animation",
        },
        { label: "Text Animation", url: "/video-animation/text-animation" },
        { label: "Motion Tracking", url: "/video-animation/motion-tracking" },
        {
          label: "Transition & Effects",
          url: "/video-animation/transition-effects",
        },
      ],
    },
    {
      image: SocialMarketingVideo,
      title: "Social & Marketing Videos",
      links: [
        {
          label: "Video & Commercials",
          url: "/video-animation/video-commercials",
        },
        {
          label: "Social Media Videos",
          url: "/video-animation/social-media-videos",
        },
        { label: "Slideshow Videos", url: "/video-animation/slideshow-videos" },
        {
          label: "Explainer Video Production",
          url: "/video-animation/explainer-video-production",
        },
      ],
    },
  ],
  business: [
    {
      image: BusinessFormation,
      title: "Business Formation & Growth",
      links: [
        { label: "Market Research", url: "/business/market-research" },
        { label: "Business Plan", url: "/business/business-plan" },
        { label: "Business Consulting", url: "/business/business-consulting" },
        { label: "Software Management", url: "/business/software-management" },
      ],
    },
    {
      image: GeneralAdminstrative,
      title: "General Adminstrative",
      links: [
        { label: "Virtual Assistant", url: "/business/virtual-assistant" },
        {
          label: "Ecommerce Management",
          url: "/business/ecommerce-management",
        },
        { label: "Project Management", url: "/business/project-management" },
      ],
    },
    {
      image: SalesCustomerCare,
      title: "Sales & Customer Supports",
      links: [
        { label: "Sales", url: "/business/sales" },
        { label: "Lead Generation", url: "/business/lead-generation" },
        {
          label: "Call Center & Calling",
          url: "/business/call-center-calling",
        },
        { label: "Customer Care", url: "/business/customer-care" },
      ],
    },
  ],
  "writing-translation": [
    {
      image: ContentWriting,
      title: "Content Writing",
      links: [
        { label: "Blog Writing", url: "/writing-translation/blog-writing" },
        { label: "Copywriting", url: "/writing-translation/copywriting" },
        {
          label: "Website Content",
          url: "/writing-translation/website-content",
        },
        {
          label: "Creative Writing",
          url: "/writing-translation/creative-writing",
        },
        { label: "Speech Writing", url: "/writing-translation/speech-writing" },
      ],
    },
    {
      image: BookPublishing,
      title: "Book & Ebook Publishing",
      links: [
        {
          label: "Book Formatting",
          url: "/writing-translation/book-formatting",
        },
        {
          label: "Book & eBook Writing",
          url: "/writing-translation/book-ebook-writing",
        },
        { label: "Beta Reading", url: "/writing-translation/beta-reading" },
        {
          label: "Proofreading & Editing",
          url: "/writing-translation/proofreading-editing",
        },
      ],
    },
    {
      image: Translation,
      title: "Translation & Transcription",
      links: [
        { label: "Translation", url: "/writing-translation/translation" },
        { label: "Transcription", url: "/writing-translation/transcription" },
        { label: "Localization", url: "/writing-translation/localization" },
      ],
    },
  ],
};

const Services = () => {
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState("programming-tech");
  const [isOpen, setIsOpen] = useState(false);

  const drawerRef = useRef(null);

  const filteredCategories = categoriesData[selectedCategory] || [];

  const openDrawer = () => setIsOpen(true);
  const closeDrawer = () => setIsOpen(false);
  const toggleDrawer = () => setIsOpen((p) => !p);

  // Sync selected category with URL hash, e.g. /services#graphics-design
  useEffect(() => {
    const hash = (location.hash || "").replace(/^#/, "");
    if (!hash) return;
    if (Object.prototype.hasOwnProperty.call(categoriesData, hash)) {
      setSelectedCategory(hash);
    }
  }, [location.hash]);

  // Close drawer when category changes (so user sees content)
  useEffect(() => {
    if (isOpen) closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  // Close drawer when route changes (pathname/hash change)
  useEffect(() => {
    if (isOpen) closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.hash]);

  // Click outside + ESC to close (mobile drawer)
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") closeDrawer();
    };

    const onMouseDown = (e) => {
      if (!drawerRef.current) return;
      if (!drawerRef.current.contains(e.target)) {
        closeDrawer();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [isOpen]);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  return (
    <div className="max-w-[1440px] mx-auto min-h-screen">
      {/* Mobile: Top action bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white/80 dark:bg-black/60 backdrop-blur border-b border-black/10 dark:border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            className="bg-pink-500 hover:bg-pink-600 text-white text-sm px-3 py-2 rounded-md"
            onClick={toggleDrawer}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
          >
            {isOpen ? "Close" : "See Categories"}
          </button>

          <span className="text-sm font-medium dark:text-white text-primaryText">
            {selectedCategory.replace("-", " & ")}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Desktop Sidebar (sticky + scrollable) */}
        <aside className="hidden md:block w-72 flex-shrink-0">
          <div className="sticky top-0 h-screen  pr-2">
            <Sidebar
              setSelectedCategory={setSelectedCategory}
              selectedCategory={selectedCategory}
              isOpen={true} // desktop e always visible
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-2 md:px-4 pb-10">
          <div className="pt-4 md:pt-6">
            <h2 className="dark:text-white text-primaryText font-roboto text-center text-2xl lg:text-3xl font-bold mt-4 md:mt-0 border-b-2 border-[#333333] w-[max-content] mx-auto pb-1">
              {selectedCategory.replace("-", " & ")}
            </h2>

            <div className="w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {filteredCategories.map((category, index) => (
                <CategoryCard
                  key={index}
                  image={category.image}
                  title={category.title}
                  links={category.links}
                  backgroundImage={category.backgroundImage}
                />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Drawer + Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
        >
          {/* overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* drawer */}
          <div
            ref={drawerRef}
            className="absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white dark:bg-[#0b0b0b] shadow-xl"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10">
              <p className="font-semibold dark:text-white text-primaryText">
                Categories
              </p>
              <button
                onClick={closeDrawer}
                className="text-sm px-3 py-1.5 rounded-md bg-black/5 dark:bg-white/10 dark:text-white"
                aria-label="Close categories"
              >
                ✕
              </button>
            </div>

            <div className="h-[calc(100%-56px)] overflow-y-auto p-2">
              <Sidebar
                setSelectedCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
                isOpen={true} // drawer open থাকলে show
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;
