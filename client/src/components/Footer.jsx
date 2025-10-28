import { Facebook, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";
import DarkLogo from "../assets/DarkLogo.png";
import Newsletter from "./Newsletter";
import FooterDescription from "./FooterDescription";

const Footer = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <footer className="mt-8 text-white py-10 border-t border-primaryRgb pb-20">
      <div className="container mx-auto px-5 lg:px-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 text-center lg:text-left">
          
          {/* === About Section === */}
          <div>
            <Link to="/">
              <img
                src={Logo}
                alt="Logo"
                className="dark:hidden mx-auto lg:mx-0 mb-2"
              />
              <img
                src={DarkLogo}
                alt="Logo Of Digital NexGen"
                className="hidden dark:block mx-auto lg:mx-0 mb-2"
              />
            </Link>

      <FooterDescription />
          </div>

          {/* === Quick Links === */}
          <div>
            <h2 className="text-lg font-semibold text-primaryRgb mb-3">
              Quick Links
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/project"
                  className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  to="/special-offers"
                  className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
                >
                  Offers
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
                >
                  Blogs
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
                >
                  Privacy & Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* === Services === */}
          <div>
            <h2 className="text-lg font-semibold text-primaryRgb mb-3">
              Services
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/programming-tech"
                  className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
                >
                  Programming & Tech
                </Link>
              </li>
              <li>
                <Link
                  to="/graphics-design"
                  className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
                >
                  Graphics & Design
                </Link>
              </li>
              <li>
                <Link
                  to="/digital-marketing"
                  className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
                >
                  Digital Marketing
                </Link>
              </li>
              <li>
                <Link
                  to="/video-animation"
                  className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
                >
                  Video & Animation
                </Link>
              </li>
              <li>
                <Link
                  to="/business"
                  className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
                >
                  Business
                </Link>
              </li>
              <li>
                <Link
                  to="/writing-translation"
                  className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
                >
                  Writing & Translation
                </Link>
              </li>
            </ul>
          </div>

          {/* === Contact Section === */}
          <div>
            <h2 className="text-lg font-semibold text-primaryRgb mb-3">
              Contact Us
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-1 font-medium">
              Digital NexGen
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              7537 Desoto Av, Canoga Park,
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              California 91303, USA.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-1">
              Email: info@digitalnexgen.com
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-3">
              Phone: +1 (818) 334-7704
            </p>

            <div className="flex relative z-50  justify-center lg:justify-start space-x-5 mb-4">
              <a
                href="https://www.facebook.com/profile.php?id=61558536931762&amp;mibextid=ZbWKwL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
              >
                <Facebook />
              </a>


              
              <a
                href="https://www.instagram.com/digital_nexgen/?igsh=dGgxZGdzczAzNHgy&amp;fbclid=IwZXh0bgNhZW0CMTAAAR3NoSmfjtTBsTZxW7EumcsP65jCvCQI6OcyrkJ2AcQg3rF5I1Sq5kiv6Ug_aem_AQ3ZT-0Lq5Pw4EBg8UOhr4h4g7kzx-16blNfK2URA8JoE-z93TMxUuLUjhZh-HlDmyk-POr9GEgg4o0BEag9S2K6"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
              >
                <Instagram />
              </a>
         
              <a
                href="https://www.linkedin.com/company/digital-nexgen/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
              >
                <Linkedin />
              </a>
              <a
                href="https://www.youtube.com/@digitalnexgen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-primaryRgb dark:hover:text-primaryRgb transition"
              >
                <Youtube />
              </a>
              
            </div>

            <div className="flex justify-center lg:justify-start">
              {!isAdminRoute && <Newsletter />}
            </div>
          </div>
        </div>

        <hr className="dark:border-gray-700 my-10" />
        <p className="text-center text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Digital NexGen. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
