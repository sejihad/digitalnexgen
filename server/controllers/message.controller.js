import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getIO } from "../socketInstance.js";
export const createMessage = async (req, res) => {
  try {
    const { conversationId, message } = req.body || {};

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Valid conversationId required" });
    }
    const text = String(message || "").trim();
    if (!text) {
      return res.status(400).json({ message: "Message is required" });
    }

    const conv = await Conversation.findById(conversationId);
    if (!conv) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const meId = String(req.userId || "");
    const isCustomer = String(conv.customerId) === meId;
    const isAdmin = !!req.isAdmin;

    // ✅ Authorization:
    // - customer can send only to his own conversation
    // - admin can send (support) - allow any admin role
    if (!isCustomer && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // ✅ Auto-assign admin when customer sends first message and no admins assigned
    // (এইটা তোমার কথামতো: message create এর সময় first admin fetch করে connect করে দেয়া)
    if (isCustomer && (!conv.adminIds || conv.adminIds.length === 0)) {
      const firstAdmin = await User.findOne({ isAdmin: true }).select("_id");
      if (firstAdmin?._id) {
        conv.adminIds = [firstAdmin._id];
      }
    }

    // ✅ If sender is admin and not already in adminIds -> add him
    if (isAdmin) {
      const already =
        Array.isArray(conv.adminIds) &&
        conv.adminIds.some((a) => String(a) === meId);

      if (!already) {
        conv.adminIds = Array.isArray(conv.adminIds) ? conv.adminIds : [];
        conv.adminIds.push(new mongoose.Types.ObjectId(meId));
      }
    }

    // ✅ Save message
    const newMessage = await Message.create({
      conversationId: conv._id,
      userId: new mongoose.Types.ObjectId(meId),
      message: text,
    });

    // ✅ Update conversation lastMessage + read flags
    // customer sends => admins unread
    // admin sends => customer unread
    conv.lastMessage = text;

    if (isCustomer) {
      conv.readByCustomer = true;
      conv.readByAdmins = false;
    } else {
      // admin
      conv.readByAdmins = true;
      conv.readByCustomer = false;
    }

    await conv.save();

    // ✅ Populate sender info like your UI expects
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("userId", "username name isAdmin img")
      .lean();
    const io = getIO();
    if (io) {
      // ✅ open chat room users
      io.to(String(conv._id)).emit("message:receive", {
        conversationId: String(conv._id),
        message: populatedMessage,
        senderId: meId,
      });

      // ✅ all admins list realtime
      io.to("admins").emit("admin:conversation:update", {
        conversationId: String(conv._id),
        message: populatedMessage,
        senderId: meId,
      });

      // ✅ personal push (optional)
      io.to(`user:${String(conv.customerId)}`).emit("message:receive", {
        conversationId: String(conv._id),
        message: populatedMessage,
        senderId: meId,
      });
    }
    return res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("createMessage error:", error);
    return res
      .status(500)
      .json({ message: "Error saving message", error: error.message });
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const convId = req.params.id;

    if (!convId || !mongoose.Types.ObjectId.isValid(convId)) {
      return res
        .status(400)
        .json({ message: "Valid conversation id required" });
    }

    // ✅ Optional: authorization check (recommended)
    const conv = await Conversation.findById(convId).select(
      "customerId adminIds",
    );
    if (!conv)
      return res.status(404).json({ message: "Conversation not found" });

    const meId = String(req.userId || "");
    const isCustomer = String(conv.customerId) === meId;
    const isAdmin = !!req.isAdmin;

    if (!isCustomer && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const messages = await Message.find({ conversationId: convId })
      .populate("userId", "username name isAdmin img")
      .sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
};
