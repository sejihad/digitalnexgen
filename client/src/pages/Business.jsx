import React from "react";
import Hero from "../components/Hero";
import CategoryCard from "../components/CategoryCard";
// import noise from "../assets/noise.svg";
import BusinessFormation from "../assets/Business/BusinessFormation.jpg";
import GeneralAdminstrative from "../assets/Business/GeneralAdminstrative.jpg";
import SalesCustomerCare from "../assets/Business/SalesCustomerCare.jpg";

const Business = () => {
  const categories = [
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
      // backgroundImage: noise,
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
      // backgroundImage: noise,
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
      // backgroundImage: noise,
    },
  ];

  return (
    <div>
      <Hero
        bloomColor1="rgba(0, 220, 238, .8)"
        bloomColor2="rgba(232, 0, 151, 0.8)"
        heroHeight="300px"
        bloomSize="500px"
        title="Business"
        paragraph="Take your business to the next level."
      />
      <div>
        <h2 className="dark:text-white text-primaryText font-roboto text-center text-2xl lg:text-3xl font-bold mt-4 border-b-2 border-[#333333] w-[max-content] mx-auto pb-1">
          Featured Business Services
        </h2>
        <div className="w-11/12 mx-auto max-w-[1440px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
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

export default Business;
