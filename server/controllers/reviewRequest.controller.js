import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Order from "../models/order.model.js";
import ReviewRequest from "../models/reviewRequest.model.js";
import { sendNotify } from "../services/notify.service.js";
import { isUserActiveInConversation } from "../socket.js";
import { getIO } from "../socketInstance.js";
const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id));

export const createOrResendReviewRequest = async (req, res, next) => {
  try {
    if (!req.isAdmin) {
      return res
        .status(403)
        .json({ message: "Only admin can send review requests." });
    }

    const { conversationId, orderId } = req.body || {};

    if (!conversationId || !isValidId(conversationId)) {
      return res
        .status(400)
        .json({ message: "Valid conversationId is required." });
    }

    if (!orderId || !isValidId(orderId)) {
      return res.status(400).json({ message: "Valid orderId is required." });
    }

    const conversation = await Conversation.findById(conversationId)
      .select("customerId adminIds")
      .lean();

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    const order = await Order.findById(orderId).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const buyerId = String(order.user?.id || "");
    if (!buyerId || !isValidId(buyerId)) {
      return res.status(400).json({ message: "Order buyer is invalid." });
    }

    if (String(conversation.customerId) !== buyerId) {
      return res.status(400).json({
        message: "This order does not belong to the conversation customer.",
      });
    }

    if (order.order_status !== "completed") {
      return res.status(400).json({
        message: "Review request can only be sent for completed orders.",
      });
    }

    if (!order.isReviewEligible) {
      return res.status(400).json({
        message: "This order is not eligible for review.",
      });
    }

    if (order.isReviewed) {
      return res.status(400).json({
        message: "Review already submitted for this order.",
      });
    }

    const serviceId = String(order.service?.id || "");
    const serviceName = String(order.service?.name || "Service");
    const serviceType = String(order.service?.type || "");

    if (!serviceId) {
      return res
        .status(400)
        .json({ message: "Order service info is missing." });
    }

    let reviewRequest = await ReviewRequest.findOne({ orderId });

    const io = getIO();

    if (!reviewRequest) {
      reviewRequest = await ReviewRequest.create({
        conversationId,
        orderId,
        adminId: req.userId,
        buyerId,
        service: {
          id: serviceId,
          name: serviceName,
          type: serviceType,
        },
        requestMessage: "Share your honest feedback",
        status: "pending",
        requestCount: 1,
        requestedAt: new Date(),
      });

      if (io) {
        io.to(String(conversationId)).emit("reviewRequest:receive", {
          conversationId: String(conversationId),
          reviewRequest,
        });

        io.to(`user:${buyerId}`).emit("reviewRequest:receive", {
          conversationId: String(conversationId),
          reviewRequest,
        });

        io.to("admins").emit("admin:conversation:update", {
          conversationId: String(conversationId),
          type: "review-request",
          reviewRequest,
        });
      }

      const isBuyerActiveInConversation = isUserActiveInConversation(
        conversationId,
        buyerId,
      );

      if (!isBuyerActiveInConversation) {
        await sendNotify({
          title: "Review Request",
          message: `${serviceName} service share your honest feedback`,
          users: [buyerId],
          type: "review-request",
          link: "/chat",
        });
      }

      return res.status(201).json(reviewRequest);
    }

    reviewRequest.adminId = req.userId;
    reviewRequest.status = "pending";
    reviewRequest.reviewId = null;
    reviewRequest.reviewedAt = null;
    reviewRequest.requestedAt = new Date();
    reviewRequest.requestCount = Number(reviewRequest.requestCount || 0) + 1;
    reviewRequest.service = {
      id: serviceId,
      name: serviceName,
      type: serviceType,
    };

    await reviewRequest.save();

    if (io) {
      io.to(String(conversationId)).emit("reviewRequest:update", {
        conversationId: String(conversationId),
        reviewRequest,
      });

      io.to(`user:${buyerId}`).emit("reviewRequest:update", {
        conversationId: String(conversationId),
        reviewRequest,
      });

      io.to("admins").emit("admin:conversation:update", {
        conversationId: String(conversationId),
        type: "review-request",
        reviewRequest,
      });
    }

    const isBuyerActiveInConversation = isUserActiveInConversation(
      conversationId,
      buyerId,
    );

    if (!isBuyerActiveInConversation) {
      await sendNotify({
        title: "Review Request",
        message: `${serviceName} service share your honest feedback`,
        users: [buyerId],
        type: "review-request",
        link: "/chat",
      });
    }

    return res.status(200).json(reviewRequest);
  } catch (error) {
    next(error);
  }
};

export const getReviewRequests = async (req, res, next) => {
  try {
    const { conversationId } = req.query;

    if (!conversationId || !isValidId(conversationId)) {
      return res
        .status(400)
        .json({ message: "Valid conversationId is required." });
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

    const requests = await ReviewRequest.find({ conversationId }).sort({
      requestedAt: 1,
    });

    return res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};
