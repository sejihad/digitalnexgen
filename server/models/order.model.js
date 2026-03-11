import mongoose from "mongoose";

const serviceOrderSchema = new mongoose.Schema(
  {
    service: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      type: { type: String, required: true },
      price: { type: Number, required: true },
      offer: {
        id: { type: String },
        title: { type: String },
        price: { type: Number },
        features: [String],
        description: { type: String },
      },
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    coupon: {
      code: String,
      discountPercent: Number,
      discountAmount: Number,
    },
    user: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: String,
      phone: String,
    },
    payment: {
      method: {
        type: String,
        enum: ["stripe", "paypal"],
        required: true,
      },
      transactionId: { type: String, required: true },
      status: { type: String, enum: ["pending", "paid"], default: "pending" },
    },
    order_status: {
      type: String,
      enum: ["pending", "in progress", "completed", "cancelled"],
      default: "pending",
    },
    cancel_request: {
      type: Boolean,
      default: false,
    },

    isReviewEligible: {
      type: Boolean,
      default: false,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);
serviceOrderSchema.index(
  { "payment.transactionId": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "payment.transactionId": { $exists: true, $type: "string" },
    },
  },
);
export default mongoose.model("Order", serviceOrderSchema);
