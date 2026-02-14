import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import Message from "./models/message.model.js";
// userId -> Set of socketIds (multi device / tab support)
const activeUsers = new Map();

export const initializeSocket = (httpServer, allowedOrigins) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    /* =========================
       USER AUTH & JOIN
    ==========================*/
    socket.on("user:join", (token) => {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        socket.userId = decoded.id;

        // join personal room (important)
        socket.join(`user:${decoded.id}`);

        // store active users (multi socket)
        if (!activeUsers.has(decoded.id)) {
          activeUsers.set(decoded.id, new Set());
        }
        activeUsers.get(decoded.id).add(socket.id);

        // broadcast online users
        io.emit("users:online", [...activeUsers.keys()]);
      } catch (err) {
        socket.disconnect(true);
      }
    });

    /* =========================
       JOIN CONVERSATION ROOM
    ==========================*/
    socket.on("conversation:join", (conversationId) => {
      socket.join(conversationId);
    });

    /* =========================
       SEND MESSAGE (REALTIME)
       (Message should be saved
        via REST API first)
    ==========================*/
    socket.on(
      "message:send",
      async ({ conversationId, receiverId, message }) => {
        if (!socket.userId) return;
        try {
          // message._id ধরি REST API থেকে response.data আসছে
          const populatedMessage = await Message.findById(message._id)
            .populate("userId", "username isAdmin img")
            .lean();
          io.to(`user:${receiverId}`).emit("message:receive", {
            conversationId,
            message: populatedMessage,
            senderId: socket.userId,
          });

          // optional confirmation
          socket.emit("message:sent", {
            success: true,
            message: populatedMessage,
          });
        } catch (err) {}
      },
    );

    /* =========================
       TYPING INDICATOR
    ==========================*/
    socket.on("typing:start", ({ conversationId }) => {
      socket.to(conversationId).emit("typing:update", {
        conversationId,
        userId: socket.userId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", ({ conversationId }) => {
      socket.to(conversationId).emit("typing:update", {
        conversationId,
        userId: socket.userId,
        isTyping: false,
      });
    });

    /* =========================
       DISCONNECT
    ==========================*/
    socket.on("disconnect", () => {
      if (socket.userId && activeUsers.has(socket.userId)) {
        const sockets = activeUsers.get(socket.userId);
        sockets.delete(socket.id);

        if (sockets.size === 0) {
          activeUsers.delete(socket.userId);
        }

        io.emit("users:online", [...activeUsers.keys()]);
      }
    });
  });

  return io;
};
