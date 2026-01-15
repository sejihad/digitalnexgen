import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http"; // <-- add this
import mongoose from "mongoose";
import passport from "passport";
import { Server } from "socket.io"; // <-- add this

import { stripeWebhook } from "./controllers/stripe.controller.js";
import authRoute from "./routes/auth.route.js";
import blogRoute from "./routes/blog.route.js";
import contactRoute from "./routes/contact.route.js";
import conversationRoute from "./routes/conversation.route.js";
import couponRoute from "./routes/coupon.route.js";
import galleryRoute from "./routes/gallery.route.js";
import messageRoute from "./routes/message.route.js";
import newsletterRought from "./routes/newsletter.route.js";
import offerRoute from "./routes/offer.route.js";
import orderRoute from "./routes/order.route.js";
import partnerRoute from "./routes/partner.route.js";
import paypalRoute from "./routes/paypal.route.js";
import projectRoute from "./routes/project.route.js";
import promotionalOfferRoute from "./routes/promotionalOffer.route.js";
import reviewRoute from "./routes/review.route.js";
import serviceRoute from "./routes/service.route.js";
import stripeRoute from "./routes/stripe.route.js";
import userRoute from "./routes/user.route.js";
import { connectPassport } from "./utils/passport.js";

dotenv.config();

const app = express();

// Stripe webhook
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

const allowedOrigins = [
  "https://digitalnexgen.co",
  "https://www.digitalnexgen.co",
  "http://localhost:5173",
  "https://digitalnexgen-ui.vercel.app",
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

connectPassport();
app.use(passport.initialize());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/services", serviceRoute);
app.use("/api/orders", orderRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/blogs", blogRoute);
app.use("/api/partners", partnerRoute);
app.use("/api/newsletters", newsletterRought);
app.use("/api/projects", projectRoute);
app.use("/api/offers", offerRoute);
app.use("/api/promotional-offers", promotionalOfferRoute);
app.use("/api/galleries", galleryRoute);
app.use("/api/stripe", stripeRoute);
app.use("/api/paypal", paypalRoute);
app.use("/api/coupon", couponRoute);
app.use("/api/contact", contactRoute);

// Error handler
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  return res.status(errorStatus).send(errorMessage);
});

// DB connect
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("DB is Connected...");
  } catch (error) {
    console.log(error);
  }
};

// --- Socket.IO setup ---
const httpServer = http.createServer(app); // <-- use HTTP server
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Simple Socket.IO example
io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  // Join conversation room
  socket.on("conversation:join", (conversationId) => {
    socket.join(conversationId);
    console.log(`User joined room: ${conversationId}`);
  });

  // Send message
  socket.on("message:send", ({ conversationId, message }) => {
    console.log("Message sent to room", conversationId, message);
    // Broadcast to all in room except sender
    socket
      .to(conversationId)
      .emit("message:receive", { conversationId, message });
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 8800;
httpServer.listen(PORT, () => {
  connectDB();
  console.log(`Backend server is running on port ${PORT}...`);
});
