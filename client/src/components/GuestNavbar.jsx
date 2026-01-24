import { Gift, Home, Layers, MessageSquare, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import DarkLogo from "../assets/DarkLogo.png";
import Logo from "../assets/logo.png";

import { Moon, Sun } from "lucide-react";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const GuestNavbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Navbar */}
      <div className="flex z-50 justify-between items-center w-full py-4 px-2  shadow-[0_2px_6px_rgba(0,0,0,0.1)] dark:shadow-none">
        {/* Logo */}
        <div className="lg:order-1">
          <Link to="/">
            <img
              src={Logo}
              alt="Logo"
              className="dark:hidden ml-[-15px] mb-2"
            />
            <img
              src={DarkLogo}
              alt="Logo Of Digital NexGen"
              className=" hidden dark:block ml-[-15px] mb-2"
            />
          </Link>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex lg:order-2 gap-8 dark:text-[#ededed] text-primaryText font-openSans">
          <Link
            to="/"
            className={`hover:text-primaryRgb ${
              isActive("/") ? "text-primaryRgb" : ""
            }`}
          >
            Home
          </Link>
          <Link
            to="/services"
            className={`hover:text-primaryRgb ${
              isActive("/services") ? "text-primaryRgb" : ""
            }`}
          >
            Services
          </Link>

          <Link
            to="/project"
            className={`hover:text-primaryRgb ${
              isActive("/project") ? "text-primaryRgb" : ""
            }`}
          >
            Project
          </Link>
          <Link
            to="/special-offers"
            className={`hover:text-primaryRgb ${
              isActive("/special-offers") ? "text-primaryRgb" : ""
            }`}
          >
            Offers
          </Link>

          <div className="group relative cursor-pointer">
            <span
              className={`flex items-center gap-1 ${
                isActive("/blog") || isActive("/about")
                  ? "text-primaryRgb"
                  : "hover:text-primaryRgb"
              }`}
            >
              Explore <span className="text-xs">▼</span>
            </span>
            <div className="absolute top-6 left-0 hidden group-hover:block bg-light-bg dark:bg-[#333333] shadow-lg rounded-md py-2 w-40">
              <Link
                to="/blog"
                className={`block px-4 py-2  dark:hover:bg-[#444444] dark:text-white ${
                  isActive("/blog")
                    ? "text-primaryRgb"
                    : "hover:text-primaryRgb"
                }`}
              >
                Blog
              </Link>
              <Link
                to="/about"
                className={`block px-4 py-2  dark:hover:bg-[#444444] dark:text-white ${
                  isActive("/about")
                    ? "text-primaryRgb"
                    : "hover:text-primaryRgb"
                }`}
              >
                About
              </Link>
            </div>
          </div>

          <Link
            to="/contact"
            className={`hover:text-primaryRgb ${
              isActive("/contact") ? "text-primaryRgb" : ""
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Join Button */}
        <div className="lg:order-3 flex">
          <Link
            to="/auth/login"
            className={`flex items-center mr-4 dark:text-white dark:hover:text-primaryRgb hover:text-primaryRgb ${
              isActive("/chat") ? "text-primaryRgb" : ""
            }`}
            aria-label="Messages (login)"
          >
            <MessageSquare size={25} />
          </Link>

          <button
            className="text-green-800 dark:text-white dark:hover:text-white hover:text-green-700  mr-4"
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <Moon className="hover:text-black"></Moon>
            ) : (
              <Sun></Sun>
            )}
          </button>

          <Link
            className="font-openSans text-primaryRgb hover:text-primaryText  dark:hover:text-[#ededed] hover:bg-primaryRgb transition-all border py-1 px-5 rounded-md border-primaryRgb duration-300"
            to="/auth/login"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white text-gray-800 border-t border-gray-200 dark:bg-[#222222] dark:text-white dark:border-transparent flex justify-around items-center py-2 lg:hidden shadow-md">
        <Link
          to="/"
          className={`flex flex-col items-center ${
            isActive("/") ? "text-primaryRgb" : "text-gray-700 dark:text-white"
          }`}
        >
          <Home size={20} />
          <span className="text-xs">Home</span>
        </Link>
        <Link
          to="/services"
          className={`flex flex-col items-center ${
            isActive("/services")
              ? "text-primaryRgb"
              : "text-gray-700 dark:text-white"
          }`}
        >
          <Layers size={20} />
          <span className="text-xs">Services</span>
        </Link>
        <Link
          to="/special-offers"
          className={`flex flex-col items-center ${
            isActive("/special-offers")
              ? "text-primaryRgb"
              : "text-gray-700 dark:text-white"
          }`}
        >
          <Gift size={20} />
          <span className="text-xs">Offers</span>
        </Link>
        <Link
          to="/auth/login"
          className={`flex flex-col items-center transition-colors duration-300 
    text-gray-700 dark:text-gray-300 
    hover:text-primaryRgb dark:hover:text-primaryRgb 
    ${isActive("/auth/login") ? "text-primaryRgb" : ""}`}
          aria-label="Messages (login)"
        >
          <MessageSquare size={20} />
          <span className="text-xs">Messages</span>
        </Link>

        {/* <Link
          to="/blog"
          className={`flex flex-col items-center ${
            isActive("/blog")
              ? "text-primaryRgb"
              : "text-gray-700 dark:text-white"
          }`}
        >
          <BookOpen size={20} />
          <span className="text-xs">Blog</span>
        </Link> */}
        {/* <Link
          to="/about"
          className={`flex flex-col items-center ${
            isActive("/about")
              ? "text-primaryRgb"
              : "text-gray-700 dark:text-white"
          }`}
        >
          <Info size={20} />
          <span className="text-xs">About</span>
        </Link> */}
        <Link
          to="/auth/login"
          className={`flex flex-col items-center ${
            isActive("/auth/sign-in")
              ? "text-primaryRgb"
              : "text-gray-700 dark:text-white"
          }`}
        >
          <User size={20} />
          <span className="text-xs">Sign In</span>
        </Link>
      </div>
    </>
  );
};

export default GuestNavbar;
