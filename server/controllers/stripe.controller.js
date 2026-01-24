import dotenv from "dotenv";
import Stripe from "stripe";
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

  // ✅ Confirm only successful payment event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // ✅ Avoid duplicate orders by checking payment_intent
      const existingOrder = await ServiceOrder.findOne({
        "payment.transactionId": session.payment_intent,
      });

      if (existingOrder) {
        return res.status(200).send("Order already created.");
      }

      // ✅ Find user from metadata
      const user = await User.findById(session.metadata.userId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      // ✅ Create new order
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
          },
        },
        finalPrice: Number(session.metadata.finalPrice),
        coupon: {
          code: session.metadata.couponCode || null,
          discountPercent:
            Number(session.metadata.couponDiscountPercent) || null,
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
    } catch (err) {
      return res.status(500).send("Internal server error");
    }
  }

  res.status(200).send("Received");
};
