import React from "react";
import Hero from "../components/Hero";
// import noise from "../assets/noise.svg";
import CategoryCard from "../components/CategoryCard";
import Search from "../assets/DigitalMarketing/Search.jpg";
import Social from "../assets/DigitalMarketing/Social.jpg";
import MethodTechnique from "../assets/DigitalMarketing/MethodTechnique.jpg";
import Strategy from "../assets/DigitalMarketing/Strategy.jpg";

const DigitalMarketing = () => {
  const categories = [
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
      // backgroundImage: noise,
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
      // backgroundImage: noise,
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
      // backgroundImage: noise,
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
      // backgroundImage: noise,
    },
  ];

  return (
    <div>
      <Hero
        bloomColor1="rgba(180, 0, 255, 0.8)"
        bloomColor2="rgba(232, 0, 151, 0.8)"
        heroHeight="300px"
        bloomSize="500px"
        title="Digital Marketing"
        paragraph="Build your brand, grow your business."
      />
      <div>
        <h2 className="dark:text-white text-primaryText font-roboto text-center text-2xl lg:text-3xl font-bold mt-4 border-b-2 border-[#333333] w-[max-content] mx-auto pb-1">
          Featured Digital Marketing
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

export default DigitalMarketing;
