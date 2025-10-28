import { useState } from "react";

const FooterDescription = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const text = `
    Digital NexGen is an IT service provider offering a range of digital
    solutions, including digital marketing, app development, web design,
    web development, cybersecurity, graphics design, SEO, and social
    media services. They focus on delivering tailored solutions to
    enhance online presence and protect digital assets. Additionally,
    Digital NexGen offers various courses aimed at equipping individuals
    with essential digital skills for career advancement. Based in Dhaka,
    Bangladesh, their services are available globally.
  `;

  return (
    <div className="relative text-gray-600 dark:text-gray-400 leading-6 mx-auto text-sm md:text-base max-w-[320px] lg:max-w-full">
      <p
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isExpanded ? "max-h-[500px]" : "max-h-[170px]"
        }`}
      >
        {text}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-primaryRgb hover:underline mt-2 block font-medium"
      >
        {isExpanded ? "Read Less" : "Read More"}
      </button>
    </div>
  );
};

export default FooterDescription;
