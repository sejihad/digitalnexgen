import axios from "axios";
import {
  Gift,
  Home,
  Layers,
  MessageSquare,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DarkLogo from "../assets/DarkLogo.png";
import Logo from "../assets/logo.png";
import placeholder from "../assets/user.png";
import { ThemeContext } from "../context/ThemeContext";
import { setHasUnread } from "../redux/chatSlice";
import { handleLogout } from "../utils/authUtils";
const UserNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // desktop dropdown
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false); // ✅ mobile dropdown
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(placeholder);
  const [searchQuery, setSearchQuery] = useState("");
  const hasUnread = useSelector((state) => state.chat.hasUnread);
  const mobileSearchRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const userId = useSelector(
    (state) => state.auth.user._id || state.auth.user.id,
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ refs (outside click close)
  const dropdownRef = useRef(null); // desktop
  const mobileDropdownRef = useRef(null); // mobile

  const { theme, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?.img?.url) setProfileImage(userData.img.url);
  }, [userId]);
  useEffect(() => {
    const loadUnread = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/conversations`,
          { withCredentials: true },
        );

        const list = Array.isArray(res.data) ? res.data : [];
        const anyUnread = list.some((c) => c?.readByCustomer === false);

        dispatch(setHasUnread(anyUnread));
      } catch (e) {
        console.log("unread fetch failed", e?.message);
        dispatch(setHasUnread(false));
      }
    };

    if (userId) loadUnread(); // ✅ token না লাগবে
  }, [userId]);
  // ✅ outside click => close dropdowns (desktop + mobile)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(e.target)
      ) {
        setIsMobileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
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
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleMobileSearch = () => setIsMobileSearchOpen((prev) => !prev);

  const logout = () => handleLogout(dispatch, navigate);
  const handleNavigation = (path) => navigate(path);

  const handleSearch = (event) => {
    if ((event.key === "Enter" || event.type === "click") && searchQuery) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setIsMobileSearchOpen(false);
    }
  };

  const isActive = (path) => location.pathname === path;

  // ✅ DropdownMenu (reuse for desktop + mobile)
  const DropdownMenu = ({ closeDropdown, className = "" }) => (
    <div
      className={`absolute right-0 mt-5 w-48 bg-light-bg dark:bg-[#333333] rounded-md shadow-lg z-50 ${className}`}
    >
      <ul className="py-1">
        {["profile", "settings", "billing", "orders"]
          .filter((item) => item !== "billing")
          .map((item) => (
            <li key={item}>
              <Link
                to={`/${item === "profile" ? `profile/${userId}` : item}`}
                onClick={closeDropdown}
                className="block px-4 py-2 dark:text-primaryTextForDark text-primaryText dark:hover:text-primaryRgb hover:text-primaryRgb transition-colors duration-200 border-b border-[#444444]"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Link>
            </li>
          ))}
        <li>
          <button
            onClick={() => {
              closeDropdown();
              logout();
            }}
            className="block w-full text-left px-4 py-2 dark:text-primaryTextForDark text-primaryText hover:text-primaryRgb dark:hover:text-primaryRgb transition-colors duration-200"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="w-full bg-transparent py-2 shadow-[0_2px_6px_rgba(0,0,0,0.1)] dark:shadow-none flex justify-between items-center relative z-50 px-2">
      <Link to="/">
        <img
          src={Logo}
          alt="Logo"
          className="w-[180px] lg:w-[200px] xl:w-[240px] cursor-pointer z-50 dark:hidden"
        />
        <img
          src={DarkLogo}
          alt="Logo Of Digital NexGen"
          className="w-[180px] lg:w-[200px] xl:w-[240px] cursor-pointer z-50 dark:block hidden"
        />
      </Link>

      {/* Mobile Top Controls */}
      <div className="lg:hidden flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="text-primaryText dark:text-white"
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button
          onClick={toggleMobileSearch}
          className="text-black dark:text-white"
        >
          <Search size={20} />
        </button>

        {/* ✅ remove top profile from mobile (profile now in bottom-right) */}
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex justify-between w-full grid-cols-[1fr_2fr_1fr] items-center gap-8 px-6">
        {/* Left spacer */}
        <div className="flex flex-1 justify-center">
          <div className="relative flex items-center w-full flex-shrink-0">
            <span className="pointer-events-none absolute left-3 text-gray-500 dark:text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search products, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="w-full h-9 pl-10 pr-16 rounded-full bg-white dark:bg-[#2b2b2b] text-primaryText dark:text-primaryTextForDark placeholder:text-gray-500 dark:placeholder:text-gray-400 border border-gray-200 dark:border-[#444] focus:outline-none focus:ring-2 focus:ring-[rgb(164,223,167)] focus:border-transparent shadow-sm"
            />
            <button
              onClick={handleSearch}
              aria-label="Search"
              className="absolute right-1 h-8 px-2 rounded-full bg-[rgb(12,187,20)] dark:bg-black text-white text-sm font-medium hover:opacity-90 active:opacity-100 transition flex items-center justify-center"
            >
              <Search size={16} />
            </button>
          </div>
        </div>

        {/* Center group: links */}
        <div className="flex-1 flex justify-center gap-6">
          <Link
            to="/"
            className={`hover:text-primaryRgb dark:text-white ${
              isActive("/") ? "text-primaryRgb" : ""
            }`}
          >
            Home
          </Link>
          <Link
            to="/services"
            className={`hover:text-primaryRgb dark:text-white ${
              isActive("/services") ? "text-primaryRgb" : ""
            }`}
          >
            Services
          </Link>
          <Link
            to="/project"
            className={`hover:text-primaryRgb dark:text-white ${
              isActive("/project") ? "text-primaryRgb" : ""
            }`}
          >
            Project
          </Link>
          <Link
            to="/special-offers"
            className={`hover:text-primaryRgb dark:text-white ${
              isActive("/special-offers") ? "text-primaryRgb" : ""
            }`}
          >
            Offers
          </Link>

          <div className="group relative cursor-pointer">
            <span
              className={`flex items-center gap-1 dark:text-white ${
                isActive("/blog") || isActive("/about") || isActive("/contact")
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
              <Link
                to="/contact"
                className={`block px-4 py-2 dark:hover:bg-[#444444] dark:text-white ${
                  isActive("/contact")
                    ? "text-primaryRgb"
                    : "hover:text-primaryRgb"
                }`}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNavigation("/chat")}
            className="relative text-primaryText dark:text-white hover:text-primaryRgb"
          >
            <MessageSquare className="w-5 h-5 md:w-7 md:h-7 lg:w-9 lg:h-9" />

            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500" />
            )}
          </button>

          <button
            className="text-green-800 dark:text-white dark:hover:text-white hover:text-green-700"
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <Moon className="hover:text-black" size={28} />
            ) : (
              <Sun size={28} />
            )}
          </button>

          {/* ✅ Desktop Profile dropdown wrapper */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="focus:outline-none">
              <img
                src={profileImage}
                alt="Profile"
                className="w-12 h-12 rounded-full mr-2"
              />
            </button>

            {isDropdownOpen && (
              <DropdownMenu closeDropdown={() => setIsDropdownOpen(false)} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {isMobileSearchOpen && (
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
      {/* ✅ Mobile Bottom Menu */}
      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#222222] border-t border-black/10 dark:border-white/10 p-2 flex items-center justify-between lg:hidden z-40 shadow-lg">
        <div className="flex items-center justify-evenly gap-10 flex-1 mr-3">
          <Link
            to="/"
            className="text-black dark:text-white hover:text-primaryRgb flex flex-col items-center"
          >
            <Home size={20} />
            <span className="text-xs">Home</span>
          </Link>

          <Link
            to="/services"
            className="text-black dark:text-white hover:text-primaryRgb flex flex-col items-center"
          >
            <Layers size={20} />
            <span className="text-xs">Services</span>
          </Link>
          <Link
            to="/special-offers"
            className="text-black dark:text-white hover:text-primaryRgb flex flex-col items-center"
          >
            <Gift size={20} />
            <span className="text-xs">Offers</span>
          </Link>
          <Link
            to="/chat"
            className="relative text-black dark:text-white hover:text-primaryRgb flex flex-col items-center"
          >
            <MessageSquare size={20} />

            {hasUnread && (
              <span className="absolute top-0 right-2 w-2 h-2 bg-red-500 rounded-full" />
            )}

            <span className="text-xs">Chat</span>
          </Link>
        </div>

        {/* ✅ Mobile Profile bottom-right + dropdown above */}
        <div className="relative ml-3" ref={mobileDropdownRef}>
          <button
            onClick={() => setIsMobileDropdownOpen((prev) => !prev)}
            className="focus:outline-none"
            aria-label="Open profile menu"
          >
            <img
              src={profileImage}
              alt="Profile"
              className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10"
            />
          </button>

          {isMobileDropdownOpen && (
            <DropdownMenu
              closeDropdown={() => setIsMobileDropdownOpen(false)}
              // ✅ show above the bottom nav
              className="bottom-14 right-0 mt-0"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserNavbar;
