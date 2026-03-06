import {
  Gift,
  Home,
  Layers,
  MessageSquare,
  Moon,
  Search,
  Sun,
  User,
} from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DarkLogo from "../assets/DarkLogo.png";
import Logo from "../assets/logo.png";
import { ThemeContext } from "../context/ThemeContext";

const GuestNavbar = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  const location = useLocation();
  const navigate = useNavigate();
  const mobileSearchRef = useRef(null);
  const isActive = (path) => location.pathname === path;

  // ✅ "/" e search thakbe na
  const showSearch = location.pathname !== "/";

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleMobileSearch = () => setIsMobileSearchOpen((prev) => !prev);

  const handleSearch = (event) => {
    if (
      (event.key === "Enter" || event.type === "click") &&
      searchQuery.trim()
    ) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    setSearchQuery("");
    setIsMobileSearchOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target)
      ) {
        setIsMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <>
      {/* Top Navbar */}
      <div className="w-full py-3 px-2 shadow-[0_2px_6px_rgba(0,0,0,0.1)] dark:shadow-none relative z-50">
        {/* ✅ Desktop layout: Logo | Search | Menu | Theme | SignIn */}
        <div className="hidden lg:flex items-center gap-6">
          {/* 1) Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                src={Logo}
                alt="Logo"
                className="dark:hidden w-[160px] lg:w-[200px] xl:w-[240px]"
              />
              <img
                src={DarkLogo}
                alt="Logo Of Digital NexGen"
                className="hidden dark:block w-[160px] lg:w-[200px] xl:w-[240px]"
              />
            </Link>
          </div>

          {/* 2) Search (not on "/") */}
          <div className={`${showSearch ? "flex-1" : "hidden"}`}>
            {showSearch && (
              <div className="relative flex items-center w-full max-w-[520px] transition-all duration-300">
                <span className="pointer-events-none absolute left-3 text-gray-500 dark:text-gray-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Search products, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  className="w-full h-9 pl-10 pr-16 rounded-full bg-white dark:bg-[#2b2b2b]
                  text-primaryText dark:text-primaryTextForDark
                  placeholder:text-gray-500 dark:placeholder:text-gray-400
                  border border-gray-200 dark:border-[#444]
                  focus:outline-none focus:ring-2 focus:ring-[rgb(164,223,167)] focus:border-transparent shadow-sm"
                />
                <button
                  onClick={handleSearch}
                  aria-label="Search"
                  className="absolute right-1 h-8 px-2 rounded-full bg-[rgb(12,187,20)] dark:bg-black
                  text-white text-sm font-medium hover:opacity-90 active:opacity-100 transition flex items-center justify-center"
                >
                  <Search size={16} />
                </button>
              </div>
            )}
          </div>

          {/* 3) Menu items */}
          <nav
            className={`flex items-center gap-8 dark:text-[#ededed] text-primaryText font-openSans ${
              showSearch ? "flex-shrink-0" : "flex-1 justify-center"
            }`}
          >
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
            <Link
              to="/contact"
              className={`hover:text-primaryRgb ${
                isActive("/contact") ? "text-primaryRgb" : ""
              }`}
            >
              Contact
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
                  className={`block px-4 py-2 dark:hover:bg-[#444444] dark:text-white ${
                    isActive("/blog")
                      ? "text-primaryRgb"
                      : "hover:text-primaryRgb"
                  }`}
                >
                  Blog
                </Link>
                <Link
                  to="/about"
                  className={`block px-4 py-2 dark:hover:bg-[#444444] dark:text-white ${
                    isActive("/about")
                      ? "text-primaryRgb"
                      : "hover:text-primaryRgb"
                  }`}
                >
                  About
                </Link>
              </div>
            </div>
          </nav>

          {/* 4) Theme toggle */}
          <div className="lg:order-3 flex">
            <Link
              to="/auth/login"
              className={`flex items-center mr-4 dark:text-white dark:hover:text-primaryRgb hover:text-primaryRgb ${
                isActive("/chat") ? "text-primaryRgb" : ""
              }`}
              aria-label="Messages (login)"
            >
              <MessageSquare className="w-5 h-5 md:w-7 md:h-7 lg:w-9 lg:h-9" />
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
              to="/auth/login"
              className="flex items-center gap-2
    border border-primaryRgb rounded-md
    px-4 py-2 sm:px-6
    text-xs sm:text-base
    text-primaryRgb
    transition-all duration-300
    hover:bg-primaryRgb hover:text-white
    active:scale-95"
            >
              <User size={18} />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          </div>
        </div>

        {/* ✅ Mobile layout: Logo | (Search icon if not "/") | Theme */}
        <div className="flex lg:hidden items-center justify-between">
          {/* Logo */}
          <Link to="/">
            <img src={Logo} alt="Logo" className="dark:hidden w-[180px]" />
            <img
              src={DarkLogo}
              alt="Logo Of Digital NexGen"
              className="hidden dark:block w-[180px]"
            />
          </Link>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            {showSearch && (
              <button
                onClick={toggleMobileSearch}
                className="text-black dark:text-white"
                aria-label="Open search"
              >
                <Search size={20} />
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="text-primaryText dark:text-white"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>

        {/* ✅ Mobile Search dropdown (UserNavbar style) */}
        {showSearch && isMobileSearchOpen && (
          <div
            ref={mobileSearchRef}
            className="
    absolute top-16 left-0 w-full z-40
    bg-white dark:bg-[#222222]
    px-3 py-3 sm:px-4 sm:py-4
    shadow-md
  "
          >
            <div
              className="
      flex items-center gap-2
      rounded-full
      bg-[#f5f5f5] dark:bg-[#333333]
      border border-gray-200 dark:border-[#444444]
      px-2 sm:px-3
      py-2
    "
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                className="
        flex-grow
        bg-transparent
        px-2
        text-sm sm:text-base
        text-primaryText dark:text-white
        placeholder:text-gray-500 dark:placeholder:text-gray-400
        focus:outline-none
      "
              />

              <button
                onClick={handleSearch}
                aria-label="Search"
                className="
        h-9 w-9 sm:h-10 sm:w-10
        flex items-center justify-center
        rounded-full
        bg-[rgb(12,187,20)] text-white
        hover:opacity-90 active:scale-95
        transition
      "
              >
                <Search size={18} className="sm:hidden" />
                <Search size={20} className="hidden sm:block" />
              </button>
            </div>
          </div>
        )}
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
          className={`flex flex-col items-center ${
            isActive("/chat")
              ? "text-primaryRgb"
              : "text-gray-700 dark:text-white"
          }`}
        >
          <MessageSquare size={20} />
          <span className="text-xs">Messages</span>
        </Link>

        <Link
          to="/auth/login"
          className={`flex flex-col items-center ${
            isActive("/auth/login")
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
