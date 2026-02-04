import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import placeholderImg from "../assets/user.png";

import MarkDownWithToggle from "../components/MarkDownWithToggle";
import ServiceMediaSlider from "../components/ServiceMediaSlider";
import { hideLoading, showLoading } from "../redux/loadingSlice";
const SingleService = () => {
  const [couponCode, setCouponCode] = useState("");
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [offerPriceMap, setOfferPriceMap] = useState(null); // { basic, standard, premium }
  const [couponError, setCouponError] = useState("");
  const [isEligibility, SetIsEligibility] = useState(false);
  const { subCategory, id } = useParams();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
      console.error(error);
      setCouponError("❌ Something went wrong.");
    }
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
      console.error(error);
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

      window.location.href = `https://www.sandbox.paypal.com/checkoutnow?token=${orderID}`;
    } catch (err) {
      console.error(err);
      toast("❌ Failed to create PayPal order.");
    } finally {
      dispatch(hideLoading());
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

        const reviewsResponse = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/reviews/${id}`,
        );

        setReviews(reviewsResponse.data.reverse());
      } catch (error) {
        console.error("Error fetching service details or reviews:", error);
      } finally {
        dispatch(hideLoading());
      }
    };
    if (isAuthenticated && user && id) {
      axios
        .get(`${import.meta.env.VITE_API_BASE_URL}/api/orders/iseligible`, {
          params: {
            serviceId: id,
          },
          withCredentials: true,
        })
        .then((res) => {
          SetIsEligibility(res.data.eligible);
        })
        .catch((err) => {
          console.error("Eligibility check failed:", err);
        });
    }
    fetchServiceDetails();
  }, [subCategory, id, user, isAuthenticated, dispatch]);

  if (!service) {
    return (
      <div className="text-gray-400 text-center mt-10">
        Loading service details...
      </div>
    );
  }

  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

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
        navigate(`/messages/${response.data._id}`, {
          state: { serviceId: service._id, serviceTitle: service.title },
        });
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
        navigate(`/messages/${id}`, {
          state: { serviceId: service._id, serviceTitle: service.title },
        });
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      const serverMsg = error?.response?.data?.message || error?.message;
      toast.error(serverMsg || "Failed to open conversation. Try again later.");
    } finally {
      setContacting(false);
    }
  };
  const mediaList = [
    ...(service.coverImage ? [service.coverImage] : []),
    ...(service.otherImages || []),
  ];

  const renderMedia = (media) => {
    if (!media?.url) return null;
    return (
      <img
        src={media?.url}
        alt={`Service Image`}
        className="w-full h-[350px] object-cover rounded-md border border-gray-600"
      />
    );
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (selectedRating === 0 || !description) {
      toast.error("Please provide both a rating and description");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        toast.error("User information not found. Please log in again.");
        return;
      }

      const { username, img, country } = user;

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews`,
        {
          serviceId: id,
          star: selectedRating,
          desc: description,
          username,
          userImage: img,
          country,
        },
        { withCredentials: true },
      );

      setSelectedRating(0);
      setDescription("");
      // Do not prepend pending review; it will appear after admin approval
      toast.success("Review submitted and awaiting approval.");
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error(
        "An error occurred while submitting your review. Please try again.",
      );
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews/${reviewId}`,
        { withCredentials: true },
      );
      setReviews((prevReviews) =>
        prevReviews.filter((r) => r._id !== reviewId),
      );
      toast.success("Review deleted successfully!");
    } catch (error) {
      console.error("Error deleting review:", error);
      toast.error("Failed to delete review. Please try again.");
    }
  };

  return (
    <section className="max-w-[1440px] w-11/12 mx-auto p-6  bg-light-bg dark:bg-[#1e1e1e] rounded-md mt-4">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <h1 className="text-xl md:text-3xl font-bold primaryText dark:text-gray-200 mb-4">
            {service.title}
            <span className="flex items-center text-yellow-400 text-lg font-medium">
              {"★".repeat(Math.floor(service.averageStars))}
              {"☆".repeat(5 - Math.floor(service.averageStars))}
              <span className="primaryText dark:text-gray-300 ml-2">
                {service.averageStars.toFixed(1)} ({service.starNumber} Reviews)
              </span>
            </span>
          </h1>

          {/* ✅ Replace old media section with slider */}
          <div className="mb-6">
            <ServiceMediaSlider
              mediaList={[
                ...(service.coverImage ? [service.coverImage] : []),
                ...(service.otherImages || []),
              ]}
              videoUrl={service.videoUrl}
            />
          </div>

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
              <ul className="list-disc ml-6 dark:text-gray-300 space-y-1">
                {service.features.map((feature, index) => (
                  <li key={index}>
                    <div>
                      <MarkDownWithToggle content={feature} limit={500} />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-2">
              Reviews:
            </h3>
            <div className="mb-8 p-6 rounded-md border bg-white text-gray-800 border-gray-200 dark:bg-[#2b2b2b] dark:text-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200 mb-4">
                Leave a Review
              </h3>
              {isAuthenticated && isEligibility ? (
                <form onSubmit={handleReviewSubmit}>
                  <div className="flex items-center gap-4 mb-4">
                    <label
                      htmlFor="star"
                      className="text-gray-700 dark:text-gray-300"
                    >
                      Your Rating:
                    </label>
                    <div className="flex gap-1 text-yellow-400">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <label
                          key={value}
                          className="cursor-pointer flex items-center"
                          onClick={() => setSelectedRating(value)}
                        >
                          <span
                            className={`text-xl ${
                              selectedRating >= value
                                ? "text-yellow-400"
                                : "text-gray-500"
                            }`}
                          >
                            ★
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <textarea
                    name="desc"
                    rows="4"
                    className="w-full p-3 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primaryRgb dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700"
                    placeholder="Write your review..."
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>

                  <button
                    type="submit"
                    className="mt-4 bg-primaryRgb text-white py-2 px-4 rounded-md hover:opacity-90 transition-all"
                  >
                    Submit Review
                  </button>
                </form>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 ">
                  Please{" "}
                  <a
                    href="/auth/login"
                    className="text-primaryRgb hover:underline"
                  >
                    Sign In and Complete order
                  </a>{" "}
                  to leave a review.
                </p>
              )}
            </div>

            {reviews.length > 0 ? (
              <div className="flex flex-col gap-4">
                {reviews.map((review) => {
                  const storedUser = JSON.parse(localStorage.getItem("user"));

                  const isOwner =
                    storedUser?.isAdmin ||
                    storedUser?.id === review.userId ||
                    storedUser?._id === review.userId;

                  return (
                    <div
                      key={review._id}
                      className="relative group flex gap-4 p-4 rounded-md border bg-white text-gray-800 border-gray-200 dark:bg-[#2b2b2b] dark:text-gray-100 dark:border-gray-700"
                    >
                      <img
                        src={review.userImage || placeholderImg}
                        alt={`${review.username}'s Profile`}
                        className="w-12 h-12 rounded-full border border-gray-500 object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-semibold text-gray-200">
                              {review.username}{" "}
                              <span className="text-gray-400">
                                ({review.country})
                              </span>
                            </p>
                            <div className="flex items-center gap-1 text-yellow-400 text-sm">
                              {"★".repeat(review.star)}
                              {"☆".repeat(5 - review.star)}
                              <span className="text-gray-400 ml-2 text-xs">
                                {review.star}/5
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-300 mt-2 text-sm">
                          {review.desc}
                        </p>
                      </div>
                      {isOwner && (
                        <button
                          className="absolute bottom-2 right-2 bg-red-500 text-white py-1 px-2 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDeleteReview(review._id)}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400">
                No reviews available for this service.
              </p>
            )}
          </div>
        </div>

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
                    <div>
                      <MarkDownWithToggle
                        content={selectedPackageDetails.desc}
                        limit={500}
                      />
                    </div>

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

                    {/* order now  */}
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
                      {contacting ? "Opening conversation..." : "Live Chat"}
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
    </section>
  );
};

export default SingleService;
