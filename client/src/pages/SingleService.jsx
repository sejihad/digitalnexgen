import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import MarkDownWithToggle from "../components/MarkdownWithToggle.jsx";
import ServiceMediaSlider from "../components/ServiceMediaSlider";
import { hideLoading, showLoading } from "../redux/loadingSlice";
const SingleService = () => {
  const [couponCode, setCouponCode] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [offerPriceMap, setOfferPriceMap] = useState(null); // { basic, standard, premium }
  const [couponError, setCouponError] = useState("");
  const [eligibleOrders, setEligibleOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsLimit] = useState(5);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);
  const [reviewsLoadingMore, setReviewsLoadingMore] = useState(false);
  const { subCategory, id } = useParams();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);

  const [selectedPackage, setSelectedPackage] = useState("basic");
  const [selectedRating, setSelectedRating] = useState(0);
  const [description, setDescription] = useState("");
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const isLoading = useSelector((state) => state.loading.isLoading);
  const user = useSelector((state) => state.auth.user);
  const [contacting, setContacting] = useState(false);

  const [showOptions, setShowOptions] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const handleApplyCoupon = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    if (!couponCode) return;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/coupon/verify`,
        {
          code: couponCode,
          price:
            offerPriceMap?.[selectedPackage] ??
            selectedPackageDetails.salePrice,
        },
        {
          withCredentials: true,
        },
      );

      const data = res.data;

      if (data.valid) {
        setDiscountAmount(data.discountAmount);
        setIsCouponApplied(true);
        setCouponError("");
        toast.success(`✅ Coupon applied! You saved $${data.discountAmount}`);
      } else {
        setCouponError("❌ Invalid or expired coupon code.");
        setIsCouponApplied(false);
        setDiscountAmount(0);
      }
    } catch (error) {
      setCouponError("❌ Something went wrong.");
    }
  };
  // কম্পোনেন্টের বাইরে বা ভিতরে এই ফাংশনটি যোগ করুন
  const getDynamicColorFromName = (name) => {
    if (!name) return "bg-primaryRgb";

    // নামের ভিত্তিতে হিউ (Hue) জেনারেট করা
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // 0 থেকে 360 এর মধ্যে একটি হিউ ভ্যালু
    const hue = Math.abs(hash) % 360;

    // Tailwind CSS এ ডায়নামিক রঙ直接用 করা যায় না, তাই ইনলাইন স্টাইল ব্যবহার করতে হবে
    return {
      backgroundColor: `hsl(${hue}, 70%, 50%)`,
      className: "text-white",
    };
  };
  const renderReviewsList = () => {
    return reviews.length > 0 ? (
      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review._id}
            className="rounded-xl border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-start gap-3">
              {!review.userImage?.url && (
                <div
                  style={{
                    backgroundColor: getDynamicColorFromName(review.name)
                      .backgroundColor,
                  }}
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold uppercase ring-1 ring-black/10 dark:ring-white/10"
                >
                  {review.name?.charAt(0) || "A"}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {review.name || "Anonymous"}
                    </p>

                    {review.country && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        {review.country}
                      </p>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 text-xs">
                        {"★".repeat(review.star)}
                        <span className="text-gray-300 dark:text-gray-600">
                          {"☆".repeat(5 - review.star)}
                        </span>
                      </span>

                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {review.star}/5
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 text-[11px] text-gray-500 dark:text-gray-400">
                    {new Date(
                      review.reviewDate || review.createdAt,
                    ).toLocaleDateString()}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {review.desc}
                </p>
              </div>
            </div>
          </div>
        ))}

        {hasMoreReviews && (
          <div className="pt-1">
            <button
              onClick={handleLoadMoreReviews}
              disabled={reviewsLoadingMore}
              className="rounded-lg border border-black/10 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-gray-200"
            >
              {reviewsLoadingMore ? "Loading..." : "See More Reviews"}
            </button>
          </div>
        )}
      </div>
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No reviews available for this service.
      </p>
    );
  };
  const renderReviewForm = () => {
    return (
      <div className="mb-6 rounded-xl border border-black/10 bg-white/70 p-3 dark:border-white/10 dark:bg-white/5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Leave a Review
          </h3>

          <span className="text-xs text-gray-500 dark:text-gray-400">
            {eligibleOrders.length} eligible order
            {eligibleOrders.length > 1 ? "s" : ""}
          </span>
        </div>

        {isAuthenticated && eligibleOrders.length > 0 ? (
          <form onSubmit={handleReviewSubmit} className="space-y-3">
            {eligibleOrders.length > 1 && (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300">
                  Select Order
                </label>

                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20 dark:text-white"
                >
                  <option value="">Choose an order</option>

                  {eligibleOrders.map((order) => (
                    <option key={order._id} value={order._id}>
                      Order #{order._id.slice(-6)} • ${order.finalPrice}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Rating
              </p>

              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedRating(value)}
                    className={`text-xl transition ${
                      selectedRating >= value
                        ? "text-yellow-400"
                        : "text-gray-300 hover:text-yellow-400 dark:text-gray-600"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write your feedback..."
              className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-[rgb(12,187,20)] dark:border-white/10 dark:bg-black/20 dark:text-white"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="rounded-lg bg-primaryRgb px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reviewSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isAuthenticated
              ? "You can review this service after completing an order."
              : "Please sign in and complete an order to leave a review."}
          </p>
        )}
      </div>
    );
  };
  const handleOrderClick = () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
    } else {
      setShowOptions(true);
    }
  };
  const handleStripeClick = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    dispatch(showLoading());
    const basePrice =
      offerPriceMap?.[selectedPackage] ?? selectedPackageDetails.salePrice;
    const finalPrice = basePrice - discountAmount;
    const params = new URLSearchParams(window.location.search);
    const offerId = params.get("offer"); // optional offer id
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/stripe/checkout`,
        {
          title: service.title,
          name: selectedPackageDetails.name,
          serviceId: service._id,
          offerId: offerId || null,
          couponCode: isCouponApplied ? couponCode : null,
        },
        { withCredentials: true },
      );

      window.location.href = res.data.url;
    } catch (error) {
      toast("❌ Failed to create Stripe session.");
    } finally {
      dispatch(hideLoading());
    }
  };

  const handlePaypalClick = async () => {
    if (!isAuthenticated) {
      navigate("/auth/login");
      return;
    }
    dispatch(showLoading());
    const basePrice = offerPriceMap ?? selectedPackageDetails.salePrice;
    const finalPrice = basePrice - discountAmount;
    const params = new URLSearchParams(window.location.search);
    const offerId = params.get("offer"); // optional offer id
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/paypal/checkout`,
        {
          title: service.title,
          name: selectedPackageDetails.name,
          serviceId: service._id,
          offerId: offerId || null,
          couponCode: isCouponApplied ? couponCode : null,
        },
        { withCredentials: true },
      );

      const orderID = res.data.id;

      window.location.href = `https://www.paypal.com/checkoutnow?token=${orderID}`;
    } catch (err) {
      toast("❌ Failed to create PayPal order.");
    } finally {
      dispatch(hideLoading());
    }
  };
  const fetchReviews = async (page = 1, append = false) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews/${id}`,
        {
          params: {
            page,
            limit: reviewsLimit,
          },
        },
      );

      const incomingReviews = Array.isArray(res.data?.reviews)
        ? res.data.reviews
        : Array.isArray(res.data)
          ? res.data
          : [];

      if (append) {
        setReviews((prev) => {
          const merged = [...prev, ...incomingReviews];
          const unique = merged.filter(
            (item, index, arr) =>
              index === arr.findIndex((r) => r._id === item._id),
          );
          return unique;
        });
      } else {
        setReviews(incomingReviews);
      }

      if (typeof res.data?.hasMore === "boolean") {
        setHasMoreReviews(res.data.hasMore);
      } else {
        setHasMoreReviews(false);
      }
    } catch (error) {
      if (!append) {
        setReviews([]);
      }
      setHasMoreReviews(false);
    }
  };
  const handleLoadMoreReviews = async () => {
    try {
      setReviewsLoadingMore(true);
      const nextPage = reviewsPage + 1;
      await fetchReviews(nextPage, true);
      setReviewsPage(nextPage);
    } finally {
      setReviewsLoadingMore(false);
    }
  };
  useEffect(() => {
    const fetchServiceDetails = async () => {
      dispatch(showLoading());
      try {
        const serviceResponse = await axios.get(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/services/single-service/${id}`,
        );
        setService(serviceResponse.data);

        // If coming from offers page, try to apply the offer price override
        try {
          const params = new URLSearchParams(window.location.search);
          const offerId = params.get("offer");
          if (offerId) {
            let off = null;
            try {
              const o = await axios.get(
                `${
                  import.meta.env.VITE_API_BASE_URL
                }/api/promotional-offers/${offerId}`,
              );
              off = o.data;
            } catch {
              // fallback to list
              try {
                const list = await axios.get(
                  `${import.meta.env.VITE_API_BASE_URL}/api/promotional-offers`,
                );
                off = (list.data || []).find(
                  (x) => String(x._id) === String(offerId),
                );
              } catch {}
            }
            if (off) {
              const svcId =
                (off.serviceId && (off.serviceId._id || off.serviceId)) ||
                off.service?._id;
              const now = Date.now();
              const notExpired = off.endDate
                ? new Date(off.endDate).getTime() > now
                : true;
              if (String(svcId) === String(id) && notExpired) {
                if (
                  off.offerPrices &&
                  (off.offerPrices.basic ||
                    off.offerPrices.standard ||
                    off.offerPrices.premium)
                ) {
                  setOfferPriceMap({
                    basic:
                      typeof off.offerPrices.basic === "number"
                        ? off.offerPrices.basic
                        : undefined,
                    standard:
                      typeof off.offerPrices.standard === "number"
                        ? off.offerPrices.standard
                        : undefined,
                    premium:
                      typeof off.offerPrices.premium === "number"
                        ? off.offerPrices.premium
                        : undefined,
                  });
                } else if (typeof off.offerPrice === "number") {
                  // apply same price to all packages
                  setOfferPriceMap({
                    basic: off.offerPrice,
                    standard: off.offerPrice,
                    premium: off.offerPrice,
                  });
                }
              }
            }
          }
        } catch {
          /* ignore offer override errors */
        }
      } catch (error) {
      } finally {
        dispatch(hideLoading());
      }
    };

    if (isAuthenticated && user && id) {
      axios
        .get(
          `${import.meta.env.VITE_API_BASE_URL}/api/orders/review-eligible/service/${id}`,
          {
            withCredentials: true,
          },
        )
        .then((res) => {
          const orders = res.data?.orders || [];
          setEligibleOrders(orders);

          if (orders.length === 1) {
            setSelectedOrderId(orders[0]._id);
          } else {
            setSelectedOrderId("");
          }
        })
        .catch(() => {
          setEligibleOrders([]);
          setSelectedOrderId("");
        });
    } else {
      setEligibleOrders([]);
      setSelectedOrderId("");
    }
    fetchServiceDetails();
    setReviewsPage(1);
    fetchReviews(1, false);
  }, [subCategory, id, user, isAuthenticated, dispatch]);

  if (!service) {
    return (
      <div className="text-gray-400 text-center mt-10">
        Loading service details...
      </div>
    );
  }

  const selectedPackageDetails = service.packages.find(
    (pkg) => pkg.name.toLowerCase() === selectedPackage,
  );

  const handleContactClick = async (event) => {
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(location.pathname + location.search);
      navigate(`/auth/login?redirect=${redirect}`);
      return;
    }
    event.stopPropagation();
    // Use redux user (more reliable) instead of localStorage
    const buyerId = user?._id || user?.id;
    // Try multiple fields for seller/admin id depending on service payload
    const adminId =
      service?.userId ||
      service?.user?._id ||
      service?.sellerId ||
      service?.seller?._id ||
      service?.ownerId;

    if (!buyerId) {
      toast.error("User not found. Please login again.");
      navigate("/auth/login");
      return;
    }
    if (!adminId) {
      toast.error("Seller information unavailable for this service.");
      return;
    }

    // Guard: prevent starting a conversation with yourself
    if (String(buyerId) === String(adminId)) {
      toast.info("You cannot contact yourself about your own service.");
      return;
    }

    // disable button while creating to avoid duplicate requests
    setContacting(true);
    try {
      // Debug: log payload in dev to help diagnose
      if (import.meta.env.DEV) {
      }
      // POST will either return existing conversation (200) or create new (201)
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/conversations`,
        {
          buyerId,
          adminId,
          serviceId: service._id,
          serviceTitle: service.title,
        },
        { withCredentials: true },
      );

      if (response?.data?._id) {
        toast.success("Opening conversation...");
        // Persist gig card locally for this conversation
        try {
          const convId = response.data._id;
          const key = `conv_gigs_${convId}`;
          const prev = JSON.parse(localStorage.getItem(key) || "[]");
          const item = {
            serviceId: service._id,
            title: service.title,
            subCategory: service.subCategory,
            coverImage: service.coverImage?.url,
            savedAt: Date.now(),
          };
          const merged = [
            item,
            ...prev.filter(
              (g) => String(g.serviceId) !== String(item.serviceId),
            ),
          ];
          localStorage.setItem(key, JSON.stringify(merged));
        } catch (err) {
          void err;
        }
        // Persist on server as well
        try {
          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/conversations/${
              response.data._id
            }/attach-service`,
            {
              serviceId: service._id,
              title: service.title,
              subCategory: service.subCategory,
              coverImage: service.coverImage?.url,
            },
            { withCredentials: true },
          );
        } catch (err) {
          void err;
        }
        // navigate(`/messages/${response.data._id}`, {
        //   state: { serviceId: service._id, serviceTitle: service.title },
        // });
        navigate("/chat");
      } else {
        // fallback: sometimes controller returns the conversation without _id structure
        toast.success("Conversation ready");
        const id = response.data._id || response.data.id || response.data;
        try {
          const key = `conv_gigs_${id}`;
          const prev = JSON.parse(localStorage.getItem(key) || "[]");
          const item = {
            serviceId: service._id,
            title: service.title,
            subCategory: service.subCategory,
            coverImage: service.coverImage?.url,
            savedAt: Date.now(),
          };
          const merged = [
            item,
            ...prev.filter(
              (g) => String(g.serviceId) !== String(item.serviceId),
            ),
          ];
          localStorage.setItem(key, JSON.stringify(merged));
        } catch (err) {
          void err;
        }
        // Persist on server as well
        try {
          await axios.post(
            `${
              import.meta.env.VITE_API_BASE_URL
            }/api/conversations/${id}/attach-service`,
            {
              serviceId: service._id,
              title: service.title,
              subCategory: service.subCategory,
              coverImage: service.coverImage?.url,
            },
            { withCredentials: true },
          );
        } catch (err) {
          void err;
        }
        // navigate(`/messages/${id}`, {
        //   state: { serviceId: service._id, serviceTitle: service.title },
        // });
        navigate("/chat");
      }
    } catch (error) {
      const serverMsg = error?.response?.data?.message || error?.message;
      toast.error(serverMsg || "Failed to open conversation. Try again later.");
    } finally {
      setContacting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOrderId) {
      toast.error("Please select an eligible order first.");
      return;
    }

    if (selectedRating === 0 || !description.trim()) {
      toast.error("Please provide both a rating and description.");
      return;
    }

    try {
      setReviewSubmitting(true);

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews`,
        {
          orderId: selectedOrderId,
          star: selectedRating,
          desc: description.trim(),
        },
        { withCredentials: true },
      );

      setSelectedRating(0);
      setDescription("");
      toast.success("Review submitted successfully.");

      // submitted order remove from eligible list
      const updatedEligibleOrders = eligibleOrders.filter(
        (order) => order._id !== selectedOrderId,
      );

      setEligibleOrders(updatedEligibleOrders);
      setSelectedOrderId(
        updatedEligibleOrders.length === 1 ? updatedEligibleOrders[0]._id : "",
      );

      // refresh reviews
      setReviewsPage(1);
      await fetchReviews(1, false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "An error occurred while submitting your review.",
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <section className="max-w-[1440px] w-11/12 mx-auto p-6 bg-light-bg dark:bg-[#1e1e1e] rounded-md mt-4">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* =======================
          LEFT (Desktop main)
          ======================= */}
        <div className="lg:w-2/3">
          {/* Title + Stars */}
          <h1 className="text-xl md:text-3xl font-bold primaryText dark:text-gray-200 mb-4">
            {service.title}
          </h1>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
            <span className="inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-1 font-medium text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300">
              ★ {Number(service.averageStars || 0).toFixed(1)}
            </span>

            <span className="inline-flex items-center rounded-full bg-black/5 px-2.5 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">
              {service.starNumber || 0} Reviews
            </span>

            <span className="inline-flex items-center rounded-full bg-black/5 px-2.5 py-1 text-gray-700 dark:bg-white/10 dark:text-gray-300">
              {service.sales || 0} Sales
            </span>
          </div>
          {/* Slider */}
          <div className="mb-6">
            <ServiceMediaSlider
              mediaList={[
                ...(service.coverImage ? [service.coverImage] : []),
                ...(service.otherImages || []),
              ]}
              videoUrl={service.videoUrl}
            />
          </div>

          {/* ✅ Desktop ONLY: Description + Features + Reviews (আগের মতোই left এ থাকবে) */}
          <div className="hidden lg:block">
            {/* Description */}
            <h2 className="text-xl font-semibold dark:text-gray-300 mt-6 mb-4">
              About This Service
            </h2>

            <MarkDownWithToggle content={service.desc} limit={500} />

            <div className="flex flex-wrap gap-2 mt-4 mb-3">
              <span className="px-2 py-1 bg-red-600 text-white rounded-md text-xs">
                Category: {service.category}
              </span>
              <span className="px-2 py-1 bg-gray-600 text-white rounded-md text-xs">
                Subcategory: {service.subCategory}
              </span>
            </div>

            {service.shortDesc && (
              <div>
                <MarkDownWithToggle content={service.shortDesc} limit={1000} />
              </div>
            )}

            {service.features?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold dark:text-gray-300 mb-2">
                  Features:
                </h3>
                <ul className="list-none ml-6 dark:text-gray-300 space-y-1">
                  {service.features.map((feature, index) => (
                    <li key={index}>
                      <MarkDownWithToggle content={feature} limit={500} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Reviews */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-2">
                Reviews:
              </h3>

              {isAuthenticated &&
                eligibleOrders.length > 0 &&
                renderReviewForm()}

              {renderReviewsList()}
            </div>
          </div>
        </div>

        {/* =======================
          RIGHT (Pricing)
          ======================= */}
        <div className="lg:w-[30%]">
          <div className="lg:sticky lg:top-10">
            <div className="p-6 rounded-md border bg-white text-gray-800 border-gray-200 dark:bg-white/10 dark:text-gray-100 dark:border-gray-700">
              <div className="flex justify-between mb-6">
                {["basic", "standard", "premium"].map((pkg) => (
                  <button
                    key={pkg}
                    className={`flex-1 text-center py-2 rounded-md mx-1 font-semibold text-sm transition-all duration-300 ${
                      selectedPackage === pkg
                        ? "bg-primaryRgb text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-primaryRgb hover:text-white dark:bg-gray-700 dark:text-gray-300"
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    {pkg.charAt(0).toUpperCase() + pkg.slice(1)}
                  </button>
                ))}
              </div>

              <div className="text-gray-700 dark:text-gray-300">
                {selectedPackageDetails ? (
                  <>
                    <h3 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      {selectedPackageDetails.name} Package
                    </h3>

                    <MarkDownWithToggle
                      content={selectedPackageDetails.desc}
                      limit={500}
                    />

                    <p className="text-xl md:text-2xl font-bold text-primaryRgb mb-2">
                      {(offerPriceMap?.[selectedPackage] ??
                        selectedPackageDetails.salePrice) > 0 ? (
                        <>
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                            ${selectedPackageDetails.regularPrice || "N/A"}
                          </span>{" "}
                          <span className="text-primaryRgb font-semibold">
                            {offerPriceMap?.[selectedPackage] ??
                              selectedPackageDetails.salePrice ??
                              "N/A"}
                          </span>
                        </>
                      ) : (
                        <span className="text-red-500 font-medium">
                          ${selectedPackageDetails.regularPrice || "N/A"}
                        </span>
                      )}
                    </p>

                    <p className="mb-4">
                      Revisions:{" "}
                      {selectedPackageDetails.revisionNumber || "N/A"}
                    </p>
                    <p className="mb-6">
                      Delivery Time:{" "}
                      {selectedPackageDetails.deliveryTime || "N/A"} days
                    </p>

                    {!isCouponApplied && (
                      <div className="mb-4">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter Coupon Code"
                          className="w-full p-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primaryRgb dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                        />
                        <button
                          onClick={handleApplyCoupon}
                          className="mt-2 bg-primaryRgb text-white py-2 px-4 rounded-md hover:opacity-90"
                        >
                          Apply Coupon
                        </button>
                      </div>
                    )}

                    <p className="text-lg text-gray-900 dark:text-gray-100">
                      Final Price:{" "}
                      <span className="font-bold text-primaryRgb">
                        $
                        {(
                          (offerPriceMap?.[selectedPackage] ??
                            selectedPackageDetails.salePrice) - discountAmount
                        ).toFixed(2)}
                      </span>
                    </p>

                    {couponError && (
                      <p className="text-red-400 mt-2">{couponError}</p>
                    )}

                    <div className="relative">
                      <button
                        onClick={handleOrderClick}
                        className="bg-primaryRgb text-sm md:text-base text-white py-2 px-4 rounded-md w-full mb-3 hover:opacity-90 transition-all"
                      >
                        Order Now
                      </button>

                      {showOptions && (
                        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                          <div className="bg-gray-900 text-gray-100 rounded-2xl p-6 md:p-8 shadow-2xl w-11/12 max-w-md mx-auto">
                            <h2 className="text-xl md:text-2xl font-bold text-center text-white mb-6">
                              Choose a Payment Method
                            </h2>
                            <div className="flex flex-col space-y-4">
                              <button
                                onClick={handleStripeClick}
                                disabled={isLoading}
                                className="bg-white text-black font-semibold py-3 rounded-lg hover:bg-white-400 transition-all shadow-md"
                              >
                                {isLoading
                                  ? "Payment Processing..."
                                  : " 💳 Pay with Card or Others"}
                              </button>
                              <button
                                onClick={handlePaypalClick}
                                disabled={isLoading}
                                className="bg-green-500 text-white font-semibold py-3 rounded-lg hover:bg-green-600 transition-all shadow-md"
                              >
                                {isLoading
                                  ? "Payment Processing..."
                                  : "🅿️ Pay with PayPal"}
                              </button>
                              <button
                                onClick={() => setShowOptions(false)}
                                className="text-gray-400 text-sm hover:text-white hover:underline mt-2 text-center"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      className={`bg-gray-700 text-sm md:text-base text-gray-300 py-2 px-4 rounded-md w-full transition-all ${
                        contacting
                          ? "opacity-60 cursor-not-allowed"
                          : "hover:bg-gray-600"
                      }`}
                      onClick={handleContactClick}
                      disabled={contacting}
                      aria-busy={contacting}
                    >
                      {contacting
                        ? "Opening conversation..."
                        : "Contact With Us"}
                    </button>
                  </>
                ) : (
                  <p className="text-gray-400">Package details unavailable.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =======================
        ✅ MOBILE ONLY: Description + Features + Reviews (Pricing এর পরে দেখাবে)
        ======================= */}
      <div className="lg:hidden mt-8">
        {/* Description */}
        <h2 className="text-xl font-semibold dark:text-gray-300 mt-6 mb-4">
          About This Service
        </h2>

        <MarkDownWithToggle content={service.desc} limit={500} />

        <div className="flex flex-wrap gap-2 mt-4 mb-3">
          <span className="px-2 py-1 bg-red-600 text-white rounded-md text-xs">
            Category: {service.category}
          </span>
          <span className="px-2 py-1 bg-gray-600 text-white rounded-md text-xs">
            Subcategory: {service.subCategory}
          </span>
        </div>

        {service.shortDesc && (
          <div>
            <MarkDownWithToggle content={service.shortDesc} limit={1000} />
          </div>
        )}

        {service.features?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold dark:text-gray-300 mb-2">
              Features:
            </h3>
            <ul className="list-none ml-6 dark:text-gray-300 space-y-1">
              {service.features.map((feature, index) => (
                <li key={index}>
                  <MarkDownWithToggle content={feature} limit={500} />
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-2">
            Reviews:
          </h3>

          {isAuthenticated && eligibleOrders.length > 0 && renderReviewForm()}

          {renderReviewsList()}
        </div>
      </div>
    </section>
  );
};

export default SingleService;
