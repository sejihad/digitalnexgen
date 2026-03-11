import { sendNotify } from "../services/notify.service.js";
import sendEmail from "./sendEmail.js";

const formatOfferFeatures = (features = []) => {
  if (!Array.isArray(features) || features.length === 0) return "";
  return features.map((item, index) => `${index + 1}. ${item}`).join("\n");
};

export const sendOrderCreatedUpdates = async (order) => {
  const userEmail = order?.user?.email || "";
  const serviceName = order?.service?.name || "Your service";
  const serviceType = order?.service?.type || "";
  const finalPrice = order?.finalPrice ?? "";
  const orderId = order?._id ? String(order._id) : "";
  const offer = order?.service?.offer || null;

  // 1) User email only
  if (userEmail) {
    let userMessage = `Your order has been created successfully.\n\nService: ${serviceName}`;

    if (serviceType) {
      userMessage += `\nType: ${serviceType}`;
    }

    if (finalPrice !== "") {
      userMessage += `\nFinal Price: $${finalPrice}`;
    }

    if (orderId) {
      userMessage += `\nOrder ID: ${orderId}`;
    }

    if (offer) {
      if (offer.description) {
        userMessage += `\n\nOffer Description:\n${offer.description}`;
      }

      if (Array.isArray(offer.features) && offer.features.length > 0) {
        userMessage += `\n\nOffer Features:\n${formatOfferFeatures(offer.features)}`;
      }
    }

    await sendEmail({
      email: userEmail,
      subject: "Your order has been created",
      message: userMessage,
    });
  }

  // 2) Admin email to SMTP_MAIL
  if (process.env.SMTP_MAIL) {
    let adminMessage = `A new order has been created.\n\nService: ${serviceName}`;

    if (serviceType) {
      adminMessage += `\nType: ${serviceType}`;
    }

    if (finalPrice !== "") {
      adminMessage += `\nFinal Price: $${finalPrice}`;
    }

    if (orderId) {
      adminMessage += `\nOrder ID: ${orderId}`;
    }

    if (order?.user?.name) {
      adminMessage += `\nCustomer: ${order.user.name}`;
    }

    if (order?.user?.email) {
      adminMessage += `\nCustomer Email: ${order.user.email}`;
    }

    await sendEmail({
      email: process.env.SMTP_MAIL,
      subject: "New order created",
      message: adminMessage,
    });
  }

  // 3) Admin notification only
  await sendNotify({
    title: "New Order Created",
    message: `${serviceName} order has been created successfully.`,
    type: "order",
    link: "/admin/orders",
    adminsOnly: true,
  });
};
