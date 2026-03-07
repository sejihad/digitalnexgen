import dotenv from "dotenv";
import mongoose from "mongoose";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { getIO } from "../socketInstance.js";
dotenv.config();
const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id));

/**
 * ✅ Create OR Get a conversation
 * Rules:
 * - customer: always uses req.userId as customerId
 * - admin: can pass customerId in body/query; also auto-joins adminIds
 * - returns the conversation (existing or newly created)
 *
 * Body options:
 * - customerId (admin only, required for admin create/open)
 * - service (optional) {serviceId, title, subCategory, coverImage}
 */
export const createOrGetConversation = async (req, res, next) => {
  try {
    const me = String(req.userId || "");
    if (!isValidId(me)) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // customerId determine
    const customerId = req.isAdmin
      ? String(req.body.customerId || req.query.customerId || "")
      : me;

    if (!customerId || !isValidId(customerId)) {
      return res.status(400).json({ message: "Valid customerId is required" });
    }

    // ✅ find existing conversation for that customer
    let conv = await Conversation.findOne({ customerId });

    // create if not exist
    if (!conv) {
      conv = await Conversation.create({
        customerId,
        adminIds: req.isAdmin ? [me] : [], // admin হলে auto-join, user হলে empty
        readByCustomer: !req.isAdmin, // customer create করলে customer read true
        readByAdmins: req.isAdmin, // admin create করলে admins read true
        lastMessage: "",
        linkedServices: [],
      });
    } else {
      // ✅ if admin opens, ensure admin is added in adminIds
      if (req.isAdmin) {
        const already = (conv.adminIds || []).some((a) => String(a) === me);
        if (!already) {
          conv.adminIds = [me, ...(conv.adminIds || [])];
        }
      }
      await conv.save();
    }

    // ✅ optional: attach service in same call
    const s = req.body?.service || null;
    if (s?.serviceId) {
      const exists = (conv.linkedServices || []).some(
        (x) => String(x.serviceId) === String(s.serviceId),
      );
      if (!exists) {
        conv.linkedServices = [
          {
            serviceId: String(s.serviceId),
            title: s.title || undefined,
            subCategory: s.subCategory || undefined,
            coverImage: s.coverImage || undefined,
            savedAt: new Date(),
          },
          ...(conv.linkedServices || []),
        ];
        await conv.save();
      }
    }

    return res.status(200).json(conv);
  } catch (error) {
    console.error("createOrGetConversation error:", error);
    next(error);
  }
};

/**
 * ✅ Attach a service/gig to conversation
 * - participants only (customer OR joined admin)
 * - serviceId optional in schema but endpoint expects it if called
 */
export const attachServiceToConversation = async (req, res, next) => {
  try {
    const convId = String(req.params.id || "");
    if (!isValidId(convId)) {
      return res.status(400).json({ message: "Invalid conversation id" });
    }

    const { serviceId, title, subCategory, coverImage } = req.body || {};
    if (!serviceId) {
      return res.status(400).json({ message: "serviceId is required" });
    }

    const conv = await Conversation.findById(convId);
    if (!conv)
      return res.status(404).json({ message: "Conversation not found" });

    const me = String(req.userId || "");
    const isCustomer = String(conv.customerId) === me;
    const isJoinedAdmin = (conv.adminIds || []).some((a) => String(a) === me);

    if (!isCustomer && !isJoinedAdmin && !req.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const idx = (conv.linkedServices || []).findIndex(
      (x) => String(x.serviceId) === String(serviceId),
    );

    const newItem = {
      serviceId: String(serviceId),
      title: title || undefined,
      subCategory: subCategory || undefined,
      coverImage: coverImage || undefined,
      savedAt: new Date(),
    };

    if (idx >= 0) {
      conv.linkedServices[idx] = {
        ...(conv.linkedServices[idx] || {}),
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

/**
 * ✅ Get conversations list
 * - customer: only their one conversation (if exists)
 * - admin: conversations where adminIds contains them
 * - optional query:
 *    - customerId (admin only) -> fetch that user's conversation
 */
export const getConversations = async (req, res, next) => {
  try {
    const me = String(req.userId || "");
    if (!isValidId(me))
      return res.status(401).json({ message: "Unauthorized" });

    const customerIdQuery = String(req.query.customerId || "");
    if (customerIdQuery) {
      if (!req.isAdmin) return res.status(403).json({ message: "Forbidden" });
      if (!isValidId(customerIdQuery))
        return res.status(400).json({ message: "Invalid customerId" });

      const conv = await Conversation.findOne({
        customerId: customerIdQuery,
      }).sort({ updatedAt: -1 });
      return res.status(200).json(conv ? [conv] : []);
    }

    if (req.isAdmin) {
      const convs = await Conversation.find({})
        .sort({ updatedAt: -1 })
        .populate("customerId", "username name email img")
        .populate("adminIds", "username name email img");
      return res.status(200).json(convs);
    }

    const conv = await Conversation.findOne({ customerId: me }).sort({
      updatedAt: -1,
    });
    return res.status(200).json(conv ? [conv] : []);
  } catch (error) {
    next(error);
  }
};

export const getSingleConversation = async (req, res, next) => {
  try {
    const convId = String(req.params.id || "");
    if (!isValidId(convId)) {
      return res.status(400).json({ message: "Invalid conversation id" });
    }

    const conv = await Conversation.findById(convId)
      .populate("customerId", "username name email img")
      .populate("adminIds", "username name email img");

    if (!conv)
      return res.status(404).json({ message: "Conversation not found" });

    const me = String(req.userId || "");
    const isCustomer = String(conv.customerId?._id || conv.customerId) === me;
    const isJoinedAdmin = (conv.adminIds || []).some(
      (a) => String(a?._id || a) === me,
    );

    if (!isCustomer && !isJoinedAdmin && !req.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json(conv);
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Mark read
 * - customer: readByCustomer = true
 * - admin: readByAdmins = true
 */
export const markConversationRead = async (req, res, next) => {
  try {
    const convId = String(req.params.id || "");
    if (!isValidId(convId)) {
      return res.status(400).json({ message: "Invalid conversation id" });
    }

    const conv = await Conversation.findById(convId);
    if (!conv)
      return res.status(404).json({ message: "Conversation not found" });

    const me = String(req.userId || "");
    const isCustomer = String(conv.customerId) === me;
    const isJoinedAdmin = (conv.adminIds || []).some((a) => String(a) === me);

    if (!isCustomer && !isJoinedAdmin && !req.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (isCustomer && !req.isAdmin) conv.readByCustomer = true;
    if (req.isAdmin || isJoinedAdmin) conv.readByAdmins = true;

    await conv.save();
    const io = getIO();

    if (req.isAdmin || isJoinedAdmin) {
      io.to("admins").emit("admin:conversation:update", {
        conversationId: String(conv._id),
        readByAdmins: true,
        updatedAt: conv.updatedAt,
        type: "read",
        readerId: me,
      });
    }

    if (isCustomer && !req.isAdmin) {
      io.to(`user:${conv.customerId}`).emit("conversation:read", {
        conversationId: String(conv._id),
        readByCustomer: true,
        updatedAt: conv.updatedAt,
        type: "read",
        readerId: me,
      });
    }
    return res.status(200).json(conv);
  } catch (error) {
    next(error);
  }
};

export const getConversationCount = async (req, res, next) => {
  try {
    const me = String(req.userId || "");
    if (!isValidId(me))
      return res.status(401).json({ message: "Unauthorized" });

    if (req.isAdmin) {
      const count = await Conversation.countDocuments({ adminIds: me });
      return res.status(200).json({ count });
    }

    const count = await Conversation.countDocuments({ customerId: me });
    return res.status(200).json({ count });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Admin: list all conversations across platform
 */
export const getAllConversationsAdmin = async (req, res, next) => {
  try {
    if (!req.isAdmin) return res.status(403).json({ message: "Forbidden" });

    const convs = await Conversation.find({})
      .sort({ updatedAt: -1 })
      .populate("customerId", "username name email img")
      .populate("adminIds", "username name email img");

    return res.status(200).json(convs);
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Admin: send SMS to customer
 * (same logic, but now customerId field)
 */
export const sendSmsToConversation = async (req, res, next) => {
  try {
    if (!req.isAdmin) return res.status(403).json({ message: "Forbidden" });

    const convId = String(req.params.id || "");
    if (!isValidId(convId))
      return res.status(400).json({ message: "Invalid conversation id" });

    const conv = await Conversation.findById(convId);
    if (!conv)
      return res.status(404).json({ message: "Conversation not found" });

    const customer = await User.findById(conv.customerId);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });

    const phone = customer.phone || customer.mobile || customer.phoneNumber;
    if (!phone) {
      return res
        .status(400)
        .json({ message: "Customer has no phone number on record" });
    }

    if (
      !process.env.TWILIO_ACCOUNT_SID ||
      !process.env.TWILIO_AUTH_TOKEN ||
      !process.env.TWILIO_PHONE_NUMBER
    ) {
      return res
        .status(501)
        .json({ message: "SMS service not configured on server" });
    }

    const { body } = req.body;
    if (!body || typeof body !== "string") {
      return res.status(400).json({ message: "SMS body required" });
    }

    const Twilio = await import("twilio");
    const client = Twilio.default(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );

    const msg = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    conv.lastMessage = `[SMS sent] ${body}`;
    await conv.save();

    return res.status(200).json({ message: "SMS sent", sid: msg.sid });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Delete conversation
 * - customer OR joined admin can delete
 */
export const deleteConversation = async (req, res, next) => {
  try {
    const convId = String(req.params.id || "");
    if (!isValidId(convId)) {
      return res.status(400).json({ message: "Invalid conversation id" });
    }

    const conv = await Conversation.findById(convId);
    if (!conv)
      return res.status(404).json({ message: "Conversation not found" });

    const me = String(req.userId || "");
    const isCustomer = String(conv.customerId) === me;
    const isJoinedAdmin = (conv.adminIds || []).some((a) => String(a) === me);

    if (!isCustomer && !isJoinedAdmin && !req.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    // ✅ Step 2 fix: delete messages first
    await Message.deleteMany({ conversationId: conv._id });

    // ✅ then delete conversation
    await Conversation.deleteOne({ _id: conv._id });

    return res.status(200).json({ message: "Conversation deleted" });
  } catch (error) {
    next(error);
  }
};
