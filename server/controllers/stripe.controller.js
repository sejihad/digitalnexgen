import dotenv from "dotenv";
import Stripe from "stripe";
import Offer from "../models/offer.model.js";
import ServiceOrder from "../models/order.model.js";
import User from "../models/user.model.js";
import { getIO } from "../socketInstance.js";
import { calculateFinalPrice } from "../utils/calculateFinalPrice.js";
import { sendOrderCreatedUpdates } from "../utils/orderEventNotifications.js";

dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
let stripe = null;

if (stripeSecret) {
  stripe = new Stripe(stripeSecret);
}

const parseJsonSafe = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

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
            product_data: {
              name: `${title} - ${name}`,
            },
            unit_amount: pricing.finalPrice * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        serviceId: String(serviceId),
        userId: String(req.userId),
        name: String(name),
        title: String(title),
        offerId: offerId ? String(offerId) : "",
        couponCode: couponCode ? String(couponCode) : "",
      },
    });

    return res.status(200).json({ url: session.url });
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
    console.error("Stripe webhook signature error:", err?.message || err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type !== "checkout.session.completed") {
    return res.status(200).send("Ignored");
  }

  const session = event.data.object;

  try {
    if (session.payment_status !== "paid") {
      return res.status(400).send("Payment not completed.");
    }

    const paymentIntentId = session.payment_intent;
    if (!paymentIntentId) {
      return res.status(400).send("Missing payment intent.");
    }

    const existingOrder = await ServiceOrder.findOne({
      "payment.transactionId": paymentIntentId,
    });

    if (existingOrder) {
      if (session?.metadata?.flow === "offer" && session?.metadata?.offerId) {
        await Offer.findByIdAndUpdate(session.metadata.offerId, {
          $set: { status: "accepted" },
        }).catch(() => {});
      }

      return res.status(200).send("Order already created.");
    }

    /* =========================
       1) OFFER FLOW
    ========================= */
    if (session?.metadata?.flow === "offer") {
      const offerId = session.metadata.offerId;
      const buyerUserId = session.metadata.userId;

      if (!offerId || !buyerUserId) {
        return res.status(400).send("Offer metadata missing.");
      }

      const offer = await Offer.findById(offerId);
      if (!offer) {
        return res.status(404).send("Offer not found");
      }

      if (String(offer.buyerId) !== String(buyerUserId)) {
        return res.status(403).send("Not your offer");
      }

      if (offer.status === "declined") {
        return res.status(200).send("Offer declined previously.");
      }

      const user = await User.findById(buyerUserId);
      if (!user) {
        return res.status(404).send("User not found");
      }

      const offerAmount = Number(offer.offerDetails?.price || 0);
      const paidAmount = Number(session.amount_total || 0) / 100;

      if (!Number.isFinite(offerAmount) || offerAmount <= 0) {
        return res.status(400).send("Invalid offer price.");
      }

      if (Number(offerAmount.toFixed(2)) !== Number(paidAmount.toFixed(2))) {
        return res.status(400).send("Paid amount mismatch for offer.");
      }

      const newOrder = new ServiceOrder({
        service: {
          id: String(offer.gig?.id || ""),
          name: String(offer.gig?.title || "Custom Offer"),
          type: "custom",
          price: offerAmount,
          offer: {
            id: String(offer._id),
            title: "Custom Offer",
            price: offerAmount,
            features: offer.offerDetails?.features || [],
            description: offer.offerDetails?.description || "",
          },
        },
        finalPrice: offerAmount,
        coupon: {
          code: null,
          discountPercent: null,
          discountAmount: null,
        },
        user: {
          id: user._id,
          name: user.username,
          email: user.email,
          phone: user.phone,
        },
        payment: {
          method: "stripe",
          transactionId: paymentIntentId,
          status: "paid",
        },
        order_status: "pending",
        cancel_request: false,
      });

      await newOrder.save();
      await sendOrderCreatedUpdates(newOrder);

      if (offer.status !== "accepted") {
        offer.status = "accepted";
        await offer.save();

        const io = getIO();
        if (io) {
          io.to(String(offer.conversationId)).emit("offer:update", {
            conversationId: String(offer.conversationId),
            offer,
          });
        }
      }

      return res.status(200).send("Offer order created + offer accepted.");
    }

    /* =========================
       2) NORMAL SERVICE FLOW
    ========================= */
    const userId = session.metadata?.userId;
    const serviceId = session.metadata?.serviceId;
    const name = session.metadata?.name;
    const title = session.metadata?.title;
    const offerId = session.metadata?.offerId || "";
    const couponCode = session.metadata?.couponCode || "";

    if (!userId || !serviceId || !name || !title) {
      return res.status(400).send("Required metadata missing.");
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const pricing = await calculateFinalPrice({
      serviceId,
      name,
      couponCode,
      offerId,
    });

    const paidAmount = Number(session.amount_total || 0) / 100;
    const expectedAmount = Number(pricing.finalPrice || 0);

    if (Number(expectedAmount.toFixed(2)) !== Number(paidAmount.toFixed(2))) {
      return res.status(400).send("Paid amount mismatch.");
    }

    const newOrder = new ServiceOrder({
      service: {
        id: String(serviceId),
        name: String(title),
        type: String(name),
        price: Number(pricing.servicePrice),
        offer: {
          id: offerId || null,
          title: pricing.offer?.offerTitle || null,
          price: Number(pricing.offer?.offerPrice) || null,
          features: Array.isArray(pricing.offer?.offerFeatures)
            ? pricing.offer.offerFeatures
            : [],
          description: pricing.offer?.offerDescription || undefined,
        },
      },
      finalPrice: Number(pricing.finalPrice),
      coupon: {
        code: couponCode || null,
        discountPercent: Number(pricing.coupon?.discountPercent) || null,
        discountAmount: Number(pricing.coupon?.discountAmount) || null,
      },
      user: {
        id: user._id,
        name: user.username,
        email: user.email,
        phone: user.phone,
      },
      payment: {
        method: "stripe",
        transactionId: paymentIntentId,
        status: "paid",
      },
      order_status: "pending",
      cancel_request: false,
    });

    await newOrder.save();
    await sendOrderCreatedUpdates(newOrder);

    return res.status(200).send("Order created.");
  } catch (err) {
    console.error("Stripe webhook order creation failed:", err?.message || err);
    return res.status(500).send("Internal server error");
  }
};
