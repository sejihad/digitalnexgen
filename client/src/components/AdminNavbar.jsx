import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import placeholder from "../assets/user.png";
import { handleLogout } from "../utils/authUtils";

const AdminNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(placeholder);
  const adminId = useSelector(
    (state) => state.auth.user._id || state.auth.user.id
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?.img) setProfileImage(userData.img);
  }, [adminId]);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);
  const logout = () => handleLogout(dispatch, navigate);

  const navItems = [
    { path: "/admin/add-service", label: "Add Service" },
    { path: "/admin/add-blog", label: "Add Blog" },
    { path: "/admin/add-partners", label: "Add Partners" },
    { path: "/admin/add-gallery", label: "Add Gallery" },
    { path: "/admin/services", label: "Services" },
    { path: "/admin/partners", label: "Partners" },
    { path: "/admin/blogs", label: "Blogs" },
    { path: "/admin/newsletters", label: "N-Letter" },
    { path: "/admin/projects", label: "projects" },
    { path: "/admin/galleries", label: "Galleries" },
    { path: "/admin/orders", label: "Orders" },
    { path: "/admin/coupons", label: "Coupons" },
    { path: "/admin/promotional-offers", label: "Offers" },
    { path: "/admin/contact", label: "Contact" },
    { path: "/admin/conversations", label: "Conversations" },
    { path: "/admin/review", label: "Review" },
  ];

  return (
    <header className="w-full max-w-[1500px] mx-auto h-[80px] flex justify-between items-center px-4 shadow-md text-primaryText  dark:text-[#ededed] relative z-40">
      {/* Logo */}
      <div>
        <Link to="/admin">
          <img src={Logo} alt="Logo" className="w-48" />
        </Link>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex flex-wrap text-[] justify-center gap-4 lg:mb-[-10px] max-w-full">
        {navItems.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`hover:text-primaryRgb text-base font-openSans transition-colors duration-300 ${isActive(path) ? 'text-primaryRgb' : ''}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Desktop Profile */}
      <div className="hidden lg:flex items-center relative">
        <img
          src={profileImage}
          alt="Profile"
          className="w-10 h-10 rounded-full cursor-pointer"
          onClick={toggleDropdown}
        />
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 w-48 bg-[#333] rounded-md shadow-lg z-50">
            <ul className="py-1">
              <li>
                <Link
                  to={`/admin/profile/${adminId}`}
                  className={`block px-4 py-2 ${isActive(`/admin/profile/${adminId}`) ? 'text-primaryRgb' : 'hover:text-primaryRgb'}`}
                >
                  Profile
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/settings"
                  className={`block px-4 py-2 ${isActive('/admin/settings') ? 'text-primaryRgb' : 'hover:text-primaryRgb'}`}
                >
                  Settings
                </Link>
              </li>
              <li>
                <Link
                  to="/messages"
                  className={`block px-4 py-2 ${isActive('/messages') ? 'text-primaryRgb' : 'hover:text-primaryRgb'}`}
                >
                  Messages
                </Link>
              </li>
              <li>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 hover:text-primaryRgb"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Mobile Icons */}
      <div className="flex lg:hidden items-center gap-3">
        {/* Profile for Mobile */}
        <div className="relative">
          <img
            src={profileImage}
            alt="Profile"
            className="w-10 h-10 rounded-full cursor-pointer"
            onClick={toggleDropdown}
          />
          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-48 bg-[#333] rounded-md shadow-lg z-50">
              <ul className="py-1">
                <li>
                  <Link
                    to={`/admin/profile/${adminId}`}
                    className="block px-4 py-2 hover:text-primaryRgb"
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/settings"
                    className="block px-4 py-2 hover:text-primaryRgb"
                  >
                    Settings
                  </Link>
                </li>
                <li>
                  <Link
                    to="/messages"
                    className="block px-4 py-2 hover:text-primaryRgb"
                  >
                    Messages
                  </Link>
                </li>
                <li>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 hover:text-primaryRgb"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Hamburger Menu */}
        <button onClick={toggleMenu}>
          <Menu color="white" size={32} />
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="lg:hidden absolute top-[80px] left-0 w-full bg-[#333] rounded-b-md shadow-md z-40">
          <ul className="flex flex-col gap-1 py-3">
            {navItems.map(({ path, label }) => (
              <li key={path}>
                <Link
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 text-primaryText dark:text-[#ededed] hover:text-primaryRgb"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;
