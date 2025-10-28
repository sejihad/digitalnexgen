import { useState } from "react";

const ProjectSidebar = ({
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
        { name: "Mobile Apps", value: "mobile-apps" },
        { name: "Website Platform", value: "website-platform" },
        { name: "Support & Security", value: "support-security" },
      ],
    },
    {
      name: "Graphics & Design",
      value: "graphics-design",
      subcategories: [
        { name: "Logo & Brand Identity", value: "logo-brand-identity" },
        { name: "Web & App Design", value: "web-app-design" },
        { name: "Art & Illustration", value: "art-illustration" },
        { name: "Visual Design", value: "visual-design" },
        { name: "Cover & Package Design", value: "cover-package-design" },
        { name: "Marketing Design", value: "marketing-design" },
        { name: "Fashion & Marchandise", value: "fashion-marchandise" },
        { name: "3D Design", value: "3d-design" },
      ],
    },
    {
      name: "Digital Marketing",
      value: "digital-marketing",
      subcategories: [
        { name: "Search", value: "search" },
        { name: "Social", value: "social" },
        { name: "Methods & Technique", value: "methods-technique" },
        { name: "Analytics Strategy", value: "analytics-strategy" },
      ],
    },
    {
      name: "Video & Animation",
      value: "video-animation",
      subcategories: [
        { name: "Editing & Post Production", value: "editing-post-production" },
        { name: "Animation", value: "animation" },
        { name: "Motion Graphics", value: "motion-graphics" },
        { name: "Video Editing", value: "video-editing" },
        { name: "Social & Marketing Videos", value: "social-arketing-videos" },
      ],
    },
    {
      name: "Business",
      value: "business",
      subcategories: [
        { name: "Business Formation & Growth", value: "business-formation-growth" },
        { name: "General Adminstrative", value: "general-adminstrative" },
        { name: "Sales & Customer Supports", value: "sales-customer-supports"},
      ],
    },
    {
      name: "Writing & Translation",
      value: "writing-translation",
      subcategories: [
        { name: "Content Writing", value: "content-writing" },
        { name: "Book & Ebook Publishing", value: "book-ebook-publishing" },
        { name: "Translation & Transcription", value: "translation-transcription" },
      ],
    }

  ];

  const handleCategoryToggle = (categoryValue) => {
    setOpenCategory(openCategory === categoryValue ? null : categoryValue);
    setSelectedCategory(categoryValue);
    setSelectedSubCategory(null);
  };

  const handleSubSelect = (subcategoryValue) => {
    setSelectedSubCategory(subcategoryValue);
    setOpenCategory(null); 
  };

  return (
   
    <aside
  className={`fixed z-40 md:static ${
    isOpen ? "translate-x-0" : "-translate-x-[150%]"
  } top-24 left-0 md:top-auto md:left-auto h-[max-content] mt-8 ml-8 w-64 p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg  shadow-[0_.14px_2.29266px_rgba(0,0,0,0.03),_0_.37px_4.42626px_rgba(0,0,0,0.047),_0_3px_7px_rgba(0,0,0,0.09)] dark:shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0`}
>
  <h3 className="text-primaryText dark:text-white text-lg font-bold mb-4 font-roboto">
    Categories
  </h3>

  <ul className="space-y-4">
    {categories.map((category) => (
      <li key={category.value} className="relative   dark:text-[#ededed] group">
        <div
          onClick={() => handleCategoryToggle(category.value)}
          className={`relative z-10 cursor-pointer text-sm lg:text-base p-2 rounded-lg font-openSans flex justify-between items-center transition-all duration-300 ${
            selectedCategory === category.value
              ? "dark:bg-white/30 bg-white border font-semibold "
              : "bg-transparent hover:bg-white/30 "
          }`}
        >
          <span>{category.name}</span>
          <span className="text-xs opacity-70">
            {openCategory === category.value ? "▲" : "▼"}
          </span>
          <span
            className={`absolute -top-1/2 -left-1/2 w-[200%] h-[200%] rounded-full opacity-0 group-hover:opacity-100 ${
              selectedCategory === category.value ? "opacity-100" : ""
            } transition-opacity duration-300`}
            style={{
              // background:
              //   "radial-gradient(circle, rgba(12, 187, 20, 0.8), transparent)",
              filter: "blur(20px)",
              pointerEvents: "none",
              zIndex: -1,
            }}
          ></span>
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

export default ProjectSidebar;
