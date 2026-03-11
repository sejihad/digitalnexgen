import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";
import http from "http";
import mongoose from "mongoose";
import passport from "passport";
import "./config/passport.js";
import { initializePassport } from "./config/passport.js";
dotenv.config();

import { stripeWebhook } from "./controllers/stripe.controller.js";
import authRoute from "./routes/auth.route.js";
import blogRoute from "./routes/blog.route.js";
import contactRoute from "./routes/contact.route.js";
import conversationRoute from "./routes/conversation.route.js";
import couponRoute from "./routes/coupon.route.js";
import galleryRoute from "./routes/gallery.route.js";
import messageRoute from "./routes/message.route.js";
import newsletterRought from "./routes/newsletter.route.js";
import notifyRoute from "./routes/notify.route.js";
import offerRoute from "./routes/offer.route.js";
import orderRoute from "./routes/order.route.js";
import partnerRoute from "./routes/partner.route.js";
import paypalRoute from "./routes/paypal.route.js";
import projectRoute from "./routes/project.route.js";
import promotionalOfferRoute from "./routes/promotionalOffer.route.js";
import reviewRoute from "./routes/review.route.js";
import reviewRequestRoute from "./routes/reviewRequest.route.js";
import serviceRoute from "./routes/service.route.js";
import statisticRoute from "./routes/statistic.route.js";
import stripeRoute from "./routes/stripe.route.js";
import userRoute from "./routes/user.route.js";

// ✅ তোমার socket initializer import করো
import "./services/notifyCleanup.cron.js";
import { initializeSocket } from "./socket.js"; // <-- তোমার ফাইল নাম অনুযায়ী path ঠিক করো

const app = express();

const allowedOrigins = [
  "https://digitalnexgen.co",
  "https://www.digitalnexgen.co",
  "http://localhost:5173",
  "https://digitalnexgen-ui.vercel.app",
];

// ✅ CORS
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// ✅ Stripe webhook must be RAW (keep this BEFORE express.json)
app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

initializePassport();
app.use(passport.initialize());

// middlewares
app.use(fileUpload());
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

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
app.use("/api/notifies", notifyRoute);
app.use("/api/review-requests", reviewRequestRoute);
app.use("/api/promotional-offers", promotionalOfferRoute);
app.use("/api/galleries", galleryRoute);
app.use("/api/stripe", stripeRoute);
app.use("/api/paypal", paypalRoute);
app.use("/api/coupon", couponRoute);
app.use("/api/contact", contactRoute);
app.use("/api/statistic", statisticRoute);

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

// ✅ HTTP server
const httpServer = http.createServer(app);

// ✅ IMPORTANT: only ONE socket server
initializeSocket(httpServer, allowedOrigins);

// Start server
const PORT = process.env.PORT || 8800;
httpServer.listen(PORT, async () => {
  await connectDB();
  console.log(`Backend server is running on port ${PORT}...`);
});
