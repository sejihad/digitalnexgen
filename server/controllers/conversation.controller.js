import dotenv from "dotenv";
import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import User from "../models/user.model.js";
dotenv.config();

export const createConversation = async (req, res, next) => {
  try {
    // allow frontend to pass buyerId/adminId in body or infer from token
    const buyerId =
      req.body.buyerId ||
      req.query.buyerId ||
      (req.isAdmin ? req.body.buyerId : req.userId);
    const adminId =
      req.body.adminId ||
      req.query.adminId ||
      (req.isAdmin ? req.userId : req.body.adminId || req.body.to);

    if (!buyerId || !adminId) {
      return res
        .status(400)
        .json({ message: "buyerId and adminId are required" });
    }

    if (
      !mongoose.Types.ObjectId.isValid(buyerId) ||
      !mongoose.Types.ObjectId.isValid(adminId)
    ) {
      return res.status(400).json({ message: "Invalid buyerId or adminId" });
    }

    // Build a stable composite id required by schema (order-independent)
    const compositeId = [String(buyerId), String(adminId)].sort().join("");

    // check if conversation already exists between these two (by pair or composite id)
    const existingConversation = await Conversation.findOne({
      $or: [{ buyerId, adminId }, { id: compositeId }],
    });
    if (existingConversation) return res.status(200).json(existingConversation);

    const newConversation = new Conversation({
      id: compositeId,
      adminId,
      buyerId,
      readByAdmin: !!req.isAdmin,
      readByBuyer: !req.isAdmin,
    });

    const savedConversation = await newConversation.save();
    return res.status(201).json(savedConversation);
  } catch (error) {
    next(error);
  }
};

// Attach or upsert a service (gig) to a conversation's linkedServices
export const attachServiceToConversation = async (req, res, next) => {
  try {
    const convId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(convId)) {
      return res.status(400).json({ message: "Invalid conversation id" });
    }
    const { serviceId, title, subCategory, coverImage } = req.body || {};
    if (!serviceId)
      return res.status(400).json({ message: "serviceId is required" });

    const conv = await Conversation.findById(convId);
    if (!conv)
      return res.status(404).json({ message: "Conversation not found" });

    // Only participants or admins can modify
    const isParticipant =
      String(conv.buyerId) === String(req.userId) ||
      String(conv.adminId) === String(req.userId) ||
      !!req.isAdmin;
    if (!isParticipant) return res.status(403).json({ message: "Forbidden" });

    const existingIndex = (conv.linkedServices || []).findIndex(
      (s) => String(s.serviceId) === String(serviceId)
    );
    const newItem = {
      serviceId: String(serviceId),
      title: title || undefined,
      subCategory: subCategory || undefined,
      coverImage: coverImage || undefined,
      savedAt: new Date(),
    };

    if (existingIndex >= 0) {
      conv.linkedServices[existingIndex] = {
        ...(conv.linkedServices[existingIndex].toObject?.() ||
          conv.linkedServices[existingIndex]),
        ...newItem,
      };
    } else {
      conv.linkedServices = [newItem, ...(conv.linkedServices || [])];
    }

    await conv.save();
    return res.status(200).json({ linkedServices: conv.linkedServices });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    // support explicit query args for buyerId/adminId so frontend can search
    const { buyerId, adminId } = req.query;
    const filter = buyerId
      ? { buyerId }
      : adminId
      ? { adminId }
      : req.isAdmin
      ? { adminId: req.userId }
      : { buyerId: req.userId };

    const conversations = await Conversation.find(filter);
    return res.status(200).json(conversations);
  } catch (error) {
    next(error);
  }
};

export const getSingleConversation = async (req, res, next) => {
  try {
    const conversationId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation id" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });
    return res.status(200).json(conversation);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    next(error);
  }
};

export const updateConversation = async (req, res, next) => {
  try {
    const update = {};
    if (req.isAdmin) update.readByAdmin = true;
    else update.readByBuyer = true;

    const updatedConversation = await Conversation.findOneAndUpdate(
      { _id: req.params.id },
      { $set: update },
      { new: true }
    );

    if (!updatedConversation)
      return res.status(404).json({ message: "Conversation not found" });
    return res.status(200).json(updatedConversation);
  } catch (error) {
    console.error("Error updating conversation:", error);
    next(error);
  }
};

export const getConversationCount = async (req, res, next) => {
  try {
    const conversationCount = await Conversation.countDocuments(
      req.isAdmin ? { adminId: req.userId } : { buyerId: req.userId }
    );

    res.status(200).json({ count: conversationCount });
  } catch (error) {
    console.error("Error counting conversations:", error);
    next(error);
  }
};

// Admin: get all conversations across the platform with basic user info
export const getAllConversationsAdmin = async (req, res, next) => {
  try {
    if (!req.isAdmin) return res.status(403).json({ message: "Forbidden" });

    const conversations = await Conversation.find({})
      .populate("buyerId", "username email")
      .populate("adminId", "username email");

    return res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching all conversations:", error);
    next(error);
  }
};

// Admin: send SMS to the buyer of a conversation (requires TWILIO env vars)
export const sendSmsToConversation = async (req, res, next) => {
  try {
    if (!req.isAdmin) return res.status(403).json({ message: "Forbidden" });

    const convId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(convId))
      return res.status(400).json({ message: "Invalid conversation id" });

    const conversation = await Conversation.findById(convId);
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const buyer = await User.findById(conversation.buyerId);
    if (!buyer) return res.status(404).json({ message: "Buyer not found" });

    const phone = buyer.phone || buyer.mobile || buyer.phoneNumber;
    if (!phone)
      return res
        .status(400)
        .json({ message: "Buyer has no phone number on record" });

    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_PHONE_NUMBER
    ) {
      return res
        .status(501)
        .json({ message: "SMS service not configured on server" });
    }

    // dynamic import to avoid hard dependency when Twilio not installed
    const Twilio = await import("twilio");
    const client = Twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const { body } = req.body;
    if (!body || typeof body !== "string")
      return res.status(400).json({ message: "SMS body required" });

    const msg = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    // Optionally, record that an SMS was sent: update conversation.lastMessage
    await Conversation.findByIdAndUpdate(convId, {
      lastMessage: `[SMS sent] ${body}`,
    });

    return res.status(200).json({ message: "SMS sent", sid: msg.sid });
  } catch (error) {
    console.error("Error sending SMS:", error);
    next(error);
  }
};

// Delete a conversation by Mongo _id or composite id. Only participants may delete.
export const deleteConversation = async (req, res, next) => {
  try {
    const paramId = String(req.params.id || "");

    let conversation = null;
    if (mongoose.Types.ObjectId.isValid(paramId)) {
      conversation = await Conversation.findById(paramId);
    }
    if (!conversation) {
      conversation = await Conversation.findOne({ id: paramId });
    }
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    const isParticipant =
      String(conversation.buyerId) === String(req.userId) ||
      String(conversation.adminId) === String(req.userId);

    if (!isParticipant) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this conversation" });
    }

    await Conversation.deleteOne({ _id: conversation._id });
    return res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    next(error);
  }
};
