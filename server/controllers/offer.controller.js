import dotenv from "dotenv";
import mongoose from "mongoose";
import Offer from "../models/offer.model.js";
import ServiceOrder from "../models/order.model.js";
import User from "../models/user.model.js";

// Stripe
import Stripe from "stripe";

// PayPal
import paypal from "@paypal/checkout-server-sdk";

dotenv.config();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecret ? new Stripe(stripeSecret) : null;

// PayPal client
const paypalEnv = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET,
);
const paypalClient = new paypal.core.PayPalHttpClient(paypalEnv);

/* -------------------- EXISTING: CREATE OFFER -------------------- */
export const createOffer = async (req, res, next) => {
  console.log("called createOffer with body:", req.body);
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
    res.status(201).json(savedOffer);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

/* -------------------- EXISTING: GET OFFERS -------------------- */
export const getOffers = async (req, res, next) => {
  try {
    const filters = req.isAdmin
      ? { adminId: req.userId }
      : { buyerId: req.userId };

    if (req.query.conversationId) {
      filters.conversationId = req.query.conversationId;
    }

    // ✅ timeline-friendly oldest->newest
    const offers = await Offer.find(filters).sort({ createdAt: 1 });
    res.status(200).json(offers);
  } catch (error) {
    next(error);
  }
};

/* -------------------- EXISTING: RESPOND (DECLINE ONLY RECOMMENDED) -------------------- */
export const respondToOffer = async (req, res, next) => {
  try {
    if (req.isAdmin) {
      return res
        .status(403)
        .json({ message: "Admins cannot respond to offers." });
    }

    const { offerId } = req.params;
    const { status } = req.body;

    if (!["declined"].includes(status)) {
      return res.status(400).json({
        message: "Only decline is allowed here. Use checkout to accept.",
      });
    }

    const updatedOffer = await Offer.findOneAndUpdate(
      { _id: offerId, buyerId: req.userId, status: "pending" },
      { $set: { status } },
      { new: true },
    );

    if (!updatedOffer) {
      return res
        .status(404)
        .json({ message: "Offer not found or already responded." });
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
    if (!stripe)
      return res
        .status(503)
        .json({ message: "Stripe not configured on server" });
    if (req.isAdmin)
      return res.status(403).json({ message: "Admin cannot pay offers." });

    const { offerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({ message: "Invalid offerId." });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    if (String(offer.buyerId) !== String(req.userId)) {
      return res.status(403).json({ message: "Not your offer" });
    }
    if (offer.status !== "pending") {
      return res.status(400).json({ message: `Offer already ${offer.status}` });
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
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        flow: "offer",
        offerId: String(offer._id),
        conversationId: String(offer.conversationId),
        userId: String(req.userId),

        gigId: String(offer.gig?.id || ""),
        gigTitle: String(offer.gig?.title || ""),
        gigSubCategory: String(offer.gig?.subCategory || ""),
        gigCoverImage: String(offer.gig?.coverImage || ""),

        offerDescription: String(offer.offerDetails?.description || ""),
        offerFeatures: JSON.stringify(offer.offerDetails?.features || []),

        finalPrice: String(amount),
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
    if (req.isAdmin)
      return res.status(403).json({ message: "Admin cannot pay offers." });

    const { offerId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(offerId)) {
      return res.status(400).json({ message: "Invalid offerId." });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    if (String(offer.buyerId) !== String(req.userId)) {
      return res.status(403).json({ message: "Not your offer" });
    }
    if (offer.status !== "pending") {
      return res.status(400).json({ message: `Offer already ${offer.status}` });
    }

    const amount = Number(offer.offerDetails?.price || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid offer price." });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");

    // ✅ store minimal metadata in custom_id
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: { currency_code: "USD", value: amount.toFixed(2) },
          description: `Custom Offer - ${offer.gig?.title || "Gig"}`,
          custom_id: JSON.stringify({
            flow: "offer",
            offerId: String(offer._id),
            userId: String(req.userId),
            conversationId: String(offer.conversationId),
            finalPrice: amount,
          }),
        },
      ],
      application_context: {
        return_url: `${process.env.CLIENT_BASE_URL}/paypal-success?offer=${offer._id}`,
        cancel_url: `${process.env.CLIENT_BASE_URL}/paypal-cancel?offer=${offer._id}`,
      },
    });

    const order = await paypalClient.execute(request);

    // ✅ approval link
    const approve = (order.result.links || []).find((l) => l.rel === "approve");
    return res.status(200).json({ url: approve?.href, id: order.result.id });
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
    if (req.isAdmin)
      return res.status(403).json({ message: "Admin cannot capture offers." });

    const { orderID } = req.body;
    if (!orderID)
      return res.status(400).json({ message: "orderID is required." });

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await paypalClient.execute(request);

    const purchase = capture.result.purchase_units?.[0];
    const transactionId = purchase?.payments?.captures?.[0]?.id;
    if (!transactionId) {
      return res.status(400).json({ message: "PayPal capture failed." });
    }

    const meta = purchase?.custom_id ? JSON.parse(purchase.custom_id) : {};
    if (meta.flow !== "offer" || !meta.offerId) {
      return res.status(400).json({ message: "Not an offer payment." });
    }

    // ✅ load offer
    const offer = await Offer.findById(meta.offerId);
    if (!offer) return res.status(404).json({ message: "Offer not found." });

    if (String(offer.buyerId) !== String(req.userId)) {
      return res.status(403).json({ message: "Not your offer." });
    }

    // ✅ duplicate protection
    const existingOrder = await ServiceOrder.findOne({
      "payment.transactionId": transactionId,
    });
    if (existingOrder) {
      // ensure offer accepted if order already exists
      if (offer.status !== "accepted") {
        offer.status = "accepted";
        await offer.save();
      }
      return res.status(200).json({ message: "Order already created." });
    }

    // ✅ find user
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const amount = Number(offer.offerDetails?.price || meta.finalPrice || 0);

    // ✅ create order (offer accepted only AFTER payment)
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
      coupon: { code: null, discountPercent: null, discountAmount: null },
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

    // ✅ mark offer accepted now
    offer.status = "accepted";
    await offer.save();

    return res
      .status(200)
      .json({ message: "✅ Offer paid. Order created + offer accepted." });
  } catch (err) {
    next(err);
  }
};
