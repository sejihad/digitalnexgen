import axios from "axios";
import { ArrowRight, Star } from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const OfferCard = ({ offer }) => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Individual countdown timer for this offer
  useEffect(() => {
    if (!offer.endDate) return;

    const offerEndTime = new Date(offer.endDate).getTime();

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = offerEndTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [offer.endDate]);

  return (
    <div className="group relative overflow-hidden transition-transform shadow-[0_.14px_2.29266px_rgba(0,0,0,0.03),_0_.37px_4.42626px_rgba(0,0,0,0.047),_0_3px_7px_rgba(0,0,0,0.09)] duration-300 transform hover:-translate-y-2 bg-white rounded-2xl  border border-gray-100 flex flex-col dark:bg-white/10 dark:border-white/20 dark:shadow-xl md:col-2 dis">
      {/* Badge */}
      {/* <div className="absolute top-0 right-1 bg-green-400 text-white px-1  py-1 rounded-full text-[8px] font-bold uppercase tracking-wide z-10 shadow-lg">
        {offer.badge}
      </div> */}

      {/* Discount Banner */}
      <div className="bg-gradient-to-r dark:border dark:border-teal-50 shadow-[0_.14px_2.29266px_rgba(0,0,0,0.03),_0_.37px_4.42626px_rgba(0,0,0,0.047),_0_3px_7px_rgba(0,0,0,0.09)] border border-green-400 text-gray-700  dark:text-white text-center py-4">
        <p className="text-xl  font-extrabold  tracking-wide">
          {offer.discount}
        </p>
      </div>

      {/* Card Content */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-500  dark:text-white mb-4 text-center leading-tight">
          {offer.title}
        </h3>

        {/* Individual Countdown Timer */}
        <div className="bg-green-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4 border border-green-200 dark:border-gray-600">
          {/* <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-3.5 h-3.5 text-primaryRgb" />
            <span className="text-[10px] font-semibold text-gray-700 dark:text-gray-200">
              Ends in:
            </span>
          </div> */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hrs", value: timeLeft.hours },
              { label: "Min", value: timeLeft.minutes },
              { label: "Sec", value: timeLeft.seconds },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-white/10 rounded-md p-1.5 text-center shadow-sm"
              >
                <div className="text-base font-bold text-primaryRgb">
                  {String(item.value).padStart(2, "0")}
                </div>
                <div className="text-[9px] text-gray-500 dark:text-gray-400 uppercase">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="text-center mb-5 pb-4 border-b-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-baseline justify-center gap-2 mb-1">
            <span className="text-4xl font-black text-primaryRgb">
              ${offer.offerPrice}
            </span>
            <div className="flex flex-col items-start">
              <span className="text-sm text-gray-400 line-through font-medium">
                ${offer.originalPrice}
              </span>
              <span className="text-xs text-green-600 dark:text-green-400 font-bold">
                Save ${offer.originalPrice - offer.offerPrice}
              </span>
            </div>
          </div>
        </div>
        {/* Features */}
        <div className="flex-grow mb-5">
          <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 text-center">
            What&apos;s Included
          </h4>
          <ul className="space-y-2">
            {offer.features.map((feature, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-gray-700 dark:text-gray-200"
              >
                <Star
                  className="w-4 h-4 text-primaryRgb flex-shrink-0 mt-0.5"
                  fill="currentColor"
                />
                <span className="text-sm leading-relaxed font-medium">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <button
          onClick={async () => {
            // Try to navigate to the linked service if available.
            // serviceRef can be a string id or a populated object (due to .populate('serviceId')).
            const rawRef = offer.serviceId || offer.service || null;
            if (!rawRef) {
              navigate("/services");
              return;
            }
            // If populated object, use it directly
            if (typeof rawRef === "object" && rawRef !== null) {
              const svc = rawRef._id ? rawRef : rawRef.serviceId || rawRef;
              const subCategory = svc.subCategory || svc.category || "services";
              navigate(
                `/${subCategory}/${svc._id}${
                  offer._id ? `?offer=${offer._id}` : ""
                }`
              );
              return;
            }

            // Otherwise rawRef is assumed to be an id string — fetch the service to get subCategory
            try {
              const res = await axios.get(
                `${
                  import.meta.env.VITE_API_BASE_URL
                }/api/services/single-service/${rawRef}`
              );
              const svc = res.data;
              const subCategory = svc.subCategory || svc.category || "services";
              navigate(
                `/${subCategory}/${svc._id}${
                  offer._id ? `?offer=${offer._id}` : ""
                }`
              );
            } catch (err) {
              // fallback
              navigate("/services");
            }
          }}
          className="w-full border border-green-400 dark:border dark:border-white dark:text-white text-gray-600 py-3 rounded-lg font-bold text-base uppercase tracking-wider hover:opacity-90 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-xl"
        >
          <span>Claim This Offer</span>
          <ArrowRight
            className="w-5 h-5 group-hover:translate-x-2 transition-transform"
            strokeWidth={3}
          />
        </button>
      </div>
    </div>
  );
};

OfferCard.propTypes = {
  offer: PropTypes.shape({
    _id: PropTypes.string,
    title: PropTypes.string.isRequired,
    discount: PropTypes.string.isRequired,
    badge: PropTypes.string,
    offerPrice: PropTypes.number.isRequired,
    originalPrice: PropTypes.number.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
    endDate: PropTypes.string.isRequired,
    serviceId: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    service: PropTypes.object,
  }).isRequired,
};

export default OfferCard;
