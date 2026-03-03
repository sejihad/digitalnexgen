import mongoose from "mongoose";

const OfferSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
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
    },

    // ✅ NEW
    gig: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
      },
      title: { type: String, required: true },
      subCategory: { type: String },
      coverImage: { type: String },
    },

    offerDetails: {
      description: { type: String, required: true },
      features: [{ type: String }],
      price: { type: Number, required: true },
      deliveryTime: { type: Number, required: true },
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Offer", OfferSchema);
