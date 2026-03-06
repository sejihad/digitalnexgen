import cookie from "cookie";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Server } from "socket.io";
import { setIO } from "./socketInstance.js";

import Conversation from "./models/conversation.model.js";
import Message from "./models/message.model.js";
import User from "./models/user.model.js";

// userId -> Set(socketId)
const activeUsers = new Map();

const safeStr = (v) => String(v ?? "");
const isValidId = (id) => mongoose.Types.ObjectId.isValid(String(id));

export const initializeSocket = (httpServer, allowedOrigins) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ✅ Cookie-based auth middleware
  io.use((socket, next) => {
    try {
      const raw = socket.handshake.headers?.cookie || "";
      const parsed = cookie.parse(raw);
      const token = parsed.accessToken;

      if (!token) return next(new Error("Unauthorized"));

      const decoded = jwt.verify(token, process.env.JWT_KEY);

      socket.userId = safeStr(decoded.id);
      socket.isAdmin = !!decoded.isAdmin;

      if (!socket.userId) return next(new Error("Unauthorized"));

      return next();
    } catch (e) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log(
      "[socket] connected:",
      socket.userId,
      "isAdmin:",
      socket.isAdmin,
    );
    if (socket.isAdmin)
      console.log("[socket] joined room admins:", socket.userId);
    // ✅ Personal room
    socket.join(`user:${socket.userId}`);

    // ✅ Admin global room (all admins)
    if (socket.isAdmin) {
      socket.join("admins");
    }

    // online tracking
    if (!activeUsers.has(socket.userId))
      activeUsers.set(socket.userId, new Set());
    activeUsers.get(socket.userId).add(socket.id);

    // ✅ privacy-safe: don't leak userIds
    io.emit("users:online", { count: activeUsers.size });

    /* ===== JOIN CONVERSATION ROOM (authorized) ===== */
    socket.on("conversation:join", async (conversationId) => {
      try {
        const cid = safeStr(conversationId);
        if (!isValidId(cid)) return;

        // admin can join any conversation
        if (socket.isAdmin) {
          socket.join(cid);
          return;
        }

        const conv = await Conversation.findById(cid)
          .select("customerId adminIds")
          .lean();

        if (!conv) return;

        const isCustomer = safeStr(conv.customerId) === socket.userId;
        const isJoinedAdmin =
          Array.isArray(conv.adminIds) &&
          conv.adminIds.some((a) => safeStr(a) === socket.userId);

        if (!isCustomer && !isJoinedAdmin) return;

        socket.join(cid);
      } catch {
        // ignore
      }
    });

    socket.on("conversation:leave", (conversationId) => {
      const cid = safeStr(conversationId);
      if (!cid) return;
      socket.leave(cid);
    });

    /* ===== SEND MESSAGE (create in DB + emit) ===== */
    socket.on("message:send", async ({ conversationId, text }) => {
      console.log("=".repeat(50));
      console.log("📤 STEP 1: Message send received on server");
      console.log("   From:", socket.userId);
      console.log("   To Conversation:", conversationId);
      console.log("   Text:", text);
      try {
        const cid = safeStr(conversationId);
        const msgText = safeStr(text).trim();

        if (!isValidId(cid) || !msgText) return;

        const conv = await Conversation.findById(cid);
        if (!conv) return;

        const isCustomer = safeStr(conv.customerId) === socket.userId;

        // ✅ policy: admin can send to any conversation
        // customer only to own conversation
        if (!isCustomer && !socket.isAdmin) return;

        // ✅ auto-assign first admin if customer sends and none exists
        if (isCustomer && (!conv.adminIds || conv.adminIds.length === 0)) {
          const firstAdmin = await User.findOne({ isAdmin: true }).select(
            "_id",
          );
          if (firstAdmin?._id) conv.adminIds = [firstAdmin._id];
        }

        // ✅ if sender admin and not in adminIds -> add
        if (socket.isAdmin) {
          const already =
            Array.isArray(conv.adminIds) &&
            conv.adminIds.some((a) => safeStr(a) === socket.userId);

          if (!already) {
            conv.adminIds = Array.isArray(conv.adminIds) ? conv.adminIds : [];
            conv.adminIds.push(new mongoose.Types.ObjectId(socket.userId));
          }
        }

        // ✅ create message
        const newMessage = await Message.create({
          conversationId: conv._id,
          userId: new mongoose.Types.ObjectId(socket.userId),
          message: msgText,
        });

        // ✅ update conversation flags
        conv.lastMessage = msgText;
        if (isCustomer) {
          conv.readByCustomer = true;
          conv.readByAdmins = false;
        } else {
          conv.readByAdmins = true;
          conv.readByCustomer = false;
        }
        await conv.save();

        const populatedMessage = await Message.findById(newMessage._id)
          .populate("userId", "username name isAdmin img")
          .lean();

        // participants for push
        const customerId = safeStr(conv.customerId);
        const adminIds = Array.isArray(conv.adminIds)
          ? conv.adminIds.map((a) => safeStr(a))
          : [];

        const targets = [customerId, ...adminIds]
          .filter(Boolean)
          .filter((id) => id !== socket.userId);

        // A) room broadcast (open chat users)
        io.to(cid).emit("message:receive", {
          conversationId: cid,
          message: populatedMessage,
          senderId: socket.userId,
        });

        // B) personal push (online but not joined)
        for (const uid of targets) {
          io.to(`user:${uid}`).emit("message:receive", {
            conversationId: cid,
            message: populatedMessage,
            senderId: socket.userId,
          });
        }

        // C) admin list realtime update (all admins)
        io.to("admins").emit("admin:conversation:update", {
          conversationId: cid,
          message: populatedMessage,
          senderId: socket.userId,
        });

        socket.emit("message:sent", {
          success: true,
          message: populatedMessage,
        });
      } catch {
        socket.emit("message:sent", { success: false });
      }
    });

    /* ===== TYPING (only if joined the room) ===== */
    socket.on("typing:start", ({ conversationId }) => {
      const cid = safeStr(conversationId);
      if (!cid) return;
      if (!socket.rooms.has(cid)) return; // ✅ prevent spam
      socket.to(cid).emit("typing:update", {
        conversationId: cid,
        userId: socket.userId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      const cid = safeStr(conversationId);
      if (!cid) return;
      if (!socket.rooms.has(cid)) return; // ✅ prevent spam
      socket.to(cid).emit("typing:update", {
        conversationId: cid,
        userId: socket.userId,
        isTyping: false,
      });
    });

    /* ===== DISCONNECT ===== */
    socket.on("disconnect", () => {
      if (activeUsers.has(socket.userId)) {
        const sockets = activeUsers.get(socket.userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) activeUsers.delete(socket.userId);
      }
      io.emit("users:online", { count: activeUsers.size });
    });
  });

  setIO(io);
  return io;
};
