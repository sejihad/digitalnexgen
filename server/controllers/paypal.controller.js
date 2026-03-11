import paypal from "@paypal/checkout-server-sdk";
import dotenv from "dotenv";
import ServiceOrder from "../models/order.model.js";
import User from "../models/user.model.js";
import { calculateFinalPrice } from "../utils/calculateFinalPrice.js";
import { sendOrderCreatedUpdates } from "../utils/orderEventNotifications.js";

dotenv.config();

// PayPal Client
const environment = new paypal.core.LiveEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET,
);

const client = new paypal.core.PayPalHttpClient(environment);

const parseJsonSafe = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// Create PayPal Checkout Session
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { title, offerId, couponCode, name, serviceId } = req.body;

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

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: Number(pricing.finalPrice).toFixed(2),
          },
          custom_id: JSON.stringify({
            serviceId: String(serviceId),
            offerId: offerId ? String(offerId) : "",
            couponCode: couponCode ? String(couponCode) : "",
            name: String(name),
            title: String(title),
          }),
          description: `${title} - ${name}`,
        },
      ],
      application_context: {
        return_url: `${process.env.CLIENT_BASE_URL}/paypal-success`,
        cancel_url: `${process.env.CLIENT_BASE_URL}/paypal-cancel`,
      },
    });

    const order = await client.execute(request);

    return res.status(200).json({ id: order.result.id });
  } catch (err) {
    next(err);
  }
};

// Capture PayPal Order
export const capturePaypalOrder = async (req, res) => {
  const { orderID } = req.body;

  try {
    if (!orderID) {
      return res.status(400).json({ message: "orderID is required" });
    }

    // 1) Capture Payment
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await client.execute(request);

    const purchase = capture?.result?.purchase_units?.[0];
    const capturedPayment = purchase?.payments?.captures?.[0];
    const transactionId = capturedPayment?.id;

    if (!purchase || !capturedPayment || !transactionId) {
      return res.status(400).json({ message: "PayPal capture failed" });
    }

    if (capturedPayment.status !== "COMPLETED") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // 2) Parse minimal metadata
    const metadata = parseJsonSafe(purchase.custom_id, {});
    const { serviceId, offerId, couponCode, name, title } = metadata || {};

    if (!serviceId || !name || !title) {
      return res
        .status(400)
        .json({ message: "Required payment metadata missing" });
    }

    // 3) Find User
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4) Avoid duplicate order
    const existingOrder = await ServiceOrder.findOne({
      "payment.transactionId": transactionId,
    });

    if (existingOrder) {
      return res.status(200).json({ message: "Order already created." });
    }

    // 5) Recalculate price from server-side source of truth
    const pricing = await calculateFinalPrice({
      serviceId,
      name,
      couponCode: couponCode || "",
      offerId: offerId || "",
    });

    const paidAmount = Number(purchase?.amount?.value || 0);
    const expectedAmount = Number(pricing.finalPrice || 0);

    if (Number(expectedAmount.toFixed(2)) !== Number(paidAmount.toFixed(2))) {
      return res.status(400).json({ message: "Paid amount mismatch" });
    }

    // 6) Create Order
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
        method: "paypal",
        transactionId,
        status: "paid",
      },
      order_status: "pending",
      cancel_request: false,
    });

    await newOrder.save();
    await sendOrderCreatedUpdates(newOrder);

    return res.status(200).json({
      message: "✅ Order created successfully.",
    });
  } catch (err) {
    console.error("PayPal capture order creation failed:", err?.message || err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
