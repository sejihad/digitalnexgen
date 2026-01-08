import {
  BarChart3,
  Bell,
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
  Package,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../assets/logo.png";
import placeholder from "../assets/user.png";
import { handleLogout } from "../utils/authUtils";

const AdminNavbar = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [profileImage, setProfileImage] = useState(placeholder);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [activePath, setActivePath] = useState("");

  const adminId = useSelector(
    (state) => state.auth.user._id || state.auth.user.id
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?.img) setProfileImage(userData.img);
    setActivePath(location.pathname);
  }, [location.pathname, adminId]);

  const logout = () => handleLogout(dispatch, navigate);

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
          count: 15,
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
          count: 8,
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
          count: 24,
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
          count: 12,
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
          count: 8,
        },
        {
          path: "/admin/coupons",
          label: "Coupons",
          icon: <Tag className="w-5 h-5" />,
          count: 5,
        },
        {
          path: "/admin/promotional-offers",
          label: "Offers",
          icon: <Gift className="w-5 h-5" />,
          count: 3,
        },
      ],
    },
    {
      category: "Communication",
      items: [
        {
          path: "/admin/contact",
          label: "Contact",
          icon: <Mail className="w-5 h-5" />,
          count: 12,
        },
        {
          path: "/admin/conversations",
          label: "Chats",
          icon: <MessageCircle className="w-5 h-5" />,
          count: 5,
        },
        {
          path: "/admin/review",
          label: "Reviews",
          icon: <Star className="w-5 h-5" />,
          count: 24,
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
          count: 6,
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

  return (
    <>
      {/* Fixed Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-50 flex flex-col ${
          isSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Logo Section */}
        <div
          className={`p-4 border-b border-gray-200 dark:border-gray-800 ${
            isSidebarCollapsed ? "flex justify-center" : ""
          }`}
        >
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!isSidebarCollapsed && (
              <Link to="/admin" className="flex items-center space-x-3">
                <img src={Logo} alt="Logo" className="h-8 w-auto" />
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Admin
                </span>
              </Link>
            )}

            {isSidebarCollapsed && (
              <Link to="/admin">
                <img src={Logo} alt="Logo" className="h-8 w-auto" />
              </Link>
            )}

            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>
        </div>

        {/* User Profile Section */}
        <div
          className={`p-4 border-b border-gray-200 dark:border-gray-800 ${
            isSidebarCollapsed ? "flex justify-center" : ""
          }`}
        >
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? "justify-center" : "space-x-3"
            }`}
          >
            <div className="relative">
              <img
                src={profileImage}
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-blue-100 dark:border-blue-900"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>

            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  admin@example.com
                </p>
              </div>
            )}

            {!isSidebarCollapsed && (
              <button className="relative">
                <Bell className="w-5 h-5 text-gray-500" />
                {hasNotifications && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {navItems.map((category, idx) => (
            <div key={idx} className="mb-6">
              {!isSidebarCollapsed && (
                <h3 className="px-4 mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {category.category}
                </h3>
              )}

              <div className="space-y-1">
                {category.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center mx-2 rounded-lg transition-all duration-200 ${
                      activePath === item.path
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700/50"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    } ${
                      isSidebarCollapsed
                        ? "justify-center p-3"
                        : "justify-between px-4 py-3"
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

                      {!isSidebarCollapsed && (
                        <span
                          className={`text-sm font-medium ${
                            activePath === item.path
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isSidebarCollapsed && item.count !== null && (
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
              className={`flex items-center rounded-lg p-3 transition-colors ${
                isSidebarCollapsed ? "justify-center" : "space-x-3"
              } hover:bg-gray-100 dark:hover:bg-gray-800`}
            >
              <div className="text-gray-500 dark:text-gray-400">
                {action.icon}
              </div>
              {!isSidebarCollapsed && (
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {action.label}
                </span>
              )}
            </Link>
          ))}

          <button
            onClick={logout}
            className={`flex items-center rounded-lg p-3 transition-colors w-full ${
              isSidebarCollapsed ? "justify-center" : "space-x-3"
            } hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400`}
          >
            <LogOut className="w-5 h-5" />
            {!isSidebarCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Collapsed sidebar overlay for mobile */}
      {isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setIsSidebarCollapsed(false)}
        ></div>
      )}

      {/* Main Content Area with padding for sidebar */}
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* Optional: You can add a top bar here if needed */}
        {/* <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                Dashboard Overview
              </h1>
              <div className="flex items-center space-x-4">
                {/* Add any top bar content here * /}
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </>
  );
};

export default AdminNavbar;
