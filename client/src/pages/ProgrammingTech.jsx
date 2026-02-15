import CategoryCard from "../components/CategoryCard";
import Hero from "../components/Hero";
// import noise from "../assets/noise.svg";
import ApplicationDev from "../assets/ProgrammingTech/ApplicationDev.jpg";
import SupportSecurity from "../assets/ProgrammingTech/SupportSecurity.jpg";
import WebDev from "../assets/ProgrammingTech/WebSiteDev.jpg";
import WebsitePlatform from "../assets/ProgrammingTech/WebsitePlatform.jpg";

const ProgrammingTech = () => {
  const categories = [
    {
      image: WebDev,
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
      // backgroundImage: noise,
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
      // backgroundImage: noise,
    },
    {
      image: WebsitePlatform,
      title: "Website Platform",
      links: [
        {
          label: "Wix",
          url: "/programming-tech/wix",
        },
        {
          label: "Webflow",
          url: "/programming-tech/webflow",
        },
        { label: "Wordpress", url: "/programming-tech/wordpress" },
        { label: "Shopify", url: "/programming-tech/shopify" },
        {
          label: "WooCommerce",
          url: "/programming-tech/woocommerce",
        },
      ],
      // backgroundImage: noise,
    },
    {
      image: SupportSecurity,
      title: "Support & Security",
      links: [
        {
          label: "Support & IT",
          url: "/programming-tech/support-it",
        },
        {
          label: "Cloud Computing",
          url: "/programming-tech/cloud-computing",
        },
        {
          label: "Cyber Security",
          url: "/programming-tech/cyber-security",
        },
        {
          label: "Convert Files",
          url: "/programming-tech/convert-files",
        },
      ],
      // backgroundImage: noise,
    },
  ];

  return (
    <div>
      <Hero
        bloomColor1="rgba(57, 255, 20, .8)"
        bloomColor2="rgba(232, 0, 151, 0.8)"
        heroHeight="300px"
        bloomSize="500px"
        title="Programming & Tech"
        paragraph="Your vision, my development — ideas become products."
      />
      <div>
        <h2 className="font-roboto text-center text-2xl lg:text-3xl font-bold mt-4 border-b-2 text-[#333333] dark:text-white dark:border-[#333333] w-[max-content] mx-auto pb-1">
          Featured Programming & Tech
        </h2>
        <div className="w-11/12 mx-auto max-w-[1440px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {categories.map((category, index) => (
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
    </div>
  );
};

export default ProgrammingTech;
