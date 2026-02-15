import { useEffect, useState } from "react";
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
// import noise from "../assets/noise.svg";
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
        { label: "AI Development", url: "/programming-tech/ai-devlopment" },
      ],
      //  backgroundImage: noise,
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
      //  backgroundImage: noise,
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
      //  backgroundImage: noise,
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
      //  backgroundImage: noise,
    },
  ],
  "graphics-design": [
    {
      image: LogoBrand,
      title: "Logo & Brand Identity",
      links: [
        {
          label: "Logo Design",
          url: "/graphics-design/logo-design",
        },
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
      //  backgroundImage: noise,
    },
    {
      image: WebAppDesign,
      title: "Web & App Design",
      links: [
        {
          label: "Web Design",
          url: "/graphics-design/web-design",
        },
        {
          label: "App Design",
          url: "/graphics-design/app-design",
        },
        {
          label: "UX Design",
          url: "/graphics-design/ux-design",
        },
        {
          label: "Landing Page Design",
          url: "/graphics-design/landing-page-design",
        },
        {
          label: "Icon Design",
          url: "/graphics-design/icon-design",
        },
      ],
      //  backgroundImage: noise,
    },
    {
      image: ArtIllustration,
      title: "Art & Illustration",
      links: [
        {
          label: "Illustration",
          url: "/graphics-design/illustration",
        },
        {
          label: "Children's Book Illustration",
          url: "/graphics-design/children-book-illustration",
        },
        {
          label: "Pattern Design",
          url: "/graphics-design/pattern-design",
        },
        {
          label: "Cartoon & Comics",
          url: "/graphics-design/cartoon-comics",
        },
      ],
      //  backgroundImage: noise,
    },
    {
      image: VisualDesign,
      title: "Visual Design",
      links: [
        {
          label: "Image Editing",
          url: "/graphics-design/image-editing",
        },
        {
          label: "Presentation Design",
          url: "/graphics-design/presentation-design",
        },
        {
          label: "Infographic Design",
          url: "/graphics-design/infographic-design",
        },
        {
          label: "Resume Design",
          url: "/graphics-design/resume-design",
        },
      ],
      //  backgroundImage: noise,
    },
    {
      image: CoverPackageDesign,
      title: "Cover & Package Design",
      links: [
        {
          label: "Packaging & Label Design",
          url: "/graphics-design/packaging-label-design",
        },
        {
          label: "Book Design",
          url: "/graphics-design/book-design",
        },
        {
          label: "Book Covers",
          url: "/graphics-design/book-covers",
        },
        {
          label: "Album Cover Design",
          url: "/graphics-design/album-cover-design",
        },
      ],
      //  backgroundImage: noise,
    },
    {
      image: MarketingDesign,
      title: "Marketing Design",
      links: [
        {
          label: "Social Media Design",
          url: "/graphics-design/social-media-design",
        },
        {
          label: "Thumbnail Design",
          url: "/graphics-design/thumbnail-design",
        },
        {
          label: "Email Design",
          url: "/graphics-design/email-design",
        },
        {
          label: "Web Banners",
          url: "/graphics-design/web-banners",
        },
      ],
      //  backgroundImage: noise,
    },
    {
      image: FashionDesign,
      title: "Fashion & Marchandise",
      links: [
        {
          label: "T-Shirt & Marchandise",
          url: "/graphics-design/t-shirt-marchandise",
        },
        {
          label: "Fashion Design",
          url: "/graphics-design/fashion-design",
        },
        {
          label: "Jewelry Design",
          url: "/graphics-design/jewelry-design",
        },
      ],
      //  backgroundImage: noise,
    },
    {
      image: Design3d,
      title: "3D Design",
      links: [
        {
          label: "3D Architecture",
          url: "/graphics-design/3d-architecture",
        },
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
      //  backgroundImage: noise,
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
      //  backgroundImage: noise,
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
      //  backgroundImage: noise,
    },
    {
      image: MethodTechnique,
      title: "Methods & Technique",
      links: [
        {
          label: "Video Marketing",
          url: "/digital-marketing/video-marketing",
        },
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
      //  backgroundImage: noise,
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
      //  backgroundImage: noise,
    },
  ],
  "video-animation": [
    {
      image: EditingPostProduction,
      title: "Editing & Post Production",
      links: [
        {
          label: "Video Editing",
          url: "/video-animation/video-editing",
        },
        {
          label: "Visual Effect",
          url: "/video-animation/visual-effect",
        },
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
      //  backgroundImage: noise,
    },
    {
      image: Animation,
      title: "Animation",
      links: [
        {
          label: "2D Animation",
          url: "/video-animation/2d-animation",
        },
        {
          label: "3D Animation",
          url: "/video-animation/3d-animation",
        },
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
      //  backgroundImage: noise,
    },
    {
      image: MotionGraphics,
      title: "Motion Graphics",
      links: [
        {
          label: "Animated Logos",
          url: "/video-animation/animated-logos",
        },
        {
          label: "Lottie & Web Animation",
          url: "/video-animation/lottie-web-animation",
        },
        {
          label: "Text Animation",
          url: "/video-animation/text-animation",
        },
        {
          label: "Motion Tracking",
          url: "/video-animation/motion-tracking",
        },
        {
          label: "Transition & Effects",
          url: "/video-animation/transition-effects",
        },
      ],
      //  backgroundImage: noise,
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
      //  backgroundImage: noise,
    },
  ],
  business: [
    {
      image: BusinessFormation,
      title: "Business Formation & Growth",
      links: [
        {
          label: "Market Research",
          url: "/business/market-research",
        },
        {
          label: "Business Plan",
          url: "/business/business-plan",
        },
        { label: "Business Consulting", url: "/business/business-consulting" },
        { label: "Software Management", url: "/business/software-management" },
      ],
      //  backgroundImage: noise,
    },
    {
      image: GeneralAdminstrative,
      title: "General Adminstrative",
      links: [
        {
          label: "Virtual Assistant",
          url: "/business/virtual-assistant",
        },
        {
          label: "Ecommerce Management",
          url: "/business/ecommerce-management",
        },
        { label: "Project Management", url: "/business/project-management" },
      ],
      //  backgroundImage: noise,
    },
    {
      image: SalesCustomerCare,
      title: "Sales & Customer Supports",
      links: [
        {
          label: "Sales",
          url: "/business/sales",
        },
        {
          label: "Lead Generation",
          url: "/business/lead-generation",
        },
        {
          label: "Call Center & Calling",
          url: "/business/call-center-calling",
        },
        {
          label: "Customer Care",
          url: "/business/customer-care",
        },
      ],
      //  backgroundImage: noise,
    },
  ],
  "writing-translation": [
    {
      image: ContentWriting,
      title: "Content Writing",
      links: [
        {
          label: "Blog Writing",
          url: "/writing-translation/blog-writing",
        },
        {
          label: "Copywriting",
          url: "/writing-translation/copywriting",
        },
        {
          label: "Website Content",
          url: "/writing-translation/website-content",
        },
        {
          label: "Creative Writing",
          url: "/writing-translation/creative-writing",
        },
        {
          label: "Speech Writing",
          url: "/writing-translation/speech-writing",
        },
      ],
      //  backgroundImage: noise,
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
        {
          label: "Beta Reading",
          url: "/writing-translation/beta-reading",
        },
        {
          label: "Proofreading & Editing",
          url: "/writing-translation/proofreading-editing",
        },
      ],
      //  backgroundImage: noise,
    },
    {
      image: Translation,
      title: "Translation & Transcription",
      links: [
        {
          label: "Translation",
          url: "/writing-translation/translation",
        },
        {
          label: "Transcription",
          url: "/writing-translation/transcription",
        },
        {
          label: "Localization",
          url: "/writing-translation/localization",
        },
      ],
      //  backgroundImage: noise,
    },
  ],
};

const Services = () => {
  const [selectedCategory, setSelectedCategory] = useState("programming-tech");
  const location = useLocation();

  // Sync selected category with URL hash, e.g. /services#graphics-design
  useEffect(() => {
    const hash = (location.hash || "").replace(/^#/, "");
    if (!hash) return;
    if (Object.prototype.hasOwnProperty.call(categoriesData, hash)) {
      setSelectedCategory(hash);
    }
  }, [location.hash]);
  const [isOpen, setIsOpen] = useState(false);

  const filteredCategories = categoriesData[selectedCategory] || [];

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="relative flex flex-col md:flex-row max-w-[1440px] mx-auto h-screen ">
      <div className="md:w-64 flex-shrink-0">
        <Sidebar
          setSelectedCategory={setSelectedCategory}
          selectedCategory={selectedCategory}
          isOpen={isOpen}
        />
      </div>

      <main className="flex-1 overflow-y-auto ml-2 md:ml-4">
        <div className="p-0">
          <h2 className="dark:text-white text-primaryText font-roboto text-center text-2xl lg:text-3xl font-bold mt-12 md:mt-4 border-b-2 border-[#333333] w-[max-content] mx-auto pb-1">
            Featured {selectedCategory.replace("-", " & ")}
          </h2>

          <button
            className="absolute top-2 left-8 z-40 bg-pink-500 text-white text-xs p-2 rounded-md md:hidden"
            onClick={toggleSidebar}
          >
            {isOpen ? "Close Sidebar" : "Open Sidebar"}
          </button>
          <div className="w-11/12 mx-auto max-w-[1440px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
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
  );
};
export default Services;
