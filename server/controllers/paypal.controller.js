import dotenv from "dotenv";
import ServiceOrder from "../models/order.model.js";
import User from "../models/user.model.js";

import paypal from "@paypal/checkout-server-sdk";

dotenv.config();

const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { title, price, name, serviceId } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: price.toFixed(2),
          },
          custom_id: serviceId,
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
    console.error("❌ PayPal order creation failed:", err);
    next(err);
  }
};

export const capturePaypalOrder = async (req, res) => {
  const { orderID } = req.body;

  try {
    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    const capture = await client.execute(request);

    const purchase = capture.result.purchase_units[0];
    const transactionId = purchase.payments.captures[0].id;
    const serviceId = purchase.custom_id;
    const description = purchase.description;
    const amount = purchase.amount.value;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const existingOrder = await ServiceOrder.findOne({
      "payment.transactionId": transactionId,
    });

    if (existingOrder)
      return res.status(200).json({ message: "Order already created." });

    const [serviceTitle, serviceName] = description.split(" - ");

    const newOrder = new ServiceOrder({
      service: {
        id: serviceId,
        name: serviceTitle,
        type: serviceName,
        price: amount,
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
    console.error("❌ PayPal capture error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
