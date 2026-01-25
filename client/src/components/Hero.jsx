import { Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
// import noise from "../assets/noise.svg";

import axios from "axios";
import { useEffect, useState } from "react";
import "./Hero.css";

// import logo7 from "../assets/Partners/7.svg";
const Hero = ({
  bloomColor1,
  bloomColor2,
  heroHeight = "450px",
  bloomSize = "550px",
  title,
  paragraph,
}) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [logos, setLogos] = useState([]);

  const handleSearch = (event) => {
    if (event.key === "Enter") {
      searchNow();
    }
  };
  const searchNow = () => {
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Fetch logos dynamically
  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/partners`,
        );

        // Only keep name and logoUrl
        const formatted = response.data.map((item) => ({
          name: item.name,
          logoUrl: item.logo?.url,
        }));

        setLogos(formatted);
      } catch (error) {}
    };

    fetchLogos();
  }, []);

  return (
    <div className="lg:pt-2">
      <div
        className="relative w-11/12 max-w-[1440px] mx-auto mt-6 bg-white text-gray-900 rounded-2xl shadow-lg backdrop-blur-lg border border-gray-200 flex flex-col justify-center items-center overflow-hidden dark:bg-white/10 dark:text-[#ededed] dark:border-gray-900"
        style={{
          height: heroHeight,
          //backgroundImage: `url(${noise})`,
          backgroundSize: "cover",
        }}
      >
        <div className="relative z-10 flex flex-col items-center space-y-2">
          <div className="text-center">
            {isHomePage ? (
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold font-roboto text-gray-600 dark:text-[#ededed]">
                Discover The Ideal Freelance Service <br /> Without Delay
              </h1>
            ) : (
              <>
                <h1 className="text-2xl md:text-4xl lg:text-4xl font-bold font-roboto text-gray-800 dark:text-[#ededed]">
                  {title}
                </h1>
                <p className="mt-4 lg:text-2xl font-openSans text-gray-600 dark:text-[#ededed] ">
                  {paragraph}
                </p>
              </>
            )}

            {isHomePage && (
              <div className="mt-6 relative w-[80%] max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="Search for services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="px-4 py-3 w-full rounded-lg shadow-md bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:shadow-lg transition-all duration-300 dark:bg-transparent dark:text-[#ededed] dark:border-gray-700"
                />
                <button
                  onClick={searchNow}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-white dark:text-[#ededed] p-1 md:p-2 rounded-md bg-primaryRgb hover:opacity-90 transition-colors duration-300"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {isHomePage && (
            <div className="overflow-hidden w-full mt-10 slider-section">
              <div className="flex animate-slide whitespace-nowrap">
                {logos.map((logo, index) => (
                  <img
                    key={index}
                    src={logo.logoUrl}
                    alt={logo.name}
                    className="w-[100px] mx-6 inline-block opacity-90 hover:opacity-100 transition"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="absolute top-[-150px] left-[-200px] opacity-80 blur-lg animate-moveBefore"
          style={{
            height: bloomSize,
            width: bloomSize,
            background: `radial-gradient(circle, ${bloomColor1}, rgba(0,0,0,0) 70%)`,
            borderRadius: "50%",
          }}
        ></div>

        <div
          className="absolute bottom-[-250px] right-[-200px] opacity-80 blur-lg animate-moveAfter"
          style={{
            height: bloomSize,
            width: bloomSize,
            background: `radial-gradient(circle, ${bloomColor2}, rgba(0,0,0,0) 70%)`,
            borderRadius: "50%",
          }}
        ></div>
      </div>
    </div>
  );
};

export default Hero;
