import dotenv from "dotenv";
import Stripe from "stripe";
import Offer from "../models/offer.model.js";
import ServiceOrder from "../models/order.model.js";
import User from "../models/user.model.js";
import { calculateFinalPrice } from "../utils/calculateFinalPrice.js";
dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
let stripe = null;
if (!stripeSecret) {
} else {
  stripe = new Stripe(stripeSecret);
}

export const createCheckoutSession = async (req, res, next) => {
  try {
    if (!stripe) {
      return res
        .status(503)
        .json({ message: "Stripe not configured on server" });
    }
    const { title, couponCode, offerId, name, serviceId } = req.body;
    if (!serviceId || !name || !title) {
      return res
        .status(400)
        .json({ message: "serviceId, name, and title are required" });
    }
    const pricing = await calculateFinalPrice({
      serviceId,
      name,
      couponCode,
      offerId,
    });
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${process.env.CLIENT_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_BASE_URL}/payment-cancel`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `${title} - ${name}` },
            unit_amount: pricing.finalPrice * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        serviceId,
        userId: req.userId,
        name,
        title,
        servicePrice: pricing.servicePrice,
        offerId: offerId || "",
        offerPrice: pricing.offer ? pricing.offer.offerPrice : "",
        offerTitle: pricing.offer ? pricing.offer.offerTitle : "",
        offerFeatures: pricing.offer
          ? JSON.stringify(pricing.offer.offerFeatures)
          : "",
        couponCode: couponCode || "",
        couponDiscountPercent: pricing.coupon
          ? pricing.coupon.discountPercent
          : "",
        couponDiscountAmount: pricing.coupon
          ? pricing.coupon.discountAmount
          : "",
        finalPrice: pricing.finalPrice,
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    next(err);
  }
};

export const stripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(503).send("Stripe not configured on server");
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).send("Missing signature");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Only successful payment event
  if (event.type !== "checkout.session.completed") {
    return res.status(200).send("Ignored");
  }

  const session = event.data.object;

  try {
    // ✅ shared duplicate protection (normal + offer)
    const existingOrder = await ServiceOrder.findOne({
      "payment.transactionId": session.payment_intent,
    });

    if (existingOrder) {
      // If offer flow and offer not accepted yet -> accept it
      if (session?.metadata?.flow === "offer" && session?.metadata?.offerId) {
        await Offer.findByIdAndUpdate(session.metadata.offerId, {
          $set: { status: "accepted" },
        }).catch(() => {});
      }
      return res.status(200).send("Order already created.");
    }

    /* =========================
       ✅ 1) OFFER FLOW
    ========================= */
    if (session?.metadata?.flow === "offer") {
      const offerId = session.metadata.offerId;
      const buyerUserId = session.metadata.userId;

      if (!offerId || !buyerUserId) {
        return res.status(400).send("Offer metadata missing.");
      }

      const offer = await Offer.findById(offerId);
      if (!offer) return res.status(404).send("Offer not found");

      // ✅ security: ensure payer is offer buyer
      if (String(offer.buyerId) !== String(buyerUserId)) {
        return res.status(403).send("Not your offer");
      }

      // declined হলে create করবে না
      if (offer.status === "declined") {
        return res.status(200).send("Offer declined previously.");
      }

      const user = await User.findById(buyerUserId);
      if (!user) return res.status(404).send("User not found");

      const amount = Number(
        session.metadata.finalPrice || offer.offerDetails?.price || 0,
      );

      const newOrder = new ServiceOrder({
        service: {
          id: String(offer.gig?.id || session.metadata.gigId || ""),
          name: String(
            offer.gig?.title || session.metadata.gigTitle || "Custom Offer",
          ),
          type: "custom",
          price: amount,
          offer: {
            id: String(offer._id),
            title: "Custom Offer",
            price: amount,
            features: offer.offerDetails?.features || [],
            description: offer.offerDetails?.description || "",
          },
        },
        finalPrice: amount,
        coupon: { code: null, discountPercent: null, discountAmount: null },
        user: {
          id: user._id,
          name: user.username,
          email: user.email,
          phone: user.phone,
        },
        payment: {
          method: "stripe",
          transactionId: session.payment_intent,
          status: "paid",
        },
        order_status: "pending",
        cancel_request: false,
      });

      await newOrder.save();

      // ✅ mark accepted ONLY after payment
      if (offer.status !== "accepted") {
        offer.status = "accepted";
        await offer.save();
      }

      return res.status(200).send("Offer order created + offer accepted.");
    }

    /* =========================
       ✅ 2) NORMAL SERVICE FLOW
    ========================= */
    const user = await User.findById(session.metadata.userId);
    if (!user) return res.status(404).send("User not found");

    const newOrder = new ServiceOrder({
      service: {
        id: session.metadata.serviceId,
        name: session.metadata.title,
        type: session.metadata.name,
        price: Number(session.metadata.servicePrice),
        offer: {
          id: session.metadata.offerId || null,
          title: session.metadata.offerTitle || null,
          price: Number(session.metadata.offerPrice) || null,
          features: session.metadata.offerFeatures
            ? JSON.parse(session.metadata.offerFeatures)
            : [],
          description: session.metadata.offerDescription || undefined,
        },
      },
      finalPrice: Number(session.metadata.finalPrice),
      coupon: {
        code: session.metadata.couponCode || null,
        discountPercent: Number(session.metadata.couponDiscountPercent) || null,
        discountAmount: Number(session.metadata.couponDiscountAmount) || null,
      },
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        phone: user.phone,
      },
      payment: {
        method: "stripe",
        transactionId: session.payment_intent,
        status: "paid",
      },
      order_status: "pending",
      cancel_request: false,
    });

    await newOrder.save();
    return res.status(200).send("Order created.");
  } catch (err) {
    return res.status(500).send("Internal server error");
  }
};
