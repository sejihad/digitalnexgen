import { useState } from "react";

const FooterDescription = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const text = `
    Digital NexGen is a UK-based IT service provider offering a wide range of digital solutions, including Digital Marketing, App Development, Web Design, Web Development, Cybersecurity, Graphic Design, Video Editing, SEO, Social Media Services, Book Formatting, Book Cover Design, and Book Trailer Videos. The company focuses on delivering tailored solutions that enhance online presence, strengthen brand identity, and protect digital assets. In addition to services, Digital NexGen also offers various professional courses designed to equip individuals with essential digital skills for career growth. Based in the United Kingdom, Digital NexGen provides its services to clients worldwide.
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
        className="text-primaryRgb hover:underline mt-2 block font-medium dark:text-white"
      >
        {isExpanded ? "Read Less" : "Read More"}
      </button>
    </div>
  );
};

export default FooterDescription;
