import { Server } from "socket.io";

const activeUsers = new Map(); // Store active users: userId -> socketId

export const initializeSocket = (httpServer, allowedOrigins) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ User connected:", socket.id);

    // User joins with their ID
    socket.on("user:join", (userId) => {
      activeUsers.set(userId, socket.id);
      console.log(`User ${userId} joined with socket ${socket.id}`);
      
      // Broadcast online users
      io.emit("users:online", Array.from(activeUsers.keys()));
    });

    // Send message
    socket.on("message:send", (data) => {
      const { conversationId, receiverId, message } = data;
      
      // Send to specific user if online
      const receiverSocketId = activeUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("message:receive", {
          conversationId,
          message,
        });
      }
      
      // Also send back to sender for confirmation
      socket.emit("message:sent", { success: true, message });
    });

    // Typing indicator
    socket.on("typing:start", ({ conversationId, userId }) => {
      socket.broadcast.emit("typing:update", { conversationId, userId, isTyping: true });
    });

    socket.on("typing:stop", ({ conversationId, userId }) => {
      socket.broadcast.emit("typing:update", { conversationId, userId, isTyping: false });
    });

    // User disconnects
    socket.on("disconnect", () => {
      // Remove user from active users
      for (const [userId, socketId] of activeUsers.entries()) {
        if (socketId === socket.id) {
          activeUsers.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
      
      // Broadcast updated online users
      io.emit("users:online", Array.from(activeUsers.keys()));
    });
  });

  console.log("🔌 Socket.IO server initialized");
  return io;
};
