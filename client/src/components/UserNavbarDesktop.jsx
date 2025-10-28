import {
  LogOut,
  MessageSquare,
  Moon,
  Search,
  Settings,
  ShoppingBag,
  Sun,
  User,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import placeholder from "../assets/user.png";
import { ThemeContext } from "../context/ThemeContext";
import { handleLogout } from "../utils/authUtils";
const UserNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const userId = useSelector(
    (state) => state.auth.user._id || state.auth.user.id
  );

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(placeholder);
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?.img) setProfileImage(userData.img);
  }, [userId]);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const toggleMobileSearch = () => setIsMobileSearchOpen((prev) => !prev);
  const logout = () => handleLogout(dispatch, navigate);
  const handleNavigation = (path) => navigate(path);

  const handleSearch = (event) => {
    if ((event.key === "Enter" || event.type === "click") && searchQuery) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };
  const isActive = (path) => location.pathname === path;

  const DropdownMenu = () => (
    <div className="absolute right-0 mt-5 w-48  bg-light-bg dark:bg-[#333333] rounded-md shadow-lg z-50">
      <ul className="py-1">
        {["profile", "settings", "billing", "orders"]
          .filter((item) => item !== "billing")
          .map((item) => (
            <li key={item}>
              <Link
                to={`/${item === "profile" ? `profile/${userId}` : item}`}
                className="block px-4 py-2 dark:text-primaryTextForDark  text-primaryText     dark:hover:text-primaryRgb  hover:text-primaryRgb transition-colors duration-200 border-b border-[#444444]"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Link>
            </li>
          ))}
        <li>
          <button
            onClick={logout}
            className="block w-full text-left px-4 py-2 dark:text-primaryTextForDark   text-primaryText hover:text-primaryRgb dark:hover:text-primaryRgb transition-colors duration-200"
          >
            Logout
          </button>
        </li>
      </ul>
    </div>
  );

  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div className="w-full bg-transparent lg:px-6  py-2 shadow-[0_2px_6px_rgba(0,0,0,0.1)] dark:shadow-none flex justify-between items-center  relative z-50">
      <Link to="/">
        <img src={Logo} alt="Logo" className="h-15 w-60 cursor-pointer z-50" />
      </Link>
      {/* Mobile */}
      <div className="lg:hidden flex items-center gap-3">
        <button onClick={toggleMobileSearch} className="text-white">
          <Search size={20} />
        </button>
        <img
          src={profileImage}
          alt="Profile"
          className="w-10 h-10 rounded-full"
        />
      </div>
      {/* Desktop */}
      <div className="hidden lg:grid w-full grid-cols-3 items-center gap-4 ml-8">
        {/* Left spacer */}
        <div className="col-start-1 col-end-2">
          <div className="relative flex  items-center max-w-[300px] flex-shrink-0 ">
            <span className="pointer-events-none  absolute left-3 text-gray-500 dark:text-gray-400">
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
              className="absolute right-1 h-8 px-2 rounded-full bg-[rgb(12,187,20)] text-white text-sm font-medium hover:opacity-90 active:opacity-100 transition flex items-center justify-center"
            >
              <Search size={16} />
            </button>
          </div>
        </div>
        {/* Center group: links + search */}

        <div
          style={{ marginLeft: "90px" }}
          className="col-start-2 col-end-3 flex items-center gap-4 justify-center text-center min-w-0 "
        >
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
        </div>
        {/* Right controls */}
        <div className="col-start-3 col-end-4 flex items-center justify-end gap-3">
          <button
            onClick={() => handleNavigation("/chat")}
            className="text-primaryText dark:text-white hover:text-primaryRgb"
          >
            <MessageSquare size={20} />
          </button>
          <button
            className="text-green-800 dark:text-white dark:hover:text-white hover:text-green-700 "
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <Moon className="hover:text-black"></Moon>
            ) : (
              <Sun></Sun>
            )}
          </button>
          <div className="relative">
            <button onClick={toggleDropdown} className="focus:outline-none">
              <img
                src={profileImage}
                alt="Profile"
                className="w-12 h-12 rounded-full mr-2"
              />
            </button>
            {isDropdownOpen && <DropdownMenu />}
          </div>
        </div>
      </div>

      {/* Mobile Search */}
      {isMobileSearchOpen && (
        <div className="absolute top-16 left-0 w-full dark:bg-[#222222] p-4 z-40 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="flex-grow px-4 py-2 rounded-md bg-[#333333] text-primaryText focus:outline-none focus:bg-[#444444]"
            />
            <button
              onClick={handleSearch}
              className="text-primaryText hover:text-primaryRgb"
            >
              <Search size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}

      <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-[#222222] border-t border-black/10 dark:border-white/10 p-2 flex items-center justify-evenly gap-6 lg:hidden z-40 shadow-lg">
        <Link
          to="/chat"
          className="text-primaryText hover:text-primaryRgb flex flex-col items-center"
        >
          <MessageSquare size={20} />
          <span className="text-xs">Messages</span>
        </Link>

        <Link
          to={`/profile/${userId}`}
          className="flex flex-col items-center dark:text-white text-primaryText hover:text-primaryRgb dark:hover:text-primaryRgb"
        >
          <User size={20} />
          <span className="text-xs">Profile</span>
        </Link>

        <Link
          to="/settings"
          className="text-primaryText hover:text-primaryRgb flex flex-col items-center"
        >
          <Settings size={20} />
          <span className="text-xs">Setting</span>
        </Link>

        {/* <Link
          to="/billings"
          className="text-primaryText hover:text-primaryRgb flex flex-col items-center"
        >
          <CreditCard size={20} />
          <span className="text-xs">Billing</span>
        </Link> */}

        <Link
          to="/orders"
          className="text-primaryText hover:text-primaryRgb flex flex-col items-center"
        >
          <ShoppingBag size={20} />
          <span className="text-xs">Orders</span>
        </Link>

        <button
          onClick={logout}
          className="text-primaryText hover:text-primaryRgb mt-auto flex flex-col items-center"
        >
          <LogOut size={20} />
          <span className="text-xs">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default UserNavbar;
