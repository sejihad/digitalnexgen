import { useEffect, useState } from "react";
import axios from "axios";
import { Layers } from "lucide-react";
//  import noise from "../assets/noise.svg";

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

  return (
    <section className="w-full h-full text-white flex justify-center">
      <div className="w-full max-w-6xl p-4 grid grid-cols-1 gap-8">
        <div className="text-center flex flex-col justify-center items-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 font-roboto">{`Welcome Admin!`}</h1>
          <p className="text-xl md:text-2xl font-openSans dark:text-[#ededed] text-primaryText mb-2">
            {username ? `${username}` : "Loading username..."}
          </p>
          <p className="text-xl md:text-2xl font-openSans dark:text-[#ededed] text-primaryText">
            {greeting}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card count={displayCount} label="Total Services" />
          <Card count={displayConversationCount} label="Total Conversations" />
          <Card count={displayOrderCount} label="Total Orders" />
        </div>
      </div>
    </section>
  );
};

const Card = ({ count, label }) => (
  <div
    className="col-span-1 p-8 rounded-lg shadow-sm max-h-[300px] text-center relative overflow-hidden bg-white border border-gray-100 dark:bg-white/10 dark:border-white/20 dark:shadow-lg"
    style={{
      backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 70%)`,
      // backgroundImage: `url(${noise}), radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.1) 70%)`,
      backgroundBlendMode: "overlay",
      backgroundSize: "cover",
    }}
  >
    <div
      className="absolute top-[-100px] left-[-100px] w-[300px] h-[300px] opacity-50 blur-lg"
      style={{
        background:
          "radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)",
        borderRadius: "50%",
      }}
    ></div>
    <div
      className="absolute bottom-[-100px] right-[-100px] w-[300px] h-[300px] opacity-50 blur-lg"
      style={{
        background:
          "radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)",
        borderRadius: "50%",
      }}
    ></div>

    <div className="relative z-10 flex justify-center items-center mb-4">
      <Layers className="text-white w-12 h-12 md:w-16 md:h-16" />
    </div>
    <h2 className="relative z-10 text-3xl md:text-5xl font-bold mb-2 font-roboto dark:text-[#ededed] text-primaryText">
      {count}
    </h2>
    <p className="relative z-10 text-lg md:text-xl font-semibold font-openSans dark:text-[#ededed]  text-primaryText">
      {label}
    </p>
  </div>
);

export default Overview;
