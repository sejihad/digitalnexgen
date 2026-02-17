import dotenv from "dotenv";
import ServiceOrder from "../models/order.model.js";
import User from "../models/user.model.js";
import { calculateFinalPrice } from "../utils/calculateFinalPrice.js";

import paypal from "@paypal/checkout-server-sdk";

dotenv.config();

// PayPal Client
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET,
);
const client = new paypal.core.PayPalHttpClient(environment);

// Create PayPal Checkout Session
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { title, offerId, couponCode, name, serviceId } = req.body;

    if (!serviceId || !name || !title) {
      return res
        .status(400)
        .json({ message: "serviceId, name, and title are required" });
    }

    // 1️⃣ Calculate final price
    const pricing = await calculateFinalPrice({
      serviceId,
      name,
      couponCode,
      offerId,
    });

    // 2️⃣ Create PayPal Order
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: pricing.finalPrice.toFixed(2),
          },
          custom_id: JSON.stringify({
            serviceId,
            offerId: offerId || "",
            couponCode: couponCode || "",
            servicePrice: pricing.servicePrice,
            offerPrice: pricing.offer.offerPrice || "",
            offerTitle: pricing.offer.offerTitle || "",
            finalPrice: pricing.finalPrice,
            name,
            title,
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

    res.status(200).json({ id: order.result.id });
  } catch (err) {
    next(err);
  }
};

// Capture PayPal Order
export const capturePaypalOrder = async (req, res) => {
  const { orderID } = req.body;

  try {
    // 1️⃣ Capture Payment
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await client.execute(request);

    const purchase = capture.result.purchase_units[0];
    const transactionId = purchase.payments.captures[0].id;

    // 2️⃣ Parse metadata
    const metadata = JSON.parse(purchase.custom_id);
    const {
      serviceId,
      offerId,
      couponCode,
      servicePrice,
      offerPrice,
      offerTitle,
      finalPrice,
      name,
      title,
    } = metadata;

    // 3️⃣ Find User
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 4️⃣ Avoid duplicate order
    const existingOrder = await ServiceOrder.findOne({
      "payment.transactionId": transactionId,
    });
    if (existingOrder)
      return res.status(200).json({ message: "Order already created." });

    // 5️⃣ Create Order
    const newOrder = new ServiceOrder({
      service: {
        id: serviceId,
        name: title,
        type: name,
        price: Number(servicePrice),
        offer: {
          id: offerId || null,
          title: offerTitle || null,
          price: Number(offerPrice) || null,
        },
      },
      finalPrice: Number(finalPrice),
      coupon: {
        code: couponCode || null,
        discountPercent: couponCode
          ? ((servicePrice - finalPrice) / servicePrice) * 100
          : null,
        discountAmount: couponCode ? servicePrice - finalPrice : null,
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
    res.status(200).json({ message: "✅ Order saved successfully." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
