import axios from "axios";
import { Clock, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import OfferCard from "../components/OfferCard";

const OfferPage = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offerEndTime, setOfferEndTime] = useState(null);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/promotional-offers`,
        );

        const list = response.data || [];
        setOffers(list);

        if (list.length > 0) {
          const earliestEndDate = list.reduce((earliest, offer) => {
            const end = new Date(offer.endDate).getTime();
            return end < earliest ? end : earliest;
          }, new Date(list[0].endDate).getTime());

          setOfferEndTime(earliestEndDate);

          try {
            sessionStorage.setItem("offerEndTime", String(earliestEndDate));
            try {
              window.dispatchEvent(
                new CustomEvent("offerEndTimeUpdated", {
                  detail: { offerEndTime: earliestEndDate },
                }),
              );
            } catch {}
          } catch {}
        } else {
          setOfferEndTime(null);
          try {
            sessionStorage.removeItem("offerEndTime");
            try {
              window.dispatchEvent(
                new CustomEvent("offerEndTimeUpdated", {
                  detail: { offerEndTime: null },
                }),
              );
            } catch {}
          } catch {}
        }
      } catch (error) {
        // optional: show toast
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  useEffect(() => {
    if (!offerEndTime) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const diff = offerEndTime - now;

      if (diff > 0) {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [offerEndTime]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primaryRgb mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading offers...</p>
        </div>
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div
        className="relative w-11/12 max-w-[1440px] mx-auto mt-6 dark:bg-white/10 rounded-2xl shadow-lg backdrop-blur-lg border border-white/20 flex flex-col justify-center items-center overflow-hidden border-gray-200 dark:border-gray-900 bg-tea-Green"
        style={{ minHeight: "450px" }}
      >
        <div className="relative z-10 flex flex-col items-center space-y-6 text-center px-4">
          <Gift className="w-20 h-20 text-gray-400" />
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Currently No Active Offers
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
            Stay tuned for upcoming special discounts!
          </p>
          <button
            onClick={() => navigate("/services")}
            className="bg-primaryRgb text-white py-3 px-8 rounded-lg font-semibold hover:opacity-90 transition-all duration-300"
          >
            Browse Services
          </button>
        </div>

        <div
          className="absolute top-[-150px] left-[-200px] opacity-80 blur-lg animate-moveBefore"
          style={{
            height: "500px",
            width: "500px",
            background:
              "radial-gradient(circle, rgba(255, 122, 94, 0.8), rgba(0,0,0,0) 70%)",
            borderRadius: "50%",
          }}
        />
        <div
          className="absolute bottom-[-250px] right-[-200px] opacity-80 blur-lg animate-moveAfter"
          style={{
            height: "500px",
            width: "500px",
            background:
              "radial-gradient(circle, rgba(100, 160, 255, 0.8), rgba(0,0,0,0) 70%)",
            borderRadius: "50%",
          }}
        />
      </div>
    );
  }

  return (
    <>
      {/* <Hero
        bloomColor1="rgba(12, 187, 20, 0.45)"
        bloomColor2="rgba(12, 187, 20, 0.2)"
        heroHeight="280px"
        bloomSize="520px"
        title="Exclusive Special Offers"
        paragraph="Don't miss out on our incredible deals! Get premium services at unbeatable prices."
      /> */}

      <div className="py-10 md:py-12 max-w-[1440px] w-11/12 mx-auto">
        <div className="flex items-center justify-center text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-primaryText dark:text-white">
            Special Offers
          </h1>
        </div>

        {/* Countdown */}
        {offerEndTime && (
          <div className="relative rounded-2xl border border-gray-100 dark:border-white/20 overflow-hidden p-6 mb-10 bg-white dark:bg-white/10 shadow-sm">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-primaryRgb" />
              <h2 className="text-xl md:text-2xl font-extrabold text-primaryText dark:text-white">
                Offer Ends In
              </h2>
            </div>

            <div className="bg-green-50 dark:bg-gray-700/50 rounded-xl p-3 border border-green-200 dark:border-gray-600">
              <div className="w-full max-w-[1120px] mx-auto grid grid-cols-4 gap-2">
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Minutes", value: timeLeft.minutes },
                  { label: "Seconds", value: timeLeft.seconds },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-white/10 rounded-lg p-2 text-center shadow-sm border border-white/20"
                  >
                    <div className="text-xl md:text-2xl font-black text-primaryRgb">
                      {String(item.value).padStart(2, "0")}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ✅ Professional grid: Desktop = 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <OfferCard key={offer._id} offer={offer} />
          ))}
        </div>
      </div>
    </>
  );
};

export default OfferPage;
