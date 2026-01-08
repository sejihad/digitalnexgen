import axios from "axios";
import { Layers, MessageSquare, ShoppingBag, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

const Overview = () => {
  const [totalServices, setTotalServices] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);
  const [totalConversations, setTotalConversations] = useState(0);
  const [displayConversationCount, setDisplayConversationCount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [displayOrderCount, setDisplayOrderCount] = useState(0);
  const [username, setUsername] = useState(null);
  const [greeting, setGreeting] = useState("");

  const incrementCounter = (total, setDisplay, speed = 50, stepRatio = 100) => {
    const step = Math.ceil(total / stepRatio);
    const interval = setInterval(() => {
      setDisplay((prev) => {
        const next = prev + step;
        if (next >= total) {
          clearInterval(interval);
          return total;
        }
        return next;
      });
    }, speed);

    return () => clearInterval(interval);
  };

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [services, conversations, orders] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/services/count`),
          axios.get(
            `${import.meta.env.VITE_API_BASE_URL}/api/conversations/count`,
            { withCredentials: true }
          ),
          axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/orders/count`, {
            withCredentials: true,
          }),
        ]);

        setTotalServices(services.data.totalServices);
        setTotalConversations(conversations.data.count);
        setTotalOrders(orders.data.ordersCount);
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    if (totalServices > 0) {
      return incrementCounter(totalServices, setDisplayCount);
    }
  }, [totalServices]);

  useEffect(() => {
    if (totalConversations > 0) {
      return incrementCounter(totalConversations, setDisplayConversationCount);
    }
  }, [totalConversations]);

  useEffect(() => {
    if (totalOrders > 0) {
      return incrementCounter(totalOrders, setDisplayOrderCount);
    }
  }, [totalOrders]);

  useEffect(() => {
    const currentTime = new Date();
    const hours = currentTime.getHours();
    let greetingText = "Good day";

    if (hours < 12) {
      greetingText = "Good morning";
    } else if (hours < 18) {
      greetingText = "Good afternoon";
    } else {
      greetingText = "Good evening";
    }

    setGreeting(greetingText);

    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.username) {
      setUsername(user.username);
    }
  }, []);

  // Get icon based on label
  const getIcon = (label) => {
    switch (label) {
      case "Total Services":
        return <Layers className="w-8 h-8 text-blue-600" />;
      case "Total Conversations":
        return <MessageSquare className="w-8 h-8 text-green-600" />;
      case "Total Orders":
        return <ShoppingBag className="w-8 h-8 text-purple-600" />;
      default:
        return <TrendingUp className="w-8 h-8 text-gray-600" />;
    }
  };

  // Get color based on label
  const getCardColor = (label) => {
    switch (label) {
      case "Total Services":
        return "from-blue-50 to-blue-100 border-blue-200";
      case "Total Conversations":
        return "from-green-50 to-green-100 border-green-200";
      case "Total Orders":
        return "from-purple-50 to-purple-100 border-purple-200";
      default:
        return "from-gray-50 to-gray-100 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
      {/* Welcome Header */}
      <div className="mb-8 md:mb-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 md:p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                  {greeting},{" "}
                  <span className="text-blue-200">{username || "Admin"}</span>!
                </h1>
                <p className="text-blue-100 text-lg">
                  Welcome back to your dashboard
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                  <p className="text-white font-semibold">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Overview
          </h2>
          <p className="text-gray-600">Quick glance at your business metrics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Service Card */}
          <div
            className={`bg-gradient-to-br ${getCardColor(
              "Total Services"
            )} rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  {getIcon("Total Services")}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Total Services
                  </h3>
                  <p className="text-xs text-gray-500">
                    Active services in catalog
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  +12%
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl md:text-4xl font-bold text-gray-800">
                {displayCount}
              </p>
              <div className="mt-2">
                <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${
                        (displayCount / Math.max(totalServices, 1)) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Conversations Card */}
          <div
            className={`bg-gradient-to-br ${getCardColor(
              "Total Conversations"
            )} rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  {getIcon("Total Conversations")}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Conversations
                  </h3>
                  <p className="text-xs text-gray-500">Customer interactions</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  +8%
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl md:text-4xl font-bold text-gray-800">
                {displayConversationCount}
              </p>
              <div className="mt-2">
                <div className="h-2 bg-green-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${
                        (displayConversationCount /
                          Math.max(totalConversations, 1)) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Card */}
          <div
            className={`bg-gradient-to-br ${getCardColor(
              "Total Orders"
            )} rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  {getIcon("Total Orders")}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Total Orders
                  </h3>
                  <p className="text-xs text-gray-500">
                    Completed transactions
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  +24%
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl md:text-4xl font-bold text-gray-800">
                {displayOrderCount}
              </p>
              <div className="mt-2">
                <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-1000"
                    style={{
                      width: `${
                        (displayOrderCount / Math.max(totalOrders, 1)) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
