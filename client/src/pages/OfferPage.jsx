import axios from "axios";
import { Clock, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";
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

  // Fetch offers from backend
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/promotional-offers`,
        );
        setOffers(response.data);

        // Set countdown to the earliest end date
        if (response.data.length > 0) {
          const earliestEndDate = response.data.reduce((earliest, offer) => {
            const offerEndDate = new Date(offer.endDate).getTime();
            return offerEndDate < earliest ? offerEndDate : earliest;
          }, new Date(response.data[0].endDate).getTime());
          setOfferEndTime(earliestEndDate);
          // Persist the computed offer end time so other components (like the OfferModal)
          // can read and display the same countdown.
          try {
            sessionStorage.setItem("offerEndTime", String(earliestEndDate));
            // Notify other components that the offer end time was updated
            try {
              window.dispatchEvent(
                new CustomEvent("offerEndTimeUpdated", {
                  detail: { offerEndTime: earliestEndDate },
                }),
              );
            } catch {
              // ignore if dispatch fails
            }
          } catch {
            console.warn("Could not write offerEndTime to sessionStorage");
          }
        } else {
          // No offers - ensure any persisted end time is removed and notify listeners
          try {
            sessionStorage.removeItem("offerEndTime");
            try {
              window.dispatchEvent(
                new CustomEvent("offerEndTimeUpdated", {
                  detail: { offerEndTime: null },
                }),
              );
            } catch {
              // ignore
            }
          } catch (err) {
            // ignore
          }
        }
      } catch (error) {
        console.error("Error fetching promotional offers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!offerEndTime) {
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = offerEndTime - now;
      if (difference > 0) {
        const timeData = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        };
        setTimeLeft(timeData);
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
      <>
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

          {/* Bloom effects */}
          <div
            className="absolute top-[-150px] left-[-200px] opacity-80 blur-lg animate-moveBefore"
            style={{
              height: "500px",
              width: "500px",
              background:
                "radial-gradient(circle, rgba(255, 122, 94, 0.8), rgba(0,0,0,0) 70%)",
              borderRadius: "50%",
            }}
          ></div>

          <div
            className="absolute bottom-[-250px] right-[-200px] opacity-80 blur-lg animate-moveAfter"
            style={{
              height: "500px",
              width: "500px",
              background:
                "radial-gradient(circle, rgba(100, 160, 255, 0.8), rgba(0,0,0,0) 70%)",
              borderRadius: "50%",
            }}
          ></div>
        </div>
      </>
    );
  }

  return (
    <>
      {offers.length === 0 && (
        <Hero
          bloomColor1="rgba(12, 187, 20, 0.45)"
          bloomColor2="rgba(12, 187, 20, 0.2)"
          heroHeight="280px"
          bloomSize="520px"
          title="Exclusive Special Offers"
          paragraph="Don't miss out on our incredible deals! Get premium services at unbeatable prices."
        />
      )}

      <div className="py-10 md:py-12 max-w-[1440px] w-11/12 mx-auto">
        <div className="flex items-center  justify-center text-center  mb-16">
          <h1 className="text-2xl md:text-3xl font-extrabold text-primaryText dark:text-white">
            Special Offers
          </h1>
        </div>

        {/* Countdown Timer */}
        {offerEndTime && (
          <div className="group relative rounded-2xl shadow-sm border border-gray-100 dark:border-white/20 overflow-hidden transition-all duration-300 p-6 mb-10 bg-white dark:bg-white/10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Clock className="w-6 h-6 text-primaryRgb" />
              <h2 className="text-xl md:text-2xl font-extrabold text-primaryText dark:text-white">
                Offer Ends In
              </h2>
            </div>

            <div className="bg-green-50 dark:bg-gray-700/50 rounded-lg p-3 border border-green-200 dark:border-gray-600">
              <div className="w-full max-w-[1120px] mx-auto grid grid-cols-4 gap-1.5">
                {[
                  { label: "Days", value: timeLeft.days },
                  { label: "Hours", value: timeLeft.hours },
                  { label: "Minutes", value: timeLeft.minutes },
                  { label: "Seconds", value: timeLeft.seconds },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-white/10 rounded-md p-1.5 text-center shadow-sm"
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

        {/* Offers Grid */}
        <div className="grid grid-cols-1 gap-6 mb-4 md:mb-10">
          {offers.map((offer, index) => (
            <OfferCard key={offer._id || index} offer={offer} />
          ))}
        </div>
      </div>
    </>
  );
};

export default OfferPage;
