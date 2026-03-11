import mongoose from "mongoose";

const reviewRequestSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true, // 1 order = 1 review request doc
      index: true,
    },

    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    service: {
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        default: "",
      },
    },

    requestMessage: {
      type: String,
      default: "Share your honest feedback",
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "reviewed"],
      default: "pending",
      index: true,
    },

    requestCount: {
      type: Number,
      default: 1,
      min: 1,
    },

    requestedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("ReviewRequest", reviewRequestSchema);
