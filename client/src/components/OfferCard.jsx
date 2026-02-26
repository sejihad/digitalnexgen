import axios from "axios";
import { ArrowRight, Star } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const OfferCard = ({ offer }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const imageUrl = offer?.image?.url || ""; // ✅ schema অনুযায়ী
  const hasImage = Boolean(imageUrl);

  const saveAmount = useMemo(() => {
    const a = Number(offer.originalPrice || 0);
    const b = Number(offer.offerPrice || 0);
    return Math.max(0, a - b);
  }, [offer.originalPrice, offer.offerPrice]);

  useEffect(() => {
    if (!offer.endDate) return;
    const endTime = new Date(offer.endDate).getTime();

    const tick = () => {
      const now = new Date().getTime();
      const diff = endTime - now;

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

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [offer.endDate]);

  const goToOfferService = async () => {
    const rawRef = offer.serviceId || offer.service || null;

    if (!rawRef) {
      navigate("/services");
      return;
    }

    if (typeof rawRef === "object" && rawRef !== null) {
      const svc = rawRef._id ? rawRef : rawRef.serviceId || rawRef;
      const subCategory = svc.subCategory || svc.category || "services";
      navigate(
        `/${subCategory}/${svc._id}${offer._id ? `?offer=${offer._id}` : ""}`,
      );
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/services/single-service/${rawRef}`,
      );
      const svc = res.data;
      const subCategory = svc.subCategory || svc.category || "services";
      navigate(
        `/${subCategory}/${svc._id}${offer._id ? `?offer=${offer._id}` : ""}`,
      );
    } catch {
      navigate("/services");
    }
  };

  return (
    <div className="group bg-white dark:bg-white/10 border border-gray-100 dark:border-white/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Top area */}
      <div className="relative">
        {/* Image (optional) */}
        {hasImage ? (
          <img
            src={imageUrl}
            alt={offer.title}
            className="w-full h-77 "
            loading="lazy"
          />
        ) : (
          <div className="w-full h-44 bg-gradient-to-r from-green-100 to-tea-Green dark:from-white/10 dark:to-white/5" />
        )}

        {/* Badge */}
        {offer.badge && (
          <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-black/40 text-gray-700 dark:text-white border border-white/30">
            {offer.badge}
          </div>
        )}

        {/* Discount pill */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primaryRgb text-white shadow-md">
          {offer.discount}
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
          {saveAmount > 0 && (
            <div className="px-3 py-2 rounded-xl bg-green-600 text-white shadow-md">
              <div className="text-[10px] uppercase tracking-wider font-semibold">
                You Save
              </div>
              <div className="text-lg font-black">${saveAmount}</div>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-lg md:text-xl font-extrabold text-gray-800 dark:text-white leading-snug mb-2">
          {offer.title}
        </h3>

        {offer.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-2">
            {offer.description}
          </p>
        )}

        {/* Countdown (compact & clean) */}
        <div className="bg-green-50 dark:bg-gray-700/40 rounded-xl p-3 mb-4 border border-green-200 dark:border-gray-600">
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hrs", value: timeLeft.hours },
              { label: "Min", value: timeLeft.minutes },
              { label: "Sec", value: timeLeft.seconds },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-white/10 rounded-lg p-2 text-center border border-white/20"
              >
                <div className="text-base md:text-lg font-black text-primaryRgb">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="px-3 py-2 rounded-xl  border border-white/30 mb-2 w-full text-center">
          <div className="text-[10px] uppercase  tracking-wider text-gray-600 dark:text-gray-200 font-semibold">
            Offer Price
          </div>
          <div className="text-lg font-black text-primaryRgb">
            ${offer.offerPrice}
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-300 ml-2 line-through">
              ${offer.originalPrice}
            </span>
          </div>
        </div>
        {/* Features */}
        {Array.isArray(offer.features) && offer.features.length > 0 && (
          <div className="mb-4">
            <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              What's Included
            </div>

            <ul className="space-y-2">
              {offer.features.slice(0, 4).map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200"
                >
                  <Star
                    className="w-4 h-4 text-primaryRgb flex-shrink-0 mt-0.5"
                    fill="currentColor"
                  />
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
              {offer.features.length > 4 && (
                <li className="text-xs text-gray-500 dark:text-gray-400 pl-6">
                  +{offer.features.length - 4} more...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={goToOfferService}
          className="w-full bg-primaryRgb text-white py-3 rounded-xl font-bold text-sm md:text-base hover:opacity-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
        >
          <span>Claim This Offer</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

OfferCard.propTypes = {
  offer: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    discount: PropTypes.string.isRequired,
    badge: PropTypes.string,
    offerPrice: PropTypes.number.isRequired,
    originalPrice: PropTypes.number.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
    endDate: PropTypes.string.isRequired,
    image: PropTypes.shape({
      url: PropTypes.string,
      public_id: PropTypes.string,
    }),
    serviceId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    service: PropTypes.object,
  }).isRequired,
};

export default OfferCard;
