import mongoose from "mongoose";

const notifySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["message", "offer", "review-request", "order", "system"],
      default: "system",
      index: true,
    },

    link: {
      type: String,
      default: null,
    },

    image: {
      public_id: {
        type: String,
        default: "",
      },
      url: {
        type: String,
        default: "",
      },
    },

    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Notify", notifySchema);
