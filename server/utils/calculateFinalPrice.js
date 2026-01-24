import Coupon from "../models/coupon.model.js";
import PromotionalOffer from "../models/promotionalOffer.model.js";
import Service from "../models/service.model.js";

export const calculateFinalPrice = async ({
  serviceId,
  name, // basic | standard | premium
  couponCode,
  offerId,
}) => {
  // 1️⃣ Fetch service
  const service = await Service.findById(serviceId);
  if (!service) throw new Error("Service not found");

  // 2️⃣ Get selected package
  const selectedPackage = service.packages.find((pkg) => pkg.name === name);
  if (!selectedPackage) throw new Error("Invalid package selected");

  // 3️⃣ MAIN PRICE (default = salePrice)
  let servicePrice = selectedPackage.salePrice;

  // Offer response data
  let offerTitle = null;
  let offerPrice = null;

  // 4️⃣ OFFER CHECK
  if (offerId) {
    const offer = await PromotionalOffer.findById(offerId);

    if (offer && offer.isActive) {
      const now = Date.now();
      const notExpired =
        !offer.endDate || new Date(offer.endDate).getTime() > now;

      if (notExpired) {
        offerTitle = offer.title;

        // ✅ Priority: package-wise offer price
        if (
          offer.offerPrices &&
          typeof offer.offerPrices[name.toLowerCase()] === "number"
        ) {
          offerPrice = offer.offerPrices[name.toLowerCase()];
        }
        // ✅ Fallback: single offer price
        else if (typeof offer.offerPrice === "number") {
          offerPrice = offer.offerPrice;
        }
      }
    }
  }

  // 5️⃣ COUPON CALCULATION (on servicePrice only)
  let discountAmount = 0;
  let discountPercent = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: new RegExp(`^${couponCode}$`, "i"),
    });

    if (coupon) {
      discountPercent = coupon.discountValue;
      discountAmount =
        ((offerPrice ? offerPrice : servicePrice) * discountPercent) / 100;
    }
  }

  // 6️⃣ FINAL PRICE
  const finalPrice = Math.max(
    (offerPrice ? offerPrice : servicePrice) - discountAmount,
    0,
  );

  // 7️⃣ RESPONSE
  return {
    servicePrice, // base price
    finalPrice, // offer offer and coupon or if not coupon or offer
    coupon: {
      discountPercent,
      discountAmount,
    },
    offer: {
      offerTitle,
      offerPrice, // null if no offer
    },
  };
};
