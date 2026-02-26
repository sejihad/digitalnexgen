import axios from "axios";
import { Clock, Gift, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OfferModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [latestOffer, setLatestOffer] = useState(null);
  const [hasOffer, setHasOffer] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const navigate = useNavigate();
  const location = useLocation();

  const persistedEnd = sessionStorage.getItem("offerEndTime");
  const now = new Date().getTime();
  const [offerEndTime, setOfferEndTime] = useState(
    persistedEnd ? Number(persistedEnd) : now + 24 * 60 * 60 * 1000,
  );

  useEffect(() => {
    const fetchLatestOffer = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/promotional-offers/latest`,
          { withCredentials: true },
        );

        if (res.data) {
          setLatestOffer(res.data);
          setHasOffer(true);

          const end = new Date(res.data.endDate).getTime();
          setOfferEndTime(end);

          try {
            sessionStorage.setItem("offerEndTime", String(end));
          } catch {}
        } else {
          setHasOffer(false);
          setLatestOffer(null);
          try {
            sessionStorage.removeItem("offerEndTime");
          } catch {}
        }
      } catch {
        setHasOffer(false);
        setLatestOffer(null);
        try {
          sessionStorage.removeItem("offerEndTime");
        } catch {}
      }
    };

    fetchLatestOffer();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (
        e?.detail &&
        (e.detail.offerEndTime === null || e.detail.offerEndTime === undefined)
      ) {
        try {
          sessionStorage.removeItem("offerEndTime");
        } catch {}
        setOfferEndTime(null);
        setHasOffer(false);
        setLatestOffer(null);
        setIsOpen(false);
        return;
      }

      if (e?.detail?.offerEndTime) {
        setOfferEndTime(Number(e.detail.offerEndTime));
        setHasOffer(true);
        try {
          sessionStorage.setItem("offerEndTime", String(e.detail.offerEndTime));
        } catch {}
      }
    };

    window.addEventListener("offerEndTimeUpdated", handler);
    return () => window.removeEventListener("offerEndTimeUpdated", handler);
  }, []);

  const formattedEndDate = offerEndTime
    ? new Date(offerEndTime).toLocaleString()
    : null;

  useEffect(() => {
    if (!hasOffer) return;

    if (
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/special-offers")
    )
      return;

    const userString = localStorage.getItem("user");
    let user = null;

    try {
      user =
        userString && userString !== "undefined"
          ? JSON.parse(userString)
          : null;
    } catch {
      user = null;
    }

    if (user?.isAdmin) return;

    const modalShown = sessionStorage.getItem("offerModalShown");

    if (!modalShown && offerEndTime) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem("offerModalShown", "true");
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, offerEndTime, hasOffer]);

  useEffect(() => {
    if (!isOpen || !hasOffer || !offerEndTime) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = offerEndTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setHasOffer(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [isOpen, offerEndTime, hasOffer]);

  const handleClose = () => {
    try {
      sessionStorage.setItem("offerModalShown", "true");
    } catch {}
    setIsOpen(false);
  };

  const handleViewOffer = () => {
    try {
      sessionStorage.setItem("offerModalShown", "true");
    } catch {}
    setIsOpen(false);
    navigate("/special-offers");
  };

  if (!isOpen || !hasOffer || !latestOffer) return null;

  const offerImageUrl = latestOffer?.image?.url;
  const hasImage = Boolean(offerImageUrl);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative bg-light-bg dark:bg-white/10 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/20 max-w-md w-full pointer-events-auto transform transition-all animate-[scale-in_0.3s_ease-out]
                     max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Decorative top bar */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primaryRgb via-green-400 to-primaryRgb rounded-t-2xl" />

          <div className="p-5 md:p-6">
            {/* =========================
                ✅ CASE 1: IMAGE EXISTS
                Compact layout to avoid overflow
               ========================= */}
            {hasImage ? (
              <>
                {/* Image (compact height) */}
                <div className="mb-4">
                  <img
                    src={offerImageUrl}
                    alt={latestOffer?.title || "Offer"}
                    className="w-full h-36 md:h-40 object-cover rounded-xl border border-white/20 shadow-md"
                    loading="lazy"
                  />
                </div>

                {/* Title + discount (compact) */}
                <div className="text-center mb-3">
                  <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Limited Time Only</span>
                  </div>

                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white leading-tight">
                    {latestOffer?.title || "Special Offer"}
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Save{" "}
                    <span className="text-primaryRgb font-bold text-base">
                      {latestOffer?.discount || "50%"}
                    </span>{" "}
                    on selected services
                  </p>

                  {formattedEndDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Ends on: {formattedEndDate}
                    </p>
                  )}
                </div>

                {/* Countdown (compact padding) */}
                <div className="bg-tea-Green dark:bg-white/10 rounded-xl p-3 mb-3 backdrop-blur-lg border border-white/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primaryRgb" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Offer expires in:
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Days", value: timeLeft.days },
                      { label: "Hours", value: timeLeft.hours },
                      { label: "Min", value: timeLeft.minutes },
                      { label: "Sec", value: timeLeft.seconds },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-white/10 rounded-lg p-2 text-center shadow-sm backdrop-blur-lg border border-white/20"
                      >
                        <div className="text-lg md:text-xl font-bold text-primaryRgb">
                          {String(item.value).padStart(2, "0")}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features (max 2 lines to save space) */}
                <div className="space-y-1.5 mb-3">
                  {latestOffer?.features?.slice(0, 2).map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300"
                    >
                      <div className="w-1.5 h-1.5 bg-primaryRgb rounded-full mt-1.5 shrink-0" />
                      <span className="line-clamp-2">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleViewOffer}
                    className="w-full bg-primaryRgb text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    View All Offers
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </>
            ) : (
              /* =========================
                 ✅ CASE 2: NO IMAGE
                 Old design unchanged
                 ========================= */
              <>
                {/* Icon & Badge */}
                <div className="flex justify-center mb-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primaryRgb blur-xl opacity-50 animate-pulse" />
                    <div className="relative bg-gradient-to-br from-primaryRgb to-green-600 p-3 rounded-full">
                      <Gift className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span>Limited Time Only</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                    {latestOffer?.title || "Special Offer"}
                  </h2>

                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get up to{" "}
                    <span className="text-primaryRgb font-bold text-lg">
                      {latestOffer?.discount || "50%"}
                    </span>{" "}
                    on premium services
                  </p>

                  {formattedEndDate && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Ends on: {formattedEndDate}
                    </p>
                  )}
                </div>

                {/* Countdown Timer */}
                <div className="bg-tea-Green dark:bg-white/10 rounded-xl p-4 mb-4 backdrop-blur-lg border border-white/20">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-primaryRgb" />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                      Offer expires in:
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Days", value: timeLeft.days },
                      { label: "Hours", value: timeLeft.hours },
                      { label: "Minutes", value: timeLeft.minutes },
                      { label: "Seconds", value: timeLeft.seconds },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-white/10 rounded-lg p-2 text-center shadow-md backdrop-blur-lg border border-white/20"
                      >
                        <div className="text-xl md:text-2xl font-bold text-primaryRgb">
                          {String(item.value).padStart(2, "0")}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-1.5 mb-4">
                  {latestOffer?.features?.slice(0, 3).map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"
                    >
                      <div className="w-1.5 h-1.5 bg-primaryRgb rounded-full" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleViewOffer}
                    className="w-full bg-primaryRgb text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    View All Offers
                  </button>
                  <button
                    onClick={handleClose}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2.5 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferModal;
