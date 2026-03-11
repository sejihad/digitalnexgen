import dotenv from "dotenv";
import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Offer from "../models/offer.model.js";
import ServiceOrder from "../models/order.model.js";
import User from "../models/user.model.js";
import { getIO } from "../socketInstance.js";
// Stripe
import Stripe from "stripe";
import { sendNotify } from "../services/notify.service.js";
import { isUserActiveInConversation } from "../socket.js";
import { sendOrderCreatedUpdates } from "../utils/orderEventNotifications.js";
// PayPal
import paypal from "@paypal/checkout-server-sdk";

dotenv.config();
const parseJsonSafe = (value, fallback = {}) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

// PayPal client
const paypalEnv = new paypal.core.LiveEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET,
);
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnv);

/* -------------------- EXISTING: CREATE OFFER -------------------- */
export const createOffer = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res
        .status(403)
        .json({ message: "Only admins can create offers." });
    }

    const { conversationId, buyerId, gig, offerDetails } = req.body;

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res
        .status(400)
        .json({ message: "Valid conversationId is required." });
    }
    if (!buyerId || !mongoose.Types.ObjectId.isValid(buyerId)) {
      return res.status(400).json({ message: "Valid buyerId is required." });
    }
    if (!gig?.id || !mongoose.Types.ObjectId.isValid(gig.id) || !gig?.title) {
      return res
        .status(400)
        .json({ message: "gig.id and gig.title are required." });
    }
    if (
      !offerDetails?.description ||
      !offerDetails?.price ||
      !offerDetails?.deliveryTime
    ) {
      return res.status(400).json({
        message: "offerDetails (description, price, deliveryTime) required.",
      });
    }

    const newOffer = new Offer({
      conversationId,
      adminId: req.userId,
      buyerId,
      gig: {
        id: gig.id,
        title: String(gig.title || "").trim(),
        subCategory: gig.subCategory || "",
        coverImage: gig.coverImage || "",
      },
      offerDetails: {
        description: String(offerDetails.description || "").trim(),
        features: Array.isArray(offerDetails.features)
          ? offerDetails.features
          : [],
        price: Number(offerDetails.price),
        deliveryTime: Number(offerDetails.deliveryTime),
      },
    });

    const savedOffer = await newOffer.save();

    // realtime emit
    // realtime emit
    const io = getIO();
    if (io) {
      io.to(String(savedOffer.conversationId)).emit("offer:receive", {
        conversationId: String(savedOffer.conversationId),
        offer: savedOffer,
      });

      // buyer personal push
      io.to(`user:${savedOffer.buyerId}`).emit("offer:receive", {
        conversationId: String(savedOffer.conversationId),
        offer: savedOffer,
      });

      // admin panel update
      io.to("admins").emit("admin:conversation:update", {
        conversationId: String(savedOffer.conversationId),
      });
    }
    const isBuyerActiveInConversation = isUserActiveInConversation(
      savedOffer.conversationId,
      savedOffer.buyerId,
    );

    if (!isBuyerActiveInConversation) {
      await sendNotify({
        title: "New Offer",
        message: `${savedOffer.gig?.title || "A service"} offer has been sent to you`,
        users: [String(savedOffer.buyerId)],
        type: "offer",
        link: "/chat",
      });
    }

    res.status(201).json(savedOffer);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

/* -------------------- EXISTING: GET OFFERS -------------------- */
export const getOffers = async (req, res, next) => {
  try {
    const { conversationId } = req.query;

    if (conversationId) {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        return res.status(400).json({ message: "Invalid conversationId." });
      }

      const conversation = await Conversation.findById(conversationId)
        .select("customerId adminIds")
        .lean();

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found." });
      }

      const me = String(req.userId || "");
      const isCustomer = String(conversation.customerId) === me;
      const isJoinedAdmin =
        Array.isArray(conversation.adminIds) &&
        conversation.adminIds.some((a) => String(a) === me);

      if (!isCustomer && !isJoinedAdmin && !req.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const offers = await Offer.find({ conversationId }).sort({
        createdAt: 1,
      });
      return res.status(200).json(offers);
    }

    // fallback list view
    const filters = req.isAdmin ? {} : { buyerId: req.userId };

    const offers = await Offer.find(filters).sort({ createdAt: 1 });
    return res.status(200).json(offers);
  } catch (error) {
    next(error);
  }
};

/* -------------------- EXISTING: RESPOND (DECLINE ONLY RECOMMENDED) -------------------- */
export const respondToOffer = async (req, res, next) => {
  try {
    const { offerId } = req.params;
    const { status } = req.body;

    if (!["declined"].includes(status)) {
      return res.status(400).json({
        message: "Only decline is allowed here.",
      });
    }

    let query = {
      _id: offerId,
      status: "pending",
    };

    // user হলে নিজের offer decline করবে
    if (!req.isAdmin) {
      query.buyerId = req.userId;
    }

    const updatedOffer = await Offer.findOneAndUpdate(
      query,
      { $set: { status } },
      { new: true },
    );

    if (!updatedOffer) {
      return res
        .status(404)
        .json({ message: "Offer not found or already responded." });
    }
    const io = getIO();
    if (io) {
      io.to(String(updatedOffer.conversationId)).emit("offer:update", {
        conversationId: String(updatedOffer.conversationId),
        offer: updatedOffer,
      });
    }
    res.status(200).json(updatedOffer);
  } catch (error) {
    next(error);
  }
};

/* ===============================================================
   ✅ NEW: OFFER -> STRIPE CHECKOUT
   - User clicks Accept&Pay
   - Creates Stripe checkout session
   - DOES NOT mark accepted here
================================================================ */
export const createOfferStripeCheckout = async (req, res, next) => {
  try {
    if (!stripe) {
      return res
        .status(503)
        .json({ message: "Stripe not configured on server" });
    }

    if (req.isAdmin) {
      return res.status(403).json({ message: "Admin cannot pay offers." });
    }

    const { offerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({ message: "Invalid offerId." });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (String(offer.buyerId) !== String(req.userId)) {
      return res.status(403).json({ message: "Not your offer" });
    }

    if (offer.status !== "pending") {
      return res.status(400).json({
        message: `Offer already ${offer.status}`,
      });
    }

    const amount = Number(offer.offerDetails?.price || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid offer price." });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      success_url: `${process.env.CLIENT_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_BASE_URL}/payment-cancel`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Custom Offer - ${offer.gig?.title || "Gig"}`,
            },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        flow: "offer",
        offerId: String(offer._id),
        conversationId: String(offer.conversationId),
        userId: String(req.userId),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    next(err);
  }
};

/* ===============================================================
   ✅ NEW: OFFER -> PAYPAL CHECKOUT
================================================================ */
export const createOfferPaypalCheckout = async (req, res, next) => {
  try {
    if (req.isAdmin) {
      return res.status(403).json({ message: "Admin cannot pay offers." });
    }

    const { offerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({ message: "Invalid offerId." });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (String(offer.buyerId) !== String(req.userId)) {
      return res.status(403).json({ message: "Not your offer" });
    }

    if (offer.status !== "pending") {
      return res.status(400).json({
        message: `Offer already ${offer.status}`,
      });
    }

    const amount = Number(offer.offerDetails?.price || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid offer price." });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");

    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount.toFixed(2),
          },
          description: `Custom Offer - ${offer.gig?.title || "Gig"}`,
          custom_id: JSON.stringify({
            flow: "offer",
            offerId: String(offer._id),
            userId: String(req.userId),
            conversationId: String(offer.conversationId),
          }),
        },
      ],
      application_context: {
        return_url: `${process.env.CLIENT_BASE_URL}/paypal-success?offer=${offer._id}`,
        cancel_url: `${process.env.CLIENT_BASE_URL}/paypal-cancel?offer=${offer._id}`,
      },
    });

    const order = await paypalClient.execute(request);
    const approve = (order.result.links || []).find((l) => l.rel === "approve");

    return res.status(200).json({
      url: approve?.href,
      id: order.result.id,
    });
  } catch (err) {
    next(err);
  }
};

/* ===============================================================
   ✅ NEW: OFFER -> PAYPAL CAPTURE
   - frontend returns from PayPal and calls this with orderID
   - payment confirmed => create order + set offer accepted
================================================================ */
export const captureOfferPaypalOrder = async (req, res, next) => {
  try {
    if (req.isAdmin) {
      return res.status(403).json({ message: "Admin cannot capture offers." });
    }

    const { orderID } = req.body;
    if (!orderID) {
      return res.status(400).json({ message: "orderID is required." });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await paypalClient.execute(request);

    const purchase = capture?.result?.purchase_units?.[0];
    const capturedPayment = purchase?.payments?.captures?.[0];
    const transactionId = capturedPayment?.id;
    const captureStatus = capturedPayment?.status;

    if (!transactionId) {
      return res.status(400).json({ message: "PayPal capture failed." });
    }

    if (captureStatus !== "COMPLETED") {
      return res.status(400).json({ message: "PayPal payment not completed." });
    }

    const meta = purchase?.custom_id
      ? parseJsonSafe(purchase.custom_id, {})
      : {};

    if (meta.flow !== "offer" || !meta.offerId) {
      return res.status(400).json({ message: "Not an offer payment." });
    }

    const offer = await Offer.findById(meta.offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found." });
    }

    if (String(offer.buyerId) !== String(req.userId)) {
      return res.status(403).json({ message: "Not your offer." });
    }

    const existingOrder = await ServiceOrder.findOne({
      "payment.transactionId": transactionId,
    });

    if (existingOrder) {
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

      return res.status(200).json({ message: "Order already created." });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const capturedAmount = Number(purchase?.amount?.value || 0);
    const expectedAmount = Number(offer.offerDetails?.price || 0);

    if (
      !Number.isFinite(expectedAmount) ||
      Number(expectedAmount.toFixed(2)) !== Number(capturedAmount.toFixed(2))
    ) {
      return res.status(400).json({ message: "Paid amount mismatch." });
    }

    const amount = expectedAmount;

    const newOrder = new ServiceOrder({
      service: {
        id: String(offer.gig?.id || ""),
        name: String(offer.gig?.title || "Custom Offer"),
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
        method: "paypal",
        transactionId,
        status: "paid",
      },
      order_status: "pending",
      cancel_request: false,
    });

    await newOrder.save();
    await sendOrderCreatedUpdates(newOrder);

    offer.status = "accepted";
    await offer.save();

    const io = getIO();
    if (io) {
      io.to(String(offer.conversationId)).emit("offer:update", {
        conversationId: String(offer.conversationId),
        offer,
      });
    }

    return res.status(200).json({
      message: "✅ Offer paid. Order created + offer accepted.",
    });
  } catch (err) {
    next(err);
  }
};
