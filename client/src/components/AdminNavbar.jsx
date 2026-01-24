import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gift,
  Home,
  Image,
  Layers,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquare,
  Moon,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Sun,
  Tag,
  User,
  Users,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import placeholder from "../assets/user.png";
import { ThemeContext } from "../context/ThemeContext";
import { handleLogout } from "../utils/authUtils";
const AdminNavbar = () => {
  const [isSidebarHidden, setIsSidebarHidden] = useState(false);
  const [profileImage, setProfileImage] = useState(placeholder);
  const [activePath, setActivePath] = useState("");
  const [username, setUsername] = useState("");
  const adminId = useSelector(
    (state) => state.auth.user._id || state.auth.user.id,
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?.img) setProfileImage(userData.img?.url);
    setActivePath(location.pathname);
    setUsername(userData?.name);
  }, [location.pathname, adminId]);

  const logout = () => handleLogout(dispatch, navigate);

  const toggleSidebar = () => {
    setIsSidebarHidden(!isSidebarHidden);
  };

  // Navigation items with icons
  const navItems = [
    {
      category: "Dashboard",
      items: [
        {
          path: "/admin",
          label: "Overview",
          icon: <Home className="w-5 h-5" />,
          count: null,
        },
      ],
    },
    {
      category: "Content Management",
      items: [
        {
          path: "/admin/add-service",
          label: "Add Service",
          icon: <Layers className="w-5 h-5" />,
          count: null,
        },
        {
          path: "/admin/services",
          label: "Services",
          icon: <Package className="w-5 h-5" />,
          count: null,
        },
        {
          path: "/admin/add-blog",
          label: "Add Blog",
          icon: <FileText className="w-5 h-5" />,
          count: null,
        },
        {
          path: "/admin/blogs",
          label: "Blogs",
          icon: <FileText className="w-5 h-5" />,
          count: null,
        },
      ],
    },
    {
      category: "Media & Gallery",
      items: [
        {
          path: "/admin/add-gallery",
          label: "Add Gallery",
          icon: <Image className="w-5 h-5" />,
          count: null,
        },
        {
          path: "/admin/galleries",
          label: "Galleries",
          icon: <Image className="w-5 h-5" />,
          count: null,
        },
        {
          path: "/admin/add-partners",
          label: "Add Partners",
          icon: <Users className="w-5 h-5" />,
          count: null,
        },
        {
          path: "/admin/partners",
          label: "Partners",
          icon: <Users className="w-5 h-5" />,
          count: null,
        },
      ],
    },
    {
      category: "E-Commerce",
      items: [
        {
          path: "/admin/orders",
          label: "Orders",
          icon: <ShoppingBag className="w-5 h-5" />,
          count: null,
        },
        {
          path: "/admin/coupons",
          label: "Coupons",
          icon: <Tag className="w-5 h-5" />,
          count: null,
        },
        {
          path: "/admin/promotional-offers",
          label: "Offers",
          icon: <Gift className="w-5 h-5" />,
          count: null,
        },
      ],
    },
    {
      category: "Communication",
      items: [
        {
          path: "/admin/conversations",
          label: "Chats",
          icon: <MessageCircle className="w-5 h-5" />,
          count: null,
        },
        {
          path: "/admin/emails",
          label: "Emails",
          icon: <Mail className="w-5 h-5" />,
          count: null,
        },
        {
          path: "/admin/newsletters",
          label: "Newsletters",
          icon: <Mail className="w-5 h-5" />,
          count: null,
        },
        {
          path: "/admin/review",
          label: "Reviews",
          icon: <Star className="w-5 h-5" />,
          count: null,
        },
      ],
    },
    {
      category: "Projects",
      items: [
        {
          path: "/admin/projects",
          label: "Projects",
          icon: <BarChart3 className="w-5 h-5" />,
          count: null,
        },
      ],
    },
  ];

  const quickActions = [
    {
      path: "/admin/settings",
      label: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
    {
      path: "/admin/profile/" + adminId,
      label: "Profile",
      icon: <User className="w-5 h-5" />,
    },
    {
      path: "/messages",
      label: "Messages",
      icon: <MessageSquare className="w-5 h-5" />,
    },
  ];
  const { theme, toggleTheme } = useContext(ThemeContext);
  return (
    <>
      {/* Single Toggle Button - Always Visible */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
      >
        {isSidebarHidden ? (
          <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 flex flex-col transform ${
          isSidebarHidden ? "-translate-x-full" : "translate-x-0"
        } w-64 shadow-xl`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            {/* Left: Logo */}
            <Link to="/admin" className="flex items-center space-x-3">
              <img src={Logo} alt="Logo" className="h-8 w-auto" />
            </Link>

            {/* Right: Theme Toggle Button */}
            <button
              className="text-green-800 dark:text-white hover:text-green-700 dark:hover:text-gray-300 transition-colors"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-blue-100 dark:border-blue-900"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                Admin
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {username}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {navItems.map((category, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {category.category}
              </h3>

              <div className="space-y-1">
                {category.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between mx-2 rounded-lg px-4 py-3 transition-all duration-200 ${
                      activePath === item.path
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700/50"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                    onClick={() => setActivePath(item.path)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`${
                          activePath === item.path
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          activePath === item.path
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>

                    {item.count !== null && (
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          activePath === item.path
                            ? "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions & Logout */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-4 space-y-2">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="flex items-center space-x-3 rounded-lg p-3 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <div className="text-gray-500 dark:text-gray-400">
                {action.icon}
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {action.label}
              </span>
            </Link>
          ))}

          <button
            onClick={logout}
            className="flex items-center space-x-3 rounded-lg p-3 transition-colors w-full hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with padding */}
      <div
        className={`transition-all duration-300 ${
          isSidebarHidden ? "pl-4" : "pl-64"
        }`}
      >
        {/* Content will be rendered here */}
      </div>
    </>
  );
};

export default AdminNavbar;
