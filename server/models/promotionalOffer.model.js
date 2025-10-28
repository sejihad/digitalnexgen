import mongoose from "mongoose";

const PromotionalOfferSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    discount: {
      type: String,
      required: true, // e.g., "50% OFF"
    },
    originalPrice: {
      type: Number,
      required: true,
    },
    offerPrice: {
      type: Number,
      required: true,
    },
    // Optional per-package offer prices. When provided, frontend can override gig package prices accordingly.
    offerPrices: {
      basic: { type: Number },
      standard: { type: Number },
      premium: { type: Number },
    },
    features: {
      type: [String],
      required: true,
    },
    badge: {
      type: String,
      default: "Special Offer",
    },
    imageUrl: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    // Reference to a Service (optional) so frontend can link an offer to a service/gig
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    category: {
      type: String,
      default: "General",
    },
    order: {
      type: Number,
      default: 0, // For sorting offers
    },
  },
  { timestamps: true }
);

export default mongoose.model("PromotionalOffer", PromotionalOfferSchema);
